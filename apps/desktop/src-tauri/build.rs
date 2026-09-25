fn main() {
  let attributes = tauri_build::Attributes::new().app_manifest(
    tauri_build::AppManifest::new().commands(&[
      "read_clipboard_text",
      "focus_main_window",
      "close_quick_lookup_window",
      "get_quick_lookup_shortcut",
      "set_quick_lookup_shortcut",
      "schedule_repeat_notification",
      "cancel_repeat_notification",
    ]),
  );

  tauri_build::try_build(attributes).expect("failed to run tauri build")
}
