package com.vocorbit

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

@Suppress("DEPRECATION")
class ShareIntentPackage : ReactPackage {
  @Deprecated("Legacy ReactPackage interop API used for the Android share bridge.")
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(ShareIntentModule(reactContext))
  }

  override fun createViewManagers(
    reactContext: ReactApplicationContext,
  ): List<ViewManager<*, *>> {
    return emptyList()
  }
}
