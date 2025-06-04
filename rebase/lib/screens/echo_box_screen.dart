import 'package:flutter/material.dart';
import '../services/voice_service.dart';
import '../l10n/app_localizations.dart';
import '../services/openai_service.dart';
import 'dart:typed_data';
import 'dart:html' as html;

class EchoBoxScreen extends StatefulWidget {
  const EchoBoxScreen({super.key});

  @override
  State<EchoBoxScreen> createState() => _EchoBoxScreenState();
}

class _EchoBoxScreenState extends State<EchoBoxScreen> {
  final _voiceService = VoiceService();
  bool _isRecording = false;
  String _response = '';
  String _whisperText = '';
  String _gptText = '';
  String _error = '';
  String? _apiKey;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _apiKey = html.window.localStorage['openai_api_key'];
    _voiceService.responseStream.listen((response) {
      setState(() {
        _response = response;
      });
    });
    _voiceService.audioBytesStream.listen((bytes) async {
      if (_apiKey == null || _apiKey!.isEmpty) {
        setState(() {
          _error = '請先輸入 API Key';
        });
        return;
      }
      setState(() {
        _isLoading = true;
        _error = '';
        _whisperText = '';
        _gptText = '';
      });
      try {
        final openai = OpenAIService(_apiKey!);
        final whisperText = await openai.transcribeWhisper(bytes);
        setState(() {
          _whisperText = whisperText.trim();
        });
        final gptText = await openai.chatWithGPT(whisperText);
        setState(() {
          _gptText = gptText.trim();
        });
      } catch (e) {
        setState(() {
          _error = e.toString();
        });
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _voiceService.dispose();
    super.dispose();
  }

  void _toggleRecording() async {
    setState(() {
      _isRecording = !_isRecording;
      _error = '';
      _whisperText = '';
      _gptText = '';
    });

    if (_isRecording) {
      await _voiceService.startRecording();
    } else {
      await _voiceService.stopRecording();
    }
  }

  void _showApiKeyDialog() async {
    final controller = TextEditingController(text: _apiKey ?? '');
    final result = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('OpenAI API Key'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'sk-...'),
          obscureText: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(controller.text.trim()),
            child: const Text('儲存'),
          ),
        ],
      ),
    );
    if (result != null && result.isNotEmpty) {
      setState(() {
        _apiKey = result;
        html.window.localStorage['openai_api_key'] = result;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.startEchoBox),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.vpn_key),
            tooltip: 'API Key',
            onPressed: _showApiKeyDialog,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              l10n.sayYourFeeling,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surfaceVariant,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            if (_response.isEmpty && _whisperText.isEmpty && _gptText.isEmpty && _error.isEmpty)
                              Text(
                                l10n.tapToRecord,
                                style: const TextStyle(fontSize: 18),
                              ),
                            if (_response.isNotEmpty)
                              Text(
                                _response,
                                style: const TextStyle(fontSize: 18),
                                textAlign: TextAlign.center,
                              ),
                            if (_whisperText.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 16.0),
                                child: Text(
                                  'Whisper：$_whisperText',
                                  style: const TextStyle(fontSize: 16, color: Colors.blueGrey),
                                ),
                              ),
                            if (_gptText.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 16.0),
                                child: Text(
                                  'AI：$_gptText',
                                  style: const TextStyle(fontSize: 18, color: Colors.deepPurple, fontWeight: FontWeight.bold),
                                ),
                              ),
                            if (_error.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 16.0),
                                child: Text(
                                  _error,
                                  style: const TextStyle(fontSize: 16, color: Colors.red),
                                ),
                              ),
                          ],
                        ),
                      ),
              ),
            ),
            const SizedBox(height: 20),
            FloatingActionButton.large(
              onPressed: _toggleRecording,
              backgroundColor: _isRecording
                  ? Theme.of(context).colorScheme.error
                  : Theme.of(context).colorScheme.primary,
              child: Icon(
                _isRecording ? Icons.stop : Icons.mic,
                size: 32,
              ),
            ),
          ],
        ),
      ),
    );
  }
} 