import 'dart:convert';

import 'secure_storage.dart';

final class KvStore {
  KvStore({SecureStorageService? storage})
    : _storage = storage ?? SecureStorageService();

  final SecureStorageService _storage;

  Future<String?> read(String key) => _storage.read(key);
  Future<void> write(String key, String value) => _storage.write(key, value);
  Future<void> delete(String key) => _storage.delete(key);
  Future<bool> contains(String key) => _storage.contains(key);
  Future<void> clear() => _storage.clear();

  Future<T?> readJson<T>(String key, T Function(Object? value) decode) async {
    final value = await read(key);
    return value == null ? null : decode(jsonDecode(value));
  }

  Future<void> writeJson(String key, Object value) =>
      write(key, jsonEncode(value));
}
