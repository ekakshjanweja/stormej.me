# orchestrator_flutter_example

Reference Flutter client for a reusable orchestration service. The service is intentionally
application-agnostic: each consuming Flutter app supplies its own service URL and app ID.

Authentication uses Better Auth's default cookie-based sessions and email/password sign-in.
Sessions are persisted securely on native platforms by `better_auth_flutter` through
Keychain/Keystore.

The orchestrator and auth URLs are configuration values, not constants in the client.

Copy `.env.example` to `.env`, then set the auth URL for the environment:

```bash
cp .env.example .env
flutter run
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
