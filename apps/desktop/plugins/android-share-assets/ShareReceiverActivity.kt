package com.vocorbit

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings

class ShareReceiverActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val payload = SharePayloadStore.extractPayload(intent)
    if (payload == null) {
      finish()
      return
    }

    if (Settings.canDrawOverlays(this)) {
      startService(QuickLookupOverlayService.createIntent(this, payload))
    } else {
      SharePayloadStore.persist(
        applicationContext,
        payload.copy(needsOverlayPermission = true),
      )

      val launchIntent = Intent(this, MainActivity::class.java).apply {
        action = Intent.ACTION_MAIN
        addCategory(Intent.CATEGORY_LAUNCHER)
        addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or
            Intent.FLAG_ACTIVITY_SINGLE_TOP or
            Intent.FLAG_ACTIVITY_CLEAR_TOP,
        )
      }
      startActivity(launchIntent)
    }
    finish()
  }
}
