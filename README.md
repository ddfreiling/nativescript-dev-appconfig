# nativescript-dev-appconfig

Adds support for `--env.config` argument to Nativescript CLI commands.

`--env.config <name>` will load `$ProjectDir/config/<name>.json` and inject it as `$ProjectDir/app/config.json`

If config contains an "app_name" key, the native app will have its product name updated.

The config file is injected into the app as "config.json", so that it can be loaded at runtime.

## Install:
```bash
tns plugin add nativescript-dev-appconfig
```

## Example:
`tns prepare android --env.config beta` will load `$ProjectDir/config/beta.json`

If beta.json contains `"app_name": "My Beta App"`,
it will update product name in `Info.plist` for iOS and `strings.xml` for Android.
