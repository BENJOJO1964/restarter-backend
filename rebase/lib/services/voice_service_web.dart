import 'dart:async';
import 'dart:typed_data';
import 'dart:convert';
import 'dart:js_util' as js_util;
import 'dart:html' as html;

class VoiceService {
  final _responseController = StreamController<String>.broadcast();
  final _audioBytesController = StreamController<Uint8List>.broadcast();
  bool _isRecording = false;

  Stream<String> get responseStream => _responseController.stream;
  Stream<Uint8List> get audioBytesStream => _audioBytesController.stream;

  Future<void> startRecording() async {
    if (_isRecording) return;
    _isRecording = true;
    final recorder = js_util.getProperty(html.window, 'flutterRecorder');
    await js_util.promiseToFuture(js_util.callMethod(recorder, 'startRecording', []));
  }

  Future<void> stopRecording() async {
    if (!_isRecording) return;
    _isRecording = false;
    final recorder = js_util.getProperty(html.window, 'flutterRecorder');
    final base64 = await js_util.promiseToFuture(js_util.callMethod(recorder, 'stopRecording', []));
    final bytes = base64Decode(base64 as String);
    _audioBytesController.add(bytes);
  }

  void dispose() {
    _responseController.close();
    _audioBytesController.close();
  }
} 