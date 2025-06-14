import 'package:flutter/material.dart';
import '../models/message.dart';
import '../widgets/message_card.dart';
import '../l10n/app_localizations.dart';
import 'package:uuid/uuid.dart';
import '../services/openai_service.dart';
import 'dart:html' as html;

class RestartWallScreen extends StatefulWidget {
  const RestartWallScreen({super.key});

  @override
  State<RestartWallScreen> createState() => _RestartWallScreenState();
}

class _RestartWallScreenState extends State<RestartWallScreen> {
  final List<Message> _messages = [];
  final _controller = TextEditingController();
  bool _isLoading = false;
  String? _apiKey;

  @override
  void initState() {
    super.initState();
    _apiKey = html.window.localStorage['openai_api_key'];
    _loadBackup();
  }

  void _loadBackup() {
    final data = html.window.localStorage['restartwall_backup'];
    if (data != null && data.isNotEmpty) {
      // 簡單反序列化
      final list = data.split('||').map((e) {
        final parts = e.split('|');
        return Message(
          id: parts[0],
          content: parts[1],
          timestamp: DateTime.tryParse(parts[2]) ?? DateTime.now(),
          aiReply: parts.length > 3 ? parts[3] : null,
          isAnonymous: true,
        );
      }).toList();
      setState(() {
        _messages.clear();
        _messages.addAll(list);
      });
    }
  }

  void _backup() {
    final data = _messages.map((m) => "${m.id}|${m.content}|${m.timestamp.toIso8601String()}|${m.aiReply ?? ''}").join('||');
    html.window.localStorage['restartwall_backup'] = data;
  }

  Future<void> _addMessage(String content) async {
    if (content.trim().isEmpty) return;
    setState(() { _isLoading = true; });
    final msg = Message(
      id: const Uuid().v4(),
      content: content.trim(),
      timestamp: DateTime.now(),
      isAnonymous: true,
    );
    _messages.insert(0, msg);
    _backup();
    setState(() {});
    if (_apiKey != null && _apiKey!.isNotEmpty) {
      final openai = OpenAIService(_apiKey!);
      final aiReply = await openai.chatWithGPT(content);
      final idx = _messages.indexWhere((m) => m.id == msg.id);
      if (idx != -1) {
        _messages[idx] = Message(
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          aiReply: aiReply,
          isAnonymous: true,
        );
        _backup();
        setState(() {});
      }
    }
    setState(() { _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.viewRestartWall),
        centerTitle: true,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: l10n.sayYourFeeling,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onSubmitted: (v) => _submit(),
                  ),
                ),
                const SizedBox(width: 8),
                _isLoading
                    ? const CircularProgressIndicator()
                    : IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: _submit,
                      ),
              ],
            ),
          ),
          Expanded(
            child: _messages.isEmpty
                ? Center(child: Text(l10n.noMessages))
                : ListView.builder(
                    reverse: true,
                    itemCount: _messages.length,
                    itemBuilder: (context, idx) {
                      return MessageCard(message: _messages[idx]);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  void _submit() {
    final text = _controller.text;
    _controller.clear();
    _addMessage(text);
  }
} 