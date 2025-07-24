import 'package:flutter/material.dart';
import '../../services/api_service.dart';

class RestartWallPage extends StatefulWidget {
  @override
  _RestartWallPageState createState() => _RestartWallPageState();
}

class _RestartWallPageState extends State<RestartWallPage> {
  List<Map<String, dynamic>> _posts = [];
  final TextEditingController _postController = TextEditingController();
  String _selectedCategory = 'all';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadPosts();
  }

  Future<void> _loadPosts() async {
    setState(() {
      _isLoading = true;
    });
    
    try {
      final posts = await ApiService.getPosts();
      setState(() {
        _posts = posts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      print('載入貼文失敗: $e');
      // 載入失敗時使用示例數據
      _loadSamplePosts();
    }
  }

  void _loadSamplePosts() {
    _posts = [
      {
        'id': 1,
        'username': '匿名用戶1',
        'content': '今天完成了第一個小目標，感覺很棒！',
        'category': 'achievement',
        'likes': 12,
        'comments': 3,
        'timestamp': DateTime.now().subtract(Duration(hours: 2)).toIso8601String(),
        'isLiked': false,
      },
      {
        'id': 2,
        'username': '匿名用戶2',
        'content': '遇到困難時，記得深呼吸，一切都會過去的。',
        'category': 'encouragement',
        'likes': 25,
        'comments': 8,
        'timestamp': DateTime.now().subtract(Duration(hours: 5)).toIso8601String(),
        'isLiked': true,
      },
      {
        'id': 3,
        'username': '匿名用戶3',
        'content': '重新開始不容易，但每一步都值得。',
        'category': 'reflection',
        'likes': 18,
        'comments': 5,
        'timestamp': DateTime.now().subtract(Duration(days: 1)).toIso8601String(),
        'isLiked': false,
      },
    ];
  }

  Future<void> _addPost() async {
    if (_postController.text.trim().isNotEmpty) {
      final newPost = {
        'id': DateTime.now().millisecondsSinceEpoch,
        'username': '我',
        'content': _postController.text.trim(),
        'category': 'personal',
        'likes': 0,
        'comments': 0,
        'timestamp': DateTime.now().toIso8601String(),
        'isLiked': false,
      };
      
      setState(() {
        _posts.insert(0, newPost);
      });
      
      _postController.clear();
      Navigator.pop(context);
      
      // 保存到後端
      try {
        final success = await ApiService.createPost(newPost);
        if (!success) {
          print('保存貼文失敗');
        }
      } catch (e) {
        print('保存貼文失敗: $e');
      }
    }
  }

  void _toggleLike(int postId) {
    setState(() {
      final post = _posts.firstWhere((post) => post['id'] == postId);
      post['isLiked'] = !post['isLiked'];
      post['likes'] += post['isLiked'] ? 1 : -1;
    });
  }

  List<Map<String, dynamic>> get _filteredPosts {
    if (_selectedCategory == 'all') {
      return _posts;
    }
    return _posts.where((post) => post['category'] == _selectedCategory).toList();
  }

  String _getCategoryName(String category) {
    switch (category) {
      case 'achievement':
        return '成就';
      case 'encouragement':
        return '鼓勵';
      case 'reflection':
        return '反思';
      case 'personal':
        return '個人';
      default:
        return '其他';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('重啟牆'),
        backgroundColor: Colors.orange[100],
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => _showAddPostDialog(),
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // 分類篩選
                Container(
                  height: 50,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    children: [
                      _buildCategoryChip('all', '全部'),
                      _buildCategoryChip('achievement', '成就'),
                      _buildCategoryChip('encouragement', '鼓勵'),
                      _buildCategoryChip('reflection', '反思'),
                      _buildCategoryChip('personal', '個人'),
                    ],
                  ),
                ),
                
                // 貼文列表
                Expanded(
                  child: ListView.builder(
                    itemCount: _filteredPosts.length,
                    itemBuilder: (context, index) {
                      final post = _filteredPosts[index];
                      final timestamp = post['timestamp'] != null 
                          ? DateTime.parse(post['timestamp'])
                          : DateTime.now();
                      
                      return Card(
                        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: Colors.orange[200],
                                    child: Text(
                                      (post['username'] ?? '用戶')[0],
                                      style: TextStyle(color: Colors.white),
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          post['username'] ?? '匿名用戶',
                                          style: TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                        Text(
                                          timestamp.toString().substring(0, 16),
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.orange[100],
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      _getCategoryName(post['category'] ?? ''),
                                      style: TextStyle(fontSize: 12),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 12),
                              Text(
                                post['content'] ?? '',
                                style: TextStyle(fontSize: 16),
                              ),
                              SizedBox(height: 12),
                              Row(
                                children: [
                                  GestureDetector(
                                    onTap: () => _toggleLike(post['id']),
                                    child: Row(
                                      children: [
                                        Icon(
                                          post['isLiked'] == true ? Icons.favorite : Icons.favorite_border,
                                          color: post['isLiked'] == true ? Colors.red : Colors.grey,
                                          size: 20,
                                        ),
                                        SizedBox(width: 4),
                                        Text('${post['likes'] ?? 0}'),
                                      ],
                                    ),
                                  ),
                                  SizedBox(width: 16),
                                  Row(
                                    children: [
                                      Icon(Icons.comment, color: Colors.grey, size: 20),
                                      SizedBox(width: 4),
                                      Text('${post['comments'] ?? 0}'),
                                    ],
                                  ),
                                  Spacer(),
                                  IconButton(
                                    icon: Icon(Icons.share, color: Colors.grey),
                                    onPressed: () => _sharePost(post),
                                  ),
                                ],
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
    );
  }

  Widget _buildCategoryChip(String category, String label) {
    final isSelected = _selectedCategory == category;
    return Padding(
      padding: EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            _selectedCategory = category;
          });
        },
        backgroundColor: Colors.grey[200],
        selectedColor: Colors.orange[200],
      ),
    );
  }

  void _showAddPostDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('分享你的想法'),
        content: TextField(
          controller: _postController,
          maxLines: 4,
          decoration: InputDecoration(
            hintText: '寫下你的想法...',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('取消'),
          ),
          ElevatedButton(
            onPressed: _addPost,
            child: Text('發布'),
          ),
        ],
      ),
    );
  }

  void _sharePost(Map<String, dynamic> post) {
    // 分享功能實現
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('分享功能開發中...')),
    );
  }
} 