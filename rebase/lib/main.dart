import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'l10n/app_localizations.dart';
import 'screens/echo_box_screen.dart';
import 'screens/restart_wall_screen.dart';
import 'screens/my_story_screen.dart';

void main() {
  runApp(const MyApp());
}

final _router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/echo-box',
      builder: (context, state) => const EchoBoxScreen(),
    ),
    GoRoute(
      path: '/restart-wall',
      builder: (context, state) => const RestartWallScreen(),
    ),
    GoRoute(
      path: '/my-story',
      builder: (context, state) => const MyStoryScreen(),
    ),
  ],
);

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Locale _locale = const Locale('zh', 'TW');

  void setLocale(Locale locale) {
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'ReBase™',
      routerConfig: _router,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF6B3E),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Noto Sans TC',
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF6B3E),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Noto Sans TC',
      ),
      locale: _locale,
      supportedLocales: const [
        Locale('zh', 'TW'),
        Locale('zh', 'CN'),
        Locale('zh'),
        Locale('en'),
        Locale('ja'),
      ],
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (context, child) {
        return InheritedLocale(
          locale: _locale,
          setLocale: setLocale,
          child: child!,
        );
      },
    );
  }
}

class InheritedLocale extends InheritedWidget {
  final Locale locale;
  final void Function(Locale) setLocale;
  const InheritedLocale({required this.locale, required this.setLocale, required super.child});
  static InheritedLocale of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<InheritedLocale>()!;
  @override
  bool updateShouldNotify(covariant InheritedLocale oldWidget) => locale != oldWidget.locale;
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeState = InheritedLocale.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appTitle),
        centerTitle: true,
        actions: [
          PopupMenuButton<Locale>(
            icon: const Icon(Icons.language),
            onSelected: (locale) => localeState.setLocale(locale),
            itemBuilder: (context) => [
              PopupMenuItem(
                value: const Locale('zh', 'TW'),
                child: const Text('繁體中文'),
              ),
              PopupMenuItem(
                value: const Locale('zh', 'CN'),
                child: const Text('简体中文'),
              ),
              PopupMenuItem(
                value: const Locale('en'),
                child: const Text('English'),
              ),
              PopupMenuItem(
                value: const Locale('ja'),
                child: const Text('日本語'),
              ),
            ],
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              l10n.welcome,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => context.go('/echo-box'),
              child: Text(l10n.startEchoBox),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => context.go('/restart-wall'),
              child: Text(l10n.viewRestartWall),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: () => context.go('/my-story'),
              child: Text(l10n.createMyStory),
            ),
          ],
        ),
      ),
    );
  }
}
