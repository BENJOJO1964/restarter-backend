import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/openai_service.dart';
import 'dart:html' as html;

class MyStoryScreen extends StatefulWidget {
  const MyStoryScreen({super.key});

  @override
  State<MyStoryScreen> createState() => _MyStoryScreenState();
}

class _MyStoryScreenState extends State<MyStoryScreen> {
  final _controller = TextEditingController();
  String? _story;
  bool _isLoading = false;
  String? _apiKey;
  String? _error;

  @override
  void initState() {
    super.initState();
    _apiKey = html.window.localStorage['openai_api_key'];
  }

  Future<void> _generateStory() async {
    final topic = _controller.text.trim();
    if (topic.isEmpty || _apiKey == null || _apiKey!.isEmpty) return;
    setState(() { _isLoading = true; _error = null; });
    try {
      final openai = OpenAIService(_apiKey!);
      final prompt = '請根據這個主題，用溫暖、鼓勵的語氣寫一個短故事：「$topic」';
      final story = await openai.chatWithGPT(prompt);
      setState(() { _story = story; });
    } catch (e) {
      setState(() { _error = e.toString(); });
    } finally {
      setState(() { _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.createMyStory),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: l10n.sayYourFeeling,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onSubmitted: (_) => _generateStory(),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _generateStory,
              child: _isLoading ? const CircularProgressIndicator() : Text(l10n.createMyStory),
            ),
            const SizedBox(height: 24),
            if (_error != null)
              Text(_error!, style: const TextStyle(color: Colors.red)),
            if (_story != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Card(
                    margin: const EdgeInsets.only(top: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Text(_story!, style: const TextStyle(fontSize: 18)),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
} 