# stormej_mobile

Flutter client for the Stormej Better Auth service.

Authentication uses Better Auth's default cookie-based sessions and email/password sign-in.
Signup is intentionally disabled. Sessions are persisted securely on native platforms by
`better_auth_flutter` through Keychain/Keystore.

Run locally with the auth URL supplied by the environment:

```bash
flutter run --dart-define=AUTH_BASE_URL=http://localhost:3000/api/auth
```

For an Android emulator, use `http://10.0.2.2:3000/api/auth`. For production, use the deployed
value from `apps/mobile/.env.example`.

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
