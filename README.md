# VrStatus

Kettu / Vendetta-family Android plugin that adds the green VR headset indicator to avatars only when the Discord client exposes an active VR client-presence field for that user.

## Install

After the GitHub Actions deployment succeeds, install this plugin URL in Kettu:

```text
https://hirotakammi-dotcom.github.io/VrStatus/VrStatus/
```

Kettu resolves `manifest.json` from the plugin directory and then downloads the JavaScript file declared by `manifest.json`.

## Build

Requires Node.js 22.

```sh
npm install
npm run build
```

Build output:

```text
dist/
├── index.html
├── .nojekyll
└── VrStatus/
    ├── manifest.json
    └── index.js
```

## Presence behavior

The plugin is read-only. It checks the Discord PresenceStore for an explicit `clientStatus.vr` (or `client_status.vr`) value and shows the indicator only when that value is active. If Kettu/Discord does not expose VR presence data, no indicator is shown.

This plugin does not start a VR session, change Discord account presence, spoof a VR client, or make other users appear to be in VR.

## Compatibility and verification

The source uses the Vendetta-family plugin interfaces used by Kettu-compatible plugins. GitHub Actions builds and publishes the plugin bundle. Runtime behavior still needs to be verified on the installed Kettu/Discord version because Discord's internal presence and avatar components can change.

<!-- Trigger clean Pages deployment; do not rerun an already-uploaded artifact job. -->
