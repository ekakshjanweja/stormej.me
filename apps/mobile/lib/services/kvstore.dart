import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// All persistent keys used by the generic orchestration client.
abstract final class KvStoreKeys {
  static const orchestratorAppId = 'orchestrator.app_id';
  static const orchestratorDeviceId = 'orchestrator.device_id';
  static const orchestratorRunId = 'orchestrator.run_id';
  static const orchestratorWorkspaceId = 'orchestrator.workspace_id';
}

/// Small, app-agnostic key/value service for orchestration state.
///
/// Values are encrypted at rest using the platform Keychain/Keystore. Keep
/// server-side secrets and authoritative orchestration state on the service;
/// this store is only for client credentials, IDs, and resumable state.
final class KvStore {
  KvStore({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  Future<String?> read(String key) => _storage.read(key: key);

  Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);

  Future<void> delete(String key) => _storage.delete(key: key);

  Future<bool> contains(String key) => _storage.containsKey(key: key);

  Future<void> clear() => _storage.deleteAll();

  Future<T?> readJson<T>(String key, T Function(Object? value) decode) async {
    final value = await read(key);
    if (value == null) {
      return null;
    }

    return decode(jsonDecode(value));
  }

  Future<void> writeJson(String key, Object value) =>
      write(key, jsonEncode(value));
}
