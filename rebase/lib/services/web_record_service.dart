import 'dart:async';
import 'dart:html' as html;

class WebRecordService {
  html.MediaRecorder? _mediaRecorder;
  List<html.Blob> _chunks = [];
  final _onStopController = StreamController<html.Blob>.broadcast();

  Stream<html.Blob> get onStop => _onStopController.stream;

  Future<void> start() async {
    final stream = await html.window.navigator.mediaDevices?.getUserMedia({'audio': true});
    _mediaRecorder = html.MediaRecorder(stream!);
    _chunks = [];
    _mediaRecorder!.onDataAvailable.listen((event) {
      _chunks.add(event.data);
    });
    _mediaRecorder!.onStop.listen((event) {
      final blob = html.Blob(_chunks);
      _onStopController.add(blob);
    });
    _mediaRecorder!.start();
  }

  void stop() {
    _mediaRecorder?.stop();
  }

  void dispose() {
    _onStopController.close();
  }
} 