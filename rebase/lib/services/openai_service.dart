import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

class OpenAIService {
  final String apiKey;
  OpenAIService(this.apiKey);

  Future<String> transcribeWhisper(Uint8List audioBytes) async {
    final uri = Uri.parse('https://api.openai.com/v1/audio/transcriptions');
    final request = http.MultipartRequest('POST', uri)
      ..headers['Authorization'] = 'Bearer $apiKey'
      ..files.add(http.MultipartFile.fromBytes(
        'file',
        audioBytes,
        filename: 'audio.webm',
        contentType: MediaType('audio', 'webm'),
      ))
      ..fields['model'] = 'whisper-1'
      ..fields['response_format'] = 'text';

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    if (response.statusCode == 200) {
      return response.body.trim();
    } else {
      throw Exception('Whisper API failed: ${response.statusCode} ${response.body}');
    }
  }

  Future<String> chatWithGPT(String prompt) async {
    final uri = Uri.parse('https://api.openai.com/v1/chat/completions');
    final body = jsonEncode({
      'model': 'gpt-3.5-turbo',
      'messages': [
        {'role': 'system', 'content': '你是一個溫暖、善解人意的情緒陪伴者，請用簡短、鼓勵、正向的語氣回應。'},
        {'role': 'user', 'content': prompt},
      ],
      'max_tokens': 100,
      'temperature': 0.7,
    });
    final response = await http.post(
      uri,
      headers: {
        'Authorization': 'Bearer $apiKey',
        'Content-Type': 'application/json',
      },
      body: body,
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'] as String;
    } else {
      throw Exception('GPT-3.5 API failed: ${response.statusCode} ${response.body}');
    }
  }
} 