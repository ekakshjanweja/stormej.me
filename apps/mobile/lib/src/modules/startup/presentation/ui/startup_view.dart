import 'package:better_auth_flutter/better_auth_flutter.dart';
import 'package:flutter/material.dart';

import '../../../../core/ui/widgets/app_button.dart';
import '../../../../core/ui/widgets/app_error_widget.dart';
import '../../../../core/ui/widgets/app_text_field.dart';

class StartupView extends StatefulWidget {
  const StartupView({super.key});

  @override
  State<StartupView> createState() => _StartupViewState();
}

class _StartupViewState extends State<StartupView> {
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
                AppTextField(controller: emailController, label: 'Email'),
                const SizedBox(height: 12),
                AppTextField(
                  controller: passwordController,
                  label: 'Password',
                  obscureText: true,
                ),
                if (errorMessage != null) ...[
                  const SizedBox(height: 12),
                  AppErrorWidget(message: errorMessage!),
                ],
                const SizedBox(height: 20),
                AppButton(
                  onPressed: isSubmitting ? null : signIn,
                  label: isSubmitting ? 'signing in…' : 'sign in',
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
