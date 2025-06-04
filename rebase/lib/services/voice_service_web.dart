import 'dart:async';
import 'dart:typed_data';
import 'dart:js' as js;
import 'dart:convert';

class VoiceService {
  final _responseController = StreamController<String>.broadcast();
  final _audioBytesController = StreamController<Uint8List>.broadcast();
  bool _isRecording = false;

  Stream<String> get responseStream => _responseController.stream;
  Stream<Uint8List> get audioBytesStream => _audioBytesController.stream;

  Future<void> startRecording() async {
    if (_isRecording) return;
    _isRecording = true;
    await js.context.callMethod('flutterRecorder.startRecording');
  }

  Future<void> stopRecording() async {
    if (!_isRecording) return;
    _isRecording = false;
    final base64 = await js.context.callMethod('flutterRecorder.stopRecording');
    final bytes = base64Decode(base64 as String);
    _audioBytesController.add(bytes);
  }

  void dispose() {
    _responseController.close();
    _audioBytesController.close();
  }
} 