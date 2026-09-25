#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use arboard::Clipboard;
use std::collections::HashMap;
use std::env;
use std::fs;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use tauri::{
  ipc::CapabilityBuilder,
  webview::{NewWindowResponse, WebviewWindowBuilder},
  Manager, State, Url, WebviewUrl,
};
use tauri_plugin_deep_link::DeepLinkExt;
use tauri_plugin_global_shortcut::{
  Builder as GlobalShortcutBuilder, GlobalShortcutExt, ShortcutState,
};
use tauri_plugin_notification::NotificationExt;

const DEV_APP_URL: &str = "http://localhost:5055";
const PROD_APP_URL: &str = "https://desktop.vocorbit.com";
const DESKTOP_SHELL_QUERY_KEY: &str = "desktopShell";
const DESKTOP_SHELL_QUERY_VALUE: &str = "tauri";
const DESKTOP_AUTH_PROVIDER_QUERY_KEY: &str = "desktopAuthProvider";
const DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY: &str = "desktopFirebaseIdToken";
const DESKTOP_APP_VERSION_QUERY_KEY: &str = "desktopAppVersion";
const DESKTOP_APP_VERSION_QUERY_VALUE: &str = "2026-04-05-2";
const DESKTOP_QUICK_LOOKUP_TEXT_QUERY_KEY: &str = "desktopQuickLookupText";
const DESKTOP_QUICK_LOOKUP_OPENED_AT_QUERY_KEY: &str = "desktopQuickLookupOpenedAt";
const DESKTOP_DEEP_LINK_SCHEME: &str = "vocorbit-desktop";
const QUICK_LOOKUP_WINDOW_LABEL: &str = "quick-lookup";
const QUICK_LOOKUP_WINDOW_TITLE: &str = "VocOrbit Quick Lookup";
const QUICK_LOOKUP_WINDOW_PATH: &str = "/quick-lookup";
const DEFAULT_QUICK_LOOKUP_SHORTCUT: &str = "CommandOrControl+Shift+L";
const QUICK_LOOKUP_SHORTCUT_CONFIG_FILE: &str = "quick-lookup-shortcut.txt";
const DESKTOP_SHELL_INIT_SCRIPT: &str = r#"
window.__VOCORBIT_DESKTOP_SHELL__ = true;
window.__VOCORBIT_DESKTOP_BRIDGE__ = true;
window.isTauri = true;
window.__VOCORBIT_INVOKE__ = (command, args) => {
  const invoke = window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke;
  if (typeof invoke !== "function") {
    throw new Error("Tauri invoke bridge unavailable");
  }
  return invoke(command, args);
};
window.__VOCORBIT_READ_CLIPBOARD_TEXT__ = () => window.__VOCORBIT_INVOKE__("read_clipboard_text");
sessionStorage.setItem("vocorbit.desktopShellRuntime", "tauri");
"#;
static POPUP_COUNTER: AtomicUsize = AtomicUsize::new(0);

struct QuickLookupShortcutState(Mutex<String>);
struct RepeatNotificationSchedulerState(Mutex<HashMap<String, Arc<AtomicBool>>>);

#[tauri::command]
fn read_clipboard_text() -> Result<String, String> {
  let mut clipboard = Clipboard::new().map_err(|error| error.to_string())?;
  clipboard.get_text().map_err(|error| error.to_string())
}

#[tauri::command]
fn focus_main_window(app: tauri::AppHandle, path: Option<String>) -> Result<(), String> {
  let window = app
    .get_webview_window("main")
    .ok_or_else(|| "Main window is unavailable".to_string())?;

  if let Some(path) = path {
    let trimmed = path.trim();
    if !trimmed.is_empty() {
      let mut url = runtime_base_url();
      url.set_path(trimmed);
      {
        let mut pairs = url.query_pairs_mut();
        pairs.append_pair(DESKTOP_SHELL_QUERY_KEY, DESKTOP_SHELL_QUERY_VALUE);
        pairs.append_pair(DESKTOP_APP_VERSION_QUERY_KEY, DESKTOP_APP_VERSION_QUERY_VALUE);
      }
      window.navigate(url).map_err(|error| error.to_string())?;
    }
  }

  let _ = window.unminimize();
  let _ = window.show();
  let _ = window.set_focus();
  Ok(())
}

#[tauri::command]
fn close_quick_lookup_window(app: tauri::AppHandle) -> Result<(), String> {
  if let Some(window) = app.get_webview_window(QUICK_LOOKUP_WINDOW_LABEL) {
    window.close().map_err(|error| error.to_string())?;
  }
  Ok(())
}

#[tauri::command]
fn get_quick_lookup_shortcut(
  state: State<'_, QuickLookupShortcutState>,
) -> Result<String, String> {
  Ok(state.0.lock().map_err(|error| error.to_string())?.clone())
}

#[tauri::command]
fn set_quick_lookup_shortcut<R: tauri::Runtime>(
  app: tauri::AppHandle<R>,
  state: State<'_, QuickLookupShortcutState>,
  shortcut: String,
) -> Result<String, String> {
  let normalized = normalize_shortcut_value(&shortcut)
    .ok_or_else(|| "Shortcut cannot be empty".to_string())?;

  let mut current = state.0.lock().map_err(|error| error.to_string())?;
  let previous = current.clone();

  if normalized == previous {
    return Ok(previous);
  }

  register_quick_lookup_shortcut(&app, &normalized)?;

  if app.global_shortcut().is_registered(previous.as_str()) {
    app
      .global_shortcut()
      .unregister(previous.as_str())
      .map_err(|error| error.to_string())?;
  }

  save_quick_lookup_shortcut(&app, &normalized)?;
  *current = normalized.clone();

  Ok(normalized)
}

fn cancel_repeat_notification_inner(
  state: &RepeatNotificationSchedulerState,
  notification_id: &str,
) {
  let normalized_notification_id = notification_id.trim();
  if normalized_notification_id.is_empty() {
    return;
  }

  if let Ok(mut scheduled_notifications) = state.0.lock() {
    if let Some(cancelled) = scheduled_notifications.remove(normalized_notification_id) {
      cancelled.store(true, Ordering::SeqCst);
    }
  }
}

fn desktop_repeat_notification_sound() -> Option<&'static str> {
  #[cfg(target_os = "macos")]
  {
    return Some("Ping");
  }

  #[cfg(target_os = "linux")]
  {
    return Some("message-new-instant");
  }

  #[allow(unreachable_code)]
  None
}

#[tauri::command]
fn cancel_repeat_notification(
  state: State<'_, RepeatNotificationSchedulerState>,
  notification_id: String,
) -> Result<(), String> {
  cancel_repeat_notification_inner(&state, &notification_id);
  Ok(())
}

#[tauri::command]
fn schedule_repeat_notification<R: tauri::Runtime>(
  app: tauri::AppHandle<R>,
  state: State<'_, RepeatNotificationSchedulerState>,
  notification_id: String,
  title: String,
  body: String,
  due_at_ms: i64,
) -> Result<String, String> {
  let normalized_title = title.trim().to_string();
  if normalized_title.is_empty() {
    return Err("Notification title is required".to_string());
  }

  let normalized_notification_id = notification_id.trim().to_string();
  if normalized_notification_id.is_empty() {
    return Err("Notification id is required".to_string());
  }

  cancel_repeat_notification_inner(&state, &normalized_notification_id);

  let cancel_flag = Arc::new(AtomicBool::new(false));
  {
    let mut scheduled_notifications = state.0.lock().map_err(|error| error.to_string())?;
    scheduled_notifications.insert(normalized_notification_id.clone(), cancel_flag.clone());
  }

  let app_handle = app.clone();
  let notification_title = normalized_title.clone();
  let notification_body = body.trim().to_string();
  let notification_id_for_cleanup = normalized_notification_id.clone();
  let due_in_ms = due_at_ms.saturating_sub(
    SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .map(|duration| duration.as_millis() as i64)
      .unwrap_or(0),
  );
  let wait_duration = Duration::from_millis(due_in_ms.max(1_000) as u64);

  std::thread::spawn(move || {
    std::thread::sleep(wait_duration);

    if cancel_flag.load(Ordering::SeqCst) {
      return;
    }

    let mut builder = app_handle.notification().builder().title(notification_title);
    if !notification_body.is_empty() {
      builder = builder.body(notification_body);
    }
    if let Some(sound) = desktop_repeat_notification_sound() {
      builder = builder.sound(sound);
    }
    let _ = builder.show();

    if let Some(state) = app_handle.try_state::<RepeatNotificationSchedulerState>() {
      cancel_repeat_notification_inner(&state, &notification_id_for_cleanup);
    }
  });

  Ok(normalized_notification_id)
}

fn runtime_base_url() -> Url {
  let app_url = if let Ok(override_url) = env::var("VOCORBIT_DESKTOP_APP_URL") {
    let trimmed = override_url.trim();
    if !trimmed.is_empty() {
      return trimmed.parse().expect("invalid VOCORBIT_DESKTOP_APP_URL");
    }
    if cfg!(debug_assertions) {
      DEV_APP_URL
    } else {
      PROD_APP_URL
    }
  } else if cfg!(debug_assertions) {
    DEV_APP_URL
  } else {
    PROD_APP_URL
  };

  app_url
    .parse()
    .expect("invalid app url")
}

fn normalize_shortcut_value(value: &str) -> Option<String> {
  let normalized = value.trim().replace(' ', "");
  if normalized.is_empty() {
    None
  } else {
    Some(normalized)
  }
}

fn quick_lookup_shortcut_config_path<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
) -> Result<PathBuf, String> {
  let config_dir = app.path().app_config_dir().map_err(|error| error.to_string())?;
  Ok(config_dir.join(QUICK_LOOKUP_SHORTCUT_CONFIG_FILE))
}

fn load_quick_lookup_shortcut<R: tauri::Runtime>(app: &tauri::AppHandle<R>) -> String {
  let Ok(path) = quick_lookup_shortcut_config_path(app) else {
    return DEFAULT_QUICK_LOOKUP_SHORTCUT.to_string();
  };

  let Ok(value) = fs::read_to_string(path) else {
    return DEFAULT_QUICK_LOOKUP_SHORTCUT.to_string();
  };

  normalize_shortcut_value(&value).unwrap_or_else(|| DEFAULT_QUICK_LOOKUP_SHORTCUT.to_string())
}

fn save_quick_lookup_shortcut<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  shortcut: &str,
) -> Result<(), String> {
  let path = quick_lookup_shortcut_config_path(app)?;
  if let Some(parent) = path.parent() {
    fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }
  fs::write(path, shortcut).map_err(|error| error.to_string())
}

fn runtime_url() -> Url {
  let mut url = runtime_base_url();
  {
    let mut pairs = url.query_pairs_mut();
    pairs.append_pair(DESKTOP_SHELL_QUERY_KEY, DESKTOP_SHELL_QUERY_VALUE);
    pairs.append_pair(DESKTOP_APP_VERSION_QUERY_KEY, DESKTOP_APP_VERSION_QUERY_VALUE);
  }
  url
}

fn normalized_clipboard_text(value: &str) -> Option<String> {
  let normalized = value.split_whitespace().collect::<Vec<_>>().join(" ");
  if normalized.trim().is_empty() {
    None
  } else {
    Some(normalized)
  }
}

fn now_millis_string() -> String {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .map(|duration| duration.as_millis().to_string())
    .unwrap_or_else(|_| "0".to_string())
}

fn remote_origin_for(url: &Url) -> String {
  match (url.host_str(), url.port()) {
    (Some(host), Some(port)) => format!("{}://{}:{}", url.scheme(), host, port),
    (Some(host), None) => format!("{}://{}", url.scheme(), host),
    _ => url.as_str().to_string(),
  }
}

fn apply_remote_capability<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  identifier: &str,
  origin: String,
  window_label: &str,
) -> Result<(), Box<dyn std::error::Error>> {
  app.add_capability(
    CapabilityBuilder::new(identifier)
      .remote(origin)
      .permission("core:default")
      .permission("notification:default")
      .permission("allow-read-clipboard-text")
      .permission("allow-focus-main-window")
      .permission("allow-close-quick-lookup-window")
      .permission("allow-get-quick-lookup-shortcut")
      .permission("allow-set-quick-lookup-shortcut")
      .permission("allow-schedule-repeat-notification")
      .permission("allow-cancel-repeat-notification")
      .window(window_label.to_string()),
  )?;

  Ok(())
}

fn build_quick_lookup_url(prefill_text: Option<&str>) -> Url {
  let mut url = runtime_base_url();
  url.set_path(QUICK_LOOKUP_WINDOW_PATH);

  {
    let mut pairs = url.query_pairs_mut();
    pairs.append_pair(DESKTOP_SHELL_QUERY_KEY, DESKTOP_SHELL_QUERY_VALUE);
    pairs.append_pair(DESKTOP_APP_VERSION_QUERY_KEY, DESKTOP_APP_VERSION_QUERY_VALUE);
    pairs.append_pair(DESKTOP_QUICK_LOOKUP_OPENED_AT_QUERY_KEY, &now_millis_string());

    if let Some(text) = prefill_text {
      if !text.trim().is_empty() {
        pairs.append_pair(DESKTOP_QUICK_LOOKUP_TEXT_QUERY_KEY, text);
      }
    }
  }

  url
}

fn open_quick_lookup_window<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  prefill_text: Option<&str>,
) -> Result<(), Box<dyn std::error::Error>> {
  let target_url = build_quick_lookup_url(prefill_text);

  if let Some(window) = app.get_webview_window(QUICK_LOOKUP_WINDOW_LABEL) {
    let _ = window.unminimize();
    let _ = window.show();
    window.navigate(target_url)?;
    let _ = window.set_focus();
    return Ok(());
  }

  WebviewWindowBuilder::new(
    app,
    QUICK_LOOKUP_WINDOW_LABEL,
    WebviewUrl::External(target_url),
  )
  .title(QUICK_LOOKUP_WINDOW_TITLE)
  .inner_size(520.0, 460.0)
  .resizable(false)
  .maximizable(false)
  .minimizable(false)
  .always_on_top(true)
  .skip_taskbar(true)
  .focused(true)
  .initialization_script(DESKTOP_SHELL_INIT_SCRIPT)
  .on_navigation(|url| matches!(url.scheme(), "http" | "https"))
  .build()?;

  Ok(())
}

fn open_quick_lookup_from_shortcut<R: tauri::Runtime>(app: &tauri::AppHandle<R>) {
  let prefill_text = read_clipboard_text()
    .ok()
    .and_then(|value| normalized_clipboard_text(&value));

  if let Err(error) = open_quick_lookup_window(app, prefill_text.as_deref()) {
    eprintln!("failed to open quick lookup window: {error}");
  }
}

fn register_quick_lookup_shortcut<R: tauri::Runtime>(
  app: &tauri::AppHandle<R>,
  shortcut: &str,
) -> Result<(), String> {
  app
    .global_shortcut()
    .on_shortcut(shortcut, |app, _shortcut, event| {
      if event.state == ShortcutState::Pressed {
        open_quick_lookup_from_shortcut(app);
      }
    })
    .map_err(|error| error.to_string())
}

fn build_desktop_auth_completion_url(firebase_id_token: &str) -> Option<Url> {
  let mut url = runtime_base_url();
  url.set_path("/login");

  {
    let mut pairs = url.query_pairs_mut();
    pairs.append_pair(DESKTOP_SHELL_QUERY_KEY, DESKTOP_SHELL_QUERY_VALUE);
    pairs.append_pair(DESKTOP_APP_VERSION_QUERY_KEY, DESKTOP_APP_VERSION_QUERY_VALUE);
    pairs.append_pair(DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY, firebase_id_token);
  }

  Some(url)
}

fn extract_desktop_firebase_token(url: &Url) -> Option<String> {
  if url.scheme() != DESKTOP_DEEP_LINK_SCHEME {
    return None;
  }

  if url.host_str() != Some("auth") {
    return None;
  }

  url.query_pairs()
    .find_map(|(key, value)| {
      if key == DESKTOP_FIREBASE_ID_TOKEN_QUERY_KEY && !value.trim().is_empty() {
        Some(value.into_owned())
      } else {
        None
      }
    })
}

fn handle_desktop_auth_callback<R: tauri::Runtime>(app: &tauri::AppHandle<R>, urls: &[Url]) {
  let firebase_id_token = urls.iter().find_map(extract_desktop_firebase_token);
  let Some(firebase_id_token) = firebase_id_token else {
    return;
  };

  let Some(target_url) = build_desktop_auth_completion_url(&firebase_id_token) else {
    return;
  };

  if let Some(window) = app.get_webview_window("main") {
    let _ = window.navigate(target_url);
    let _ = window.set_focus();
  }
}

fn should_open_in_system_browser(url: &Url) -> bool {
  if !matches!(url.scheme(), "http" | "https") {
    return false;
  }

  url.query_pairs()
    .any(|(key, value)| key == DESKTOP_AUTH_PROVIDER_QUERY_KEY && !value.trim().is_empty())
}

fn create_main_window<R: tauri::Runtime>(
  app: &tauri::App<R>,
) -> Result<(), Box<dyn std::error::Error>> {
  let mut config = app
    .config()
    .app
    .windows
    .first()
    .cloned()
    .ok_or("missing main window config")?;

  let external_url = runtime_url();
  config.url = WebviewUrl::External(external_url.clone());

  apply_remote_capability(
    &app.handle().clone(),
    "app-main",
    remote_origin_for(&external_url),
    &config.label,
  )?;

  let app_handle = app.handle().clone();
  WebviewWindowBuilder::from_config(app, &config)?
    .initialization_script(DESKTOP_SHELL_INIT_SCRIPT)
    .on_navigation(|url| {
      matches!(url.scheme(), "http" | "https")
        || matches!(url.host_str(), Some("localhost") | Some("127.0.0.1"))
    })
    .on_new_window(move |url, features| {
      if should_open_in_system_browser(&url) {
        let _ = open::that_detached(url.as_str());
        return NewWindowResponse::Deny;
      }

      let label = format!("oauth-popup-{}", POPUP_COUNTER.fetch_add(1, Ordering::Relaxed));
      let builder = WebviewWindowBuilder::new(
        &app_handle,
        label,
        WebviewUrl::External(url.clone()),
      )
      .title(url.as_str())
      .window_features(features)
      .focused(true);

      match builder.build() {
        Ok(window) => NewWindowResponse::Create { window },
        Err(_) => NewWindowResponse::Deny,
      }
    })
    .build()?;

  Ok(())
}

fn main() {
  let mut builder = tauri::Builder::default();

  #[cfg(any(target_os = "macos", windows, target_os = "linux"))]
  {
    builder = builder.plugin(tauri_plugin_single_instance::init(|_, _, _| {}));
  }

  builder
    .invoke_handler(tauri::generate_handler![
      read_clipboard_text,
      focus_main_window,
      close_quick_lookup_window,
      get_quick_lookup_shortcut,
      set_quick_lookup_shortcut,
      schedule_repeat_notification,
      cancel_repeat_notification
    ])
    .plugin(tauri_plugin_deep_link::init())
    .plugin(GlobalShortcutBuilder::new().build())
    .plugin(tauri_plugin_notification::init())
    .setup(|app| {
      app.manage(RepeatNotificationSchedulerState(Mutex::new(HashMap::new())));
      create_main_window(app)?;
      apply_remote_capability(
        &app.handle().clone(),
        "app-quick-lookup",
        remote_origin_for(&build_quick_lookup_url(None)),
        QUICK_LOOKUP_WINDOW_LABEL,
      )?;

      let initial_shortcut = load_quick_lookup_shortcut(&app.handle());
      app.manage(QuickLookupShortcutState(Mutex::new(initial_shortcut.clone())));
      register_quick_lookup_shortcut(&app.handle(), &initial_shortcut)?;

      #[cfg(any(windows, target_os = "linux"))]
      {
        app.deep_link().register_all()?;
      }

      if let Some(start_urls) = app.deep_link().get_current()? {
        handle_desktop_auth_callback(&app.handle(), &start_urls);
      }

      let app_handle = app.handle().clone();
      app.deep_link().on_open_url(move |event| {
        handle_desktop_auth_callback(&app_handle, &event.urls());
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running VocOrbit Desktop");
}
