import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'src/core/app.dart';
import 'src/core/config/app_config.dart';

Future<void> main() async {
  await dotenv.load(isOptional: true);

  final config = AppConfig.fromEnvironment(dotenv);
  await BetterAuthFlutter.initialize(
    url: config.authBaseUrl,
    hydrateOnInit: true,
    mode: AuthMode.cookie,
  );

  runApp(App(config: config));
}
