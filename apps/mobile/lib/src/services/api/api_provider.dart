import 'api_client.dart';

final class ApiProvider {
  ApiProvider({ApiClient? client}) : client = client ?? ApiClient();

  final ApiClient client;
}
