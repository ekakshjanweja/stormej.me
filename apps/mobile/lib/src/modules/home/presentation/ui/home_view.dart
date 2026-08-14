import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';

class HomeView extends StatelessWidget {
  const HomeView({required this.userName, super.key});

  final String userName;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Orchestrator'),
        actions: [
          IconButton(
            onPressed: BetterAuthFlutter.client.signOut,
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
          ),
        ],
      ),
      body: Center(
        child: Text(userName.isEmpty ? 'Home' : 'Welcome, $userName'),
      ),
    );
  }
}
