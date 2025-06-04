import 'dart:async';
import 'dart:typed_data';
import 'dart:io';
import 'package:record/record.dart';

class VoiceService {
  final Record _recorder = Record();
  final _responseController = StreamController<String>.broadcast();
  final _audioBytesController = StreamController<Uint8List>.broadcast();
  bool _isRecording = false;

  Stream<String> get responseStream => _responseController.stream;
  Stream<Uint8List> get audioBytesStream => _audioBytesController.stream;

  Future<void> startRecording() async {
    if (_isRecording) return;
    _isRecording = true;
    await _recorder.start();
  }

  Future<void> stopRecording() async {
    if (!_isRecording) return;
    _isRecording = false;
    final path = await _recorder.stop();
    if (path != null) {
      final bytes = await File(path).readAsBytes();
      _audioBytesController.add(bytes);
    }
  }

  void dispose() {
    _responseController.close();
    _audioBytesController.close();
  }
} 