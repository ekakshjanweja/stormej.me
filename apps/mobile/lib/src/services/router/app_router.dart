import 'package:flutter/material.dart';

import '../../modules/home/presentation/ui/home_view.dart';
import '../../modules/not_found/presentation/ui/not_found_view.dart';
import 'route_config.dart';

abstract final class AppRouter {
  static Route<void>? onGenerateRoute(RouteSettings settings) {
    switch (settings.name) {
      case AppRoutes.home:
        return MaterialPageRoute<void>(
          settings: settings,
          builder: (_) => const HomeView(userName: ''),
        );
      default:
        return MaterialPageRoute<void>(builder: (_) => const NotFoundView());
    }
  }
}
