import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';

import '../modules/home/presentation/ui/home_view.dart';
import '../modules/not_found/presentation/ui/not_found_view.dart';
import '../modules/startup/presentation/ui/startup_view.dart';
import '../services/router/app_router.dart';
import '../services/router/route_config.dart';
import 'config/app_config.dart';
import 'ui/theme/app_scroll_behavior.dart';
import 'ui/theme/app_theme.dart';

class App extends StatelessWidget {
  const App({required this.config, super.key});

  final AppConfig config;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: config.appName,
      theme: AppTheme.light,
      scrollBehavior: const AppScrollBehavior(),
      onGenerateRoute: AppRouter.onGenerateRoute,
      onUnknownRoute: (_) =>
          MaterialPageRoute<void>(builder: (_) => const NotFoundView()),
      home: BetterAuthBuilder(
        authenticated: (context, user) => HomeView(userName: user.name),
        unauthenticated: (_) => const StartupView(),
      ),
      routes: {AppRoutes.home: (_) => const HomeView(userName: '')},
    );
  }
}
