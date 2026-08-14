import 'package:flutter_dotenv/flutter_dotenv.dart';

final class AppConfig {
  const AppConfig({
    required this.appName,
    required this.authBaseUrl,
    required this.orchestratorUrl,
    required this.orchestratorAppId,
  });

  factory AppConfig.fromEnvironment(DotEnv environment) {
    return AppConfig(
      appName: environment.get('APP_NAME', fallback: 'Orchestrator'),
      authBaseUrl: environment.get(
        'AUTH_BASE_URL',
        fallback: 'http://localhost:3000/api/auth',
      ),
      orchestratorUrl: environment.get(
        'ORCHESTRATOR_URL',
        fallback: 'http://localhost:8787',
      ),
      orchestratorAppId: environment.get(
        'ORCHESTRATOR_APP_ID',
        fallback: 'local-development',
      ),
    );
  }

  final String appName;
  final String authBaseUrl;
  final String orchestratorUrl;
  final String orchestratorAppId;
}
