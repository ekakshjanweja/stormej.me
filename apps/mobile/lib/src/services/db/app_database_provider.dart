import 'app_database.dart';
import 'secure_storage.dart';

final class AppDatabaseProvider {
  AppDatabaseProvider({SecureStorageService? storage})
    : database = AppDatabase(storage ?? SecureStorageService());

  final AppDatabase database;
}
