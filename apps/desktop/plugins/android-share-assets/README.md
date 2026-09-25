This folder is the source of truth for Android share-intent native assets used by
`./plugins/with-android-share-intent`.

`expo prebuild --clean` regenerates `android/`, then the config plugin copies these
files into `android/app/src/main/java/com/vocorbit/` and patches the manifest,
styles, and package registration.

If you intentionally change Android share-intent behavior in generated native files,
re-sync the Kotlin sources back into this folder instead of committing `android/`.
