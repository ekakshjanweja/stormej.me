import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

const authBaseUrl = String.fromEnvironment(
  'AUTH_BASE_URL',
  defaultValue: 'http://localhost:3000/api/auth',
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await BetterAuthFlutter.initialize(
    url: authBaseUrl,
    enableLogging: kDebugMode,
    hydrateOnInit: true,
    mode: AuthMode.cookie,
  );
  runApp(const StormejMobileApp());
}

class StormejMobileApp extends StatelessWidget {
  const StormejMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'stormej',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
      ),
      home: BetterAuthBuilder(
        authenticated: (context, user) => HomeScreen(userName: user.name),
        unauthenticated: (context) => const SignInScreen(),
      ),
    );
  }
}

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  bool isSubmitting = false;
  String? errorMessage;

  @override
  void dispose() {
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> signIn() async {
    setState(() {
      errorMessage = null;
      isSubmitting = true;
    });

    final result = await BetterAuthFlutter.client.signInEmail(
      email: emailController.text.trim(),
      password: passwordController.text,
    );

    if (!mounted) {
      return;
    }

    switch (result) {
      case Success():
        break;
      case Failure(:final error):
        setState(() => errorMessage = error.message);
    }

    setState(() => isSubmitting = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'sign in',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 24),
                TextField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password'),
                ),
                if (errorMessage != null) ...[
                  const SizedBox(height: 12),
                  Text(
                    errorMessage!,
                    style: const TextStyle(color: Colors.red),
                  ),
                ],
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: isSubmitting ? null : signIn,
                  child: Text(isSubmitting ? 'signing in…' : 'sign in'),
                ),
                const SizedBox(height: 12),
                const Text('Email signup is disabled for this app.'),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({required this.userName, super.key});

  final String userName;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('stormej'),
        actions: [
          IconButton(
            onPressed: BetterAuthFlutter.client.signOut,
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
          ),
        ],
      ),
      body: Center(child: Text('Welcome, $userName')),
    );
  }
}
