import 'dart:developer' as developer;

final class AppLogger {
  const AppLogger();

  void info(String message) => developer.log(message, name: 'app');
  void error(String message, [Object? error, StackTrace? stackTrace]) =>
      developer.log(message, name: 'app', error: error, stackTrace: stackTrace);
}
