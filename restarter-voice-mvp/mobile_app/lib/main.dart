import 'package:flutter/material.dart';
import 'features/echo_box/echo_box_page.dart';
import 'features/restart_wall/restart_wall_page.dart';
import 'features/my_story/my_story_page.dart';

void main() {
  runApp(RestarterApp());
}

class RestarterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Restarter',
      theme: ThemeData(
        primarySwatch: Colors.purple,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: MainNavigationPage(),
    );
  }
}

class MainNavigationPage extends StatefulWidget {
  @override
  _MainNavigationPageState createState() => _MainNavigationPageState();
}

class _MainNavigationPageState extends State<MainNavigationPage> {
  int _currentIndex = 0;
  
  final List<Widget> _pages = [
    EchoBoxPage(),
    RestartWallPage(),
    MyStoryPage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.mic),
            label: '回音盒',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.wallpaper),
            label: '重啟牆',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.book),
            label: '我的故事',
          ),
        ],
      ),
    );
  }
}
