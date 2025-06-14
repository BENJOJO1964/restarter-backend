class Message {
  final String id;
  final String content;
  final DateTime timestamp;
  final String? aiReply;
  final bool isAnonymous;

  Message({
    required this.id,
    required this.content,
    required this.timestamp,
    this.aiReply,
    this.isAnonymous = true,
  });
} 