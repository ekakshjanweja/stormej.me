import 'package:http/http.dart' as http;

final class ApiClient {
  ApiClient({http.Client? client}) : _client = client ?? http.Client();

  final http.Client _client;

  Future<http.Response> get(Uri uri, {Map<String, String>? headers}) =>
      _client.get(uri, headers: headers);

  Future<http.Response> post(
    Uri uri, {
    Map<String, String>? headers,
    Object? body,
  }) => _client.post(uri, headers: headers, body: body);

  void close() => _client.close();
}
