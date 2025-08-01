import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://172.20.10.6:3001'; // 後端服務器地址
  
  // 語音轉文字 API
  static Future<String> speechToText(String audioPath) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/api/whisper'),
      );
      
      request.files.add(
        await http.MultipartFile.fromPath('audio', audioPath),
      );
      
      var response = await request.send();
      var responseData = await response.stream.bytesToString();
      var jsonData = json.decode(responseData);
      
      return jsonData['text'] ?? '';
    } catch (e) {
      print('語音轉文字失敗: $e');
      return '';
    }
  }
  
  // AI 諮商 API
  static Future<String> aiConsultation(String message) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl/api/gpt'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'message': message,
          'model': 'gpt-4-turbo',
        }),
      );
      
      var jsonData = json.decode(response.body);
      return jsonData['response'] ?? '';
    } catch (e) {
      print('AI 諮商失敗: $e');
      return '抱歉，我現在無法回應，請稍後再試。';
    }
  }
  
  // 保存語音日記
  static Future<bool> saveVoiceDiary(Map<String, dynamic> diary) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl/api/voice-diary'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(diary),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('保存語音日記失敗: $e');
      return false;
    }
  }
  
  // 獲取語音日記列表
  static Future<List<Map<String, dynamic>>> getVoiceDiaries() async {
    try {
      var response = await http.get(
        Uri.parse('$baseUrl/api/voice-diary'),
      );
      
      var jsonData = json.decode(response.body);
      return List<Map<String, dynamic>>.from(jsonData['diaries'] ?? []);
    } catch (e) {
      print('獲取語音日記失敗: $e');
      return [];
    }
  }
  
  // 發布社群貼文
  static Future<bool> createPost(Map<String, dynamic> post) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl/api/posts'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(post),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('發布貼文失敗: $e');
      return false;
    }
  }
  
  // 獲取社群貼文列表
  static Future<List<Map<String, dynamic>>> getPosts() async {
    try {
      var response = await http.get(
        Uri.parse('$baseUrl/api/posts'),
      );
      
      var jsonData = json.decode(response.body);
      return List<Map<String, dynamic>>.from(jsonData['posts'] ?? []);
    } catch (e) {
      print('獲取貼文失敗: $e');
      return [];
    }
  }
  
  // 保存里程碑
  static Future<bool> saveMilestone(Map<String, dynamic> milestone) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl/api/milestones'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(milestone),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      print('保存里程碑失敗: $e');
      return false;
    }
  }
  
  // 獲取里程碑列表
  static Future<List<Map<String, dynamic>>> getMilestones() async {
    try {
      var response = await http.get(
        Uri.parse('$baseUrl/api/milestones'),
      );
      
      var jsonData = json.decode(response.body);
      return List<Map<String, dynamic>>.from(jsonData['milestones'] ?? []);
    } catch (e) {
      print('獲取里程碑失敗: $e');
      return [];
    }
  }
  
  // 用戶認證
  static Future<bool> authenticateUser(String username, String password) async {
    try {
      var response = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'username': username,
          'password': password,
        }),
      );
      
      if (response.statusCode == 200) {
        var jsonData = json.decode(response.body);
        var prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', jsonData['token'] ?? '');
        await prefs.setString('userId', jsonData['userId'] ?? '');
        return true;
      }
      
      return false;
    } catch (e) {
      print('用戶認證失敗: $e');
      return false;
    }
  }
  
  // 檢查用戶登入狀態
  static Future<bool> isLoggedIn() async {
    var prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }
  
  // 登出
  static Future<void> logout() async {
    var prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
  }
} 