import 'package:flutter/foundation.dart';

final class StartupProvider extends ChangeNotifier {
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    await Future<void>.delayed(Duration.zero);
    _isLoading = false;
    notifyListeners();
  }
}
