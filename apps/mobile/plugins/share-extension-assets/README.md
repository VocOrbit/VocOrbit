This folder is the source of truth for restoring iOS Share Extension files after
`expo prebuild --clean`.

`with-share-extension-restore.ts` copies these files into `ios/` during prebuild.

If you intentionally change Share Extension behavior in Xcode, re-sync templates
from generated iOS files:

```bash
cp ios/VocOrbit.xcodeproj/project.pbxproj plugins/share-extension-assets/VocOrbit.xcodeproj/project.pbxproj
cp ios/VocOrbit/VocOrbit.entitlements plugins/share-extension-assets/VocOrbit/VocOrbit.entitlements
cp ios/ShareExtension/*.swift plugins/share-extension-assets/ShareExtension/
cp ios/ShareExtension/*.plist plugins/share-extension-assets/ShareExtension/
cp ios/ShareExtension/*.entitlements plugins/share-extension-assets/ShareExtension/
```
