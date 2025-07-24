import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../services/api_service.dart';
import 'dart:html' as html;

class EchoBoxPage extends StatefulWidget {
  @override
  _EchoBoxPageState createState() => _EchoBoxPageState();
}

class _EchoBoxPageState extends State<EchoBoxPage> {
  final AudioRecorder _record = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isRecording = false;
  String? _recordedFilePath;
  List<Map<String, dynamic>> _voiceDiaries = [];
  bool _isLoading = false;
  html.SpeechSynthesis? _speechSynthesis;

  @override
  void initState() {
    super.initState();
    _loadVoiceDiaries();
    if (kIsWeb) {
      _initSpeechSynthesis();
    }
  }

  void _initSpeechSynthesis() {
    try {
      _speechSynthesis = html.window.speechSynthesis;
    } catch (e) {
      print('語音合成初始化失敗: $e');
    }
  }

  Future<void> _loadVoiceDiaries() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final diaries = await ApiService.getVoiceDiaries();
      setState(() {
        _voiceDiaries = diaries;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('載入語音日記失敗: $e');
      // 載入失敗時使用示例數據
      _loadSampleDiaries();
    }
  }

  void _loadSampleDiaries() {
    _voiceDiaries = [
      {
        'id': 1,
        'title': '今天的心情',
        'content': '今天感覺很棒，完成了所有計劃的任務。',
        'date': DateTime.now().subtract(Duration(hours: 2)).toIso8601String(),
        'emotion': 'happy',
      },
      {
        'id': 2,
        'title': '反思時刻',
        'content': '需要學會更好地管理時間，提高效率。',
        'date': DateTime.now().subtract(Duration(days: 1)).toIso8601String(),
        'emotion': 'neutral',
      },
    ];
  }

  Future<void> _startRecording() async {
    try {
      // 檢查是否在網頁環境
      if (kIsWeb) {
        // 網頁版使用模擬錄音
        setState(() {
          _isRecording = true;
        });
        
        // 模擬錄音過程
        await Future.delayed(Duration(seconds: 3));
        
        setState(() {
          _isRecording = false;
        });
        
        // 添加模擬語音日記
        _addMockVoiceDiary();
      } else {
        // 移動端使用真實錄音
        if (await _record.hasPermission()) {
          await _record.start(
            const RecordConfig(),
            path: '/tmp/record_${DateTime.now().millisecondsSinceEpoch}.m4a',
          );
          setState(() {
            _isRecording = true;
          });
        }
      }
    } catch (e) {
      print('錄音失敗: $e');
    }
  }

  void _addMockVoiceDiary() {
    final mockTexts = [
      '今天心情很好，完成了所有工作。',
      '遇到了一些挑戰，但都克服了。',
      '學會了新的技能，感覺很有成就感。',
      '和朋友聊天很開心，分享了很多想法。',
      '反思今天的行為，發現還有改進空間。',
    ];
    
    final randomText = mockTexts[DateTime.now().millisecond % mockTexts.length];
    
    final diary = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'title': '語音日記 ${_voiceDiaries.length + 1}',
      'content': randomText,
      'date': DateTime.now().toIso8601String(),
      'emotion': 'neutral',
    };
    
    setState(() {
      _voiceDiaries.insert(0, diary);
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('已添加模擬語音日記')),
    );
  }

  Future<void> _stopRecording() async {
    if (kIsWeb) {
      setState(() {
        _isRecording = false;
      });
    } else {
      try {
        final path = await _record.stop();
        setState(() {
          _isRecording = false;
          _recordedFilePath = path;
        });
        
        // 語音轉文字
        if (path != null) {
          await _processRecording(path);
        }
      } catch (e) {
        print('停止錄音失敗: $e');
      }
    }
  }

  Future<void> _processRecording(String path) async {
    setState(() {
      _isLoading = true;
    });

    try {
      // 語音轉文字
      final text = await ApiService.speechToText(path);
      
      if (text.isNotEmpty) {
        // 添加到語音日記列表
        final diary = {
          'id': DateTime.now().millisecondsSinceEpoch,
          'path': path,
          'title': '語音日記 ${_voiceDiaries.length + 1}',
          'content': text,
          'date': DateTime.now().toIso8601String(),
          'emotion': 'neutral',
          'duration': 0,
        };
        
        // 保存到後端
        final success = await ApiService.saveVoiceDiary(diary);
        
        if (success) {
          setState(() {
            _voiceDiaries.insert(0, diary);
            _isLoading = false;
          });
        } else {
          setState(() {
            _isLoading = false;
          });
          _showErrorDialog('保存失敗', '無法保存語音日記，請稍後再試。');
        }
      } else {
        setState(() {
          _isLoading = false;
        });
        _showErrorDialog('轉換失敗', '無法識別語音內容，請重新錄音。');
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('處理錄音失敗: $e');
      _showErrorDialog('處理失敗', '處理錄音時發生錯誤，請稍後再試。');
    }
  }

  Future<void> _playRecording(String path) async {
    try {
      if (kIsWeb) {
        // 網頁版使用文字轉語音
        _playTextToSpeech();
      } else {
        // 移動端使用真實音訊播放
        await _audioPlayer.play(DeviceFileSource(path));
      }
    } catch (e) {
      print('播放失敗: $e');
      if (kIsWeb) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('文字轉語音功能載入中...')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('播放功能在網頁版暫不支援')),
        );
      }
    }
  }

  void _playTextToSpeech() {
    // 網頁版文字轉語音功能
    if (_speechSynthesis != null) {
      try {
        // 停止當前播放
        _speechSynthesis!.cancel();
        
        // 創建新的語音合成
        final utterance = html.SpeechSynthesisUtterance('正在播放語音日記內容');
        utterance.lang = 'zh-TW';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        _speechSynthesis!.speak(utterance);
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('正在使用文字轉語音播放...'),
            duration: Duration(seconds: 2),
          ),
        );
      } catch (e) {
        print('文字轉語音失敗: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('文字轉語音功能暫時無法使用')),
        );
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('瀏覽器不支援語音合成功能')),
      );
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('確定'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('回音盒'),
        backgroundColor: Colors.purple[100],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // 錄音控制區域
              Container(
                padding: EdgeInsets.all(20),
                child: Column(
                  children: [
                    // 錄音按鈕
                    GestureDetector(
                      onTapDown: (_) => _startRecording(),
                      onTapUp: (_) => _stopRecording(),
                      onTapCancel: () => _stopRecording(),
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: _isRecording ? Colors.red : Colors.purple[300],
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          _isRecording ? Icons.stop : Icons.mic,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                    ),
                    SizedBox(height: 10),
                    Text(
                      _isRecording ? '錄音中...' : '按住錄音',
                      style: TextStyle(fontSize: 16),
                    ),
                    if (kIsWeb)
                      Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: Text(
                          '(網頁版使用模擬錄音)',
                          style: TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ),
                  ],
                ),
              ),
              
              // 語音日記列表
              Expanded(
                child: _isLoading
                    ? Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        itemCount: _voiceDiaries.length,
                        itemBuilder: (context, index) {
                          final diary = _voiceDiaries[index];
                          return Card(
                            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                            child: ListTile(
                              leading: Icon(Icons.audiotrack, color: Colors.purple[300]),
                              title: Text(diary['title'] ?? '語音日記'),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    diary['content'] ?? '',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  Text(
                                    diary['date'] != null 
                                        ? DateTime.parse(diary['date']).toString().substring(0, 19)
                                        : '',
                                    style: TextStyle(fontSize: 12, color: Colors.grey),
                                  ),
                                ],
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: Icon(Icons.play_arrow),
                                    onPressed: () => _playRecording(diary['path'] ?? ''),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.edit),
                                    onPressed: () => _editDiary(diary),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
          // 載入指示器
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: Center(
                child: Card(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('處理中...'),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _editDiary(Map<String, dynamic> diary) {
    final titleController = TextEditingController(text: diary['title']);
    String selectedEmotion = diary['emotion'] ?? 'neutral';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('編輯語音日記'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(labelText: '標題'),
              controller: titleController,
            ),
            SizedBox(height: 10),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(labelText: '情緒'),
              value: selectedEmotion,
              items: [
                DropdownMenuItem(value: 'happy', child: Text('開心')),
                DropdownMenuItem(value: 'sad', child: Text('難過')),
                DropdownMenuItem(value: 'angry', child: Text('生氣')),
                DropdownMenuItem(value: 'neutral', child: Text('平靜')),
              ],
              onChanged: (value) {
                selectedEmotion = value ?? 'neutral';
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('取消'),
          ),
          ElevatedButton(
            onPressed: () async {
              diary['title'] = titleController.text;
              diary['emotion'] = selectedEmotion;
              
              // 更新到後端
              final success = await ApiService.saveVoiceDiary(diary);
              
              if (success) {
                setState(() {});
                Navigator.pop(context);
              } else {
                _showErrorDialog('更新失敗', '無法更新語音日記，請稍後再試。');
              }
            },
            child: Text('保存'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _record.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }
} 