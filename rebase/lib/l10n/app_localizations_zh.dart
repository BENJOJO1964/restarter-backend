// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get appTitle => 'ReBase™ 情緒重啟平台';

  @override
  String get welcome => '歡迎來到 ReBase™';

  @override
  String get startEchoBox => '開始使用 EchoBox';

  @override
  String get viewRestartWall => '查看 RestartWall';

  @override
  String get createMyStory => '創建 MyStory';

  @override
  String get sayYourFeeling => '說出你的心聲';

  @override
  String get tapToRecord => '點擊下方按鈕開始錄音';
}

/// The translations for Chinese, as used in China (`zh_CN`).
class AppLocalizationsZhCn extends AppLocalizationsZh {
  AppLocalizationsZhCn(): super('zh_CN');

  @override
  String get appTitle => 'ReBase™ 情绪重启平台';

  @override
  String get welcome => '欢迎来到 ReBase™';

  @override
  String get startEchoBox => '开始使用 EchoBox';

  @override
  String get viewRestartWall => '查看 RestartWall';

  @override
  String get createMyStory => '创建 MyStory';

  @override
  String get sayYourFeeling => '说出你的心声';

  @override
  String get tapToRecord => '点击下方按钮开始录音';
}

/// The translations for Chinese, as used in Taiwan (`zh_TW`).
class AppLocalizationsZhTw extends AppLocalizationsZh {
  AppLocalizationsZhTw(): super('zh_TW');

  @override
  String get appTitle => 'ReBase™ 情緒重啟平台';

  @override
  String get welcome => '歡迎來到 ReBase™';

  @override
  String get startEchoBox => '開始使用 EchoBox';

  @override
  String get viewRestartWall => '查看 RestartWall';

  @override
  String get createMyStory => '創建 MyStory';

  @override
  String get sayYourFeeling => '說出你的心聲';

  @override
  String get tapToRecord => '點擊下方按鈕開始錄音';
}
