package com.vocorbit

import android.content.Intent
import android.net.Uri
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ShareIntentModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "ShareIntentModule"

  @ReactMethod
  fun consumePendingSharePayload(promise: Promise) {
    try {
      val payload = SharePayloadStore.consume(reactApplicationContext)
      if (payload == null) {
        promise.resolve(null)
        return
      }

      val result = Arguments.createMap().apply {
        putString("text", payload.text)
        putString("source", payload.source)
        putDouble("receivedAt", payload.receivedAt.toDouble())
        putString("selectedWord", payload.selectedWord)
        putBoolean("needsOverlayPermission", payload.needsOverlayPermission)
      }
      promise.resolve(result)
    } catch (error: Throwable) {
      promise.reject("SHARE_INTENT_CONSUME_FAILED", error)
    }
  }

  @ReactMethod
  fun isOverlayPermissionGranted(promise: Promise) {
    try {
      promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
    } catch (error: Throwable) {
      promise.reject("SHARE_INTENT_OVERLAY_PERMISSION_CHECK_FAILED", error)
    }
  }

  @ReactMethod
  fun openOverlaySettings(promise: Promise) {
    try {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:${reactApplicationContext.packageName}"),
      ).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }
      reactApplicationContext.startActivity(intent)
      promise.resolve(true)
    } catch (error: Throwable) {
      promise.reject("SHARE_INTENT_OPEN_OVERLAY_SETTINGS_FAILED", error)
    }
  }

  @ReactMethod
  fun syncQuickLookupSession(sessionJson: String?) {
    QuickLookupSessionStore.sync(reactApplicationContext, sessionJson)
  }
}
