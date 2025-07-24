import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class MyStoryPage extends StatefulWidget {
  @override
  _MyStoryPageState createState() => _MyStoryPageState();
}

class _MyStoryPageState extends State<MyStoryPage> {
  List<Map<String, dynamic>> _milestones = [];
  Map<String, dynamic> _userProfile = {
    'name': '我的故事',
    'startDate': DateTime.now().subtract(Duration(days: 30)),
    'totalDays': 30,
    'achievements': 5,
    'currentStreak': 7,
  };
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadMilestones();
  }

  Future<void> _loadMilestones() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final milestones = await ApiService.getMilestones();
      setState(() {
        _milestones = milestones;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('載入里程碑失敗: $e');
      // 載入失敗時使用示例數據
      _loadSampleMilestones();
    }
  }

  void _loadSampleMilestones() {
    _milestones = [
      {
        'id': 1,
        'title': '開始新的旅程',
        'description': '決定重新開始，為自己設定新的目標',
        'date': DateTime.now().subtract(Duration(days: 30)).toIso8601String(),
        'type': 'start',
        'completed': true,
      },
      {
        'id': 2,
        'title': '完成第一個小目標',
        'description': '成功完成了一項小任務，感覺很棒',
        'date': DateTime.now().subtract(Duration(days: 25)).toIso8601String(),
        'type': 'achievement',
        'completed': true,
      },
      {
        'id': 3,
        'title': '學會控制情緒',
        'description': '在困難時刻保持冷靜，學會了情緒管理',
        'date': DateTime.now().subtract(Duration(days: 20)).toIso8601String(),
        'type': 'growth',
        'completed': true,
      },
      {
        'id': 4,
        'title': '建立新的習慣',
        'description': '每天堅持做一些小事情，建立正向習慣',
        'date': DateTime.now().subtract(Duration(days: 15)).toIso8601String(),
        'type': 'habit',
        'completed': true,
      },
      {
        'id': 5,
        'title': '幫助他人',
        'description': '第一次主動幫助別人，感受到付出的快樂',
        'date': DateTime.now().subtract(Duration(days: 10)).toIso8601String(),
        'type': 'help',
        'completed': true,
      },
      {
        'id': 6,
        'title': '設定更大的目標',
        'description': '為自己設定更具挑戰性的目標',
        'date': DateTime.now().add(Duration(days: 5)).toIso8601String(),
        'type': 'goal',
        'completed': false,
      },
    ];
  }

  Future<void> _addMilestone() async {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    String selectedType = 'achievement';
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('添加里程碑'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(labelText: '標題'),
              controller: titleController,
            ),
            SizedBox(height: 10),
            TextField(
              decoration: InputDecoration(labelText: '描述'),
              maxLines: 3,
              controller: descriptionController,
            ),
            SizedBox(height: 10),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(labelText: '類型'),
              value: selectedType,
              items: [
                DropdownMenuItem(value: 'start', child: Text('開始')),
                DropdownMenuItem(value: 'achievement', child: Text('成就')),
                DropdownMenuItem(value: 'growth', child: Text('成長')),
                DropdownMenuItem(value: 'habit', child: Text('習慣')),
                DropdownMenuItem(value: 'help', child: Text('幫助')),
                DropdownMenuItem(value: 'goal', child: Text('目標')),
              ],
              onChanged: (value) {
                selectedType = value ?? 'achievement';
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
              if (titleController.text.trim().isNotEmpty) {
                final milestone = {
                  'id': DateTime.now().millisecondsSinceEpoch,
                  'title': titleController.text.trim(),
                  'description': descriptionController.text.trim(),
                  'date': DateTime.now().toIso8601String(),
                  'type': selectedType,
                  'completed': false,
                };
                
                // 保存到後端
                final success = await ApiService.saveMilestone(milestone);
                
                if (success) {
                  setState(() {
                    _milestones.insert(0, milestone);
                  });
                  Navigator.pop(context);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('保存失敗，請稍後再試')),
                  );
                }
              }
            },
            child: Text('添加'),
          ),
        ],
      ),
    );
  }

  String _getMilestoneTypeName(String type) {
    switch (type) {
      case 'start':
        return '開始';
      case 'achievement':
        return '成就';
      case 'growth':
        return '成長';
      case 'habit':
        return '習慣';
      case 'help':
        return '幫助';
      case 'goal':
        return '目標';
      default:
        return '其他';
    }
  }

  Color _getMilestoneTypeColor(String type) {
    switch (type) {
      case 'start':
        return Colors.blue;
      case 'achievement':
        return Colors.green;
      case 'growth':
        return Colors.purple;
      case 'habit':
        return Colors.orange;
      case 'help':
        return Colors.pink;
      case 'goal':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('我的故事'),
        backgroundColor: Colors.green[100],
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _addMilestone,
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  // 用戶概況卡片
                  Container(
                    margin: EdgeInsets.all(16),
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.green[200]!, Colors.green[100]!],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 40,
                          backgroundColor: Colors.white,
                          child: Icon(Icons.person, size: 40, color: Colors.green[600]),
                        ),
                        SizedBox(height: 16),
                        Text(
                          _userProfile['name'],
                          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 8),
                        Text(
                          '開始於 ${_userProfile['startDate'].toString().substring(0, 10)}',
                          style: TextStyle(color: Colors.grey[700]),
                        ),
                        SizedBox(height: 16),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatCard('總天數', '${_userProfile['totalDays']}'),
                            _buildStatCard('成就', '${_userProfile['achievements']}'),
                            _buildStatCard('連續', '${_userProfile['currentStreak']}天'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // 時間軸
                  Container(
                    margin: EdgeInsets.symmetric(horizontal: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '我的里程碑',
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        SizedBox(height: 16),
                        ..._milestones.map((milestone) => _buildMilestoneCard(milestone)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStatCard(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        Text(
          label,
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildMilestoneCard(Map<String, dynamic> milestone) {
    final isCompleted = milestone['completed'] == true;
    final typeColor = _getMilestoneTypeColor(milestone['type'] ?? '');
    final date = milestone['date'] != null 
        ? DateTime.parse(milestone['date'])
        : DateTime.now();
    
    return Container(
      margin: EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          // 時間軸線和點
          Column(
            children: [
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: isCompleted ? typeColor : Colors.grey[300],
                  shape: BoxShape.circle,
                ),
                child: isCompleted
                    ? Icon(Icons.check, color: Colors.white, size: 14)
                    : null,
              ),
              if (milestone != _milestones.last)
                Container(
                  width: 2,
                  height: 40,
                  color: Colors.grey[300],
                ),
            ],
          ),
          SizedBox(width: 16),
          
          // 里程碑內容
          Expanded(
            child: Card(
              elevation: isCompleted ? 4 : 1,
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: typeColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _getMilestoneTypeName(milestone['type'] ?? ''),
                            style: TextStyle(
                              color: typeColor,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Spacer(),
                        Text(
                          date.toString().substring(0, 10),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      milestone['title'] ?? '',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: isCompleted ? Colors.black : Colors.grey[600],
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      milestone['description'] ?? '',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[700],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
} 