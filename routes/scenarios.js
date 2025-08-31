const express = require('express');
const router = express.Router();

// For now, we'll hardcode the scenarios here.
// In the future, this could be fetched from a database like Firestore.
const scenariosData = [
    { 
        id: 1, 
        videoReaction: 'encouragement',
        // All languages for title, description, etc.
        title: { 'zh-TW': '工作面試', 'zh-CN': '工作面试', 'en': 'Job Interview', 'ja': '就職面接', 'ko': '취업 면접', 'th': 'สัมภาษณ์งาน', 'vi': 'Phỏng vấn xin việc', 'ms': 'Temuduga Kerja', 'la': 'Colloquium pro Opere' },
        description: { 'zh-TW': '向面試官展現你的專業與熱情。', 'zh-CN': '向面试官展现你的专业与热情。', 'en': 'Show the interviewer your professionalism and passion.', 'ja': '面接官にあなたの専門性と情熱を見せましょう。', 'ko': '면접관에게 전문성과 열정을 보여주세요。', 'th': 'แสดงความเป็นมืออาชีพและความหลงใหลของคุณให้ผู้สัมภาษณ์เห็น', 'vi': 'Thể hiện sự chuyên nghiệp và đam mê của bạn với người phỏng vấn。', 'ms': 'Tunjukkan profesionalisme dan semangat anda kepada penemuduga.', 'la': 'Ostende conquisitori peritiam et studium tuum.' },
        difficulty: { 'zh-TW': '困難', 'zh-CN': '困难', 'en': 'Hard', 'ja': '難しい', 'ko': '어려움', 'th': 'ยาก', 'vi': 'Khó', 'ms': 'Sukar', 'la': 'Difficilis' },
        img: '💼',
        initialPrompt: { 'zh-TW': '你好，請坐。可以先請你自我介紹一下嗎？', 'zh-CN': '你好，请坐。可以先请你自我介绍一下吗？', 'en': 'Hello, please have a seat. Could you start by introducing yourself?', 'ja': 'こんにちは、お座りください。まず自己紹介からお願いできますか？', 'ko': '안녕하세요, 앉으세요. 먼저 자기소개 부탁드립니다。', 'th': 'สวัสดีครับ เชิญนั่งก่อนครับ ช่วยแนะนำตัวเองก่อนได้ไหมครับ', 'vi': 'Xin chào, mời ngồi. Bạn có thể bắt đầu bằng việc giới thiệu về bản thân được không?', 'ms': 'Helo, sila duduk. Boleh anda mulakan dengan memperkenalkan diri?', 'la': 'Salve, conside, quaeso. Potesne incipere te introducendo?' },
    },
    // ... Add other scenarios similarly
    { 
        id: 2, 
        videoReaction: 'clarity',
        title: { 'zh-TW': '化解爭執', 'zh-CN': '化解争执', 'en': 'Resolving a Conflict', 'ja': '対立の解消', 'ko': '갈등 해결', 'th': 'การแก้ไขข้อขัดแย้ง', 'vi': 'Giải quyết xung đột', 'ms': 'Menyelesaikan Konflik', 'la': 'Lis Solvenda' },
        description: { 'zh-TW': '與朋友和好，化解一場誤會。', 'zh-CN': '与朋友和好，化解一场误会。', 'en': 'Make up with a friend and clear up a misunderstanding.', 'ja': '友人と仲直りし、誤解を解きましょう。', 'ko': '친구와 화해하고 오해를 푸세요。', 'th': 'คืนดีกับเพื่อนและแก้ไขความเข้าใจผิด', 'vi': 'Làm hòa với một người bạn và giải quyết một sự hiểu lầm。', 'ms': 'Berbaik semula dengan rakan dan selesaikan salah faham.', 'la': 'Cum amico reconcilia et errorem resolve.' },
        difficulty: { 'zh-TW': '中等', 'zh-CN': '中等', 'en': 'Medium', 'ja': '普通', 'ko': '중간', 'th': 'ปานกลาง', 'vi': 'Trung bình', 'ms': 'Sederhana', 'la': 'Medius' },
        img: '🤝',
        initialPrompt: { 'zh-TW': '我知道你可能還在生氣，但我們可以談談嗎？', 'zh-CN': '我知道你可能还在生气，但我们可以谈谈吗？', 'en': 'I know you might still be upset, but can we talk?', 'ja': 'まだ怒っているかもしれないけど、話せる？', 'ko': '아직 화가 나 있을지 모르지만, 우리 얘기 좀 할 수 있을까?', 'th': 'ฉันรู้ว่าคุณอาจจะยังโกรธอยู่ แต่เราคุยกันได้ไหม', 'vi': 'Em biết anh có thể vẫn còn buồn, nhưng chúng ta có thể nói chuyện được không?', 'ms': 'Saya tahu awak mungkin masih marah, tapi boleh kita bercakap?', 'la': 'Scio te fortasse adhuc iratum esse, sed possumusne loqui?' },
    },
    { 
        id: 3, 
        videoReaction: 'affection',
        title: { 'zh-TW': '初次約會', 'zh-CN': '初次约会', 'en': 'First Date', 'ja': '初デート', 'ko': '첫 데이트', 'th': 'เดทแรก', 'vi': 'Hẹn hò đầu tiên', 'ms': 'Temu Janji Pertama', 'la': 'Primus Congressus' },
        description: { 'zh-TW': '留下好印象，開啟一段新關係。', 'zh-CN': '留下好印象，开启一段新关系。', 'en': 'Make a good impression and start a new relationship.', 'ja': '良い印象を与え、新しい関係を始めましょう。', 'ko': '좋은 인상을 남기고 새로운 관계를 시작하세요。', 'th': 'สร้างความประทับใจและเริ่มต้นความสัมพันธ์ใหม่', 'vi': 'Tạo ấn tượng tốt và bắt đầu một mối quan hệ mới。', 'ms': 'Buat kesan yang baik dan mulakan hubungan baru.', 'la': 'Bonam impressionem fac et novam necessitudinem incipe.' },
        difficulty: { 'zh-TW': '簡單', 'zh-CN': '简单', 'en': 'Easy', 'ja': '易しい', 'ko': '쉬움', 'th': 'ง่าย', 'vi': 'Dễ', 'ms': 'Mudah', 'la': 'Facilis' },
        img: '☕️',
        initialPrompt: { 'zh-TW': '嗨，很高興見到你！你今天過得怎麼樣？', 'zh-CN': '嗨，很高兴见到你！你今天过得怎么样？', 'en': 'Hi, it\'s great to see you! How has your day been?', 'ja': 'こんにちは、会えて嬉しいです！今日はどんな一日でしたか？', 'ko': '안녕하세요, 만나서 반가워요! 오늘 하루 어땠어요?', 'th': 'สวัสดีครับ ยินดีที่ได้เจอครับ วันนี้เป็นอย่างไรบ้าง', 'vi': 'Chào bạn, rất vui được gặp bạn! Ngày hôm nay của bạn thế nào?', 'ms': 'Hai, gembira berjumpa dengan awak! Bagaimana hari awak hari ini?', 'la': 'Salve, gaudeo te videre! Quomodo dies tuus fuit?' },
    },
];

router.get('/', (req, res) => {
    const lang = req.query.lang || 'en'; // Default to English if no lang is specified
    
    const localizedScenarios = scenariosData.map(scenario => {
        return {
            id: scenario.id,
            img: scenario.img,
            videoReaction: scenario.videoReaction,
            title: scenario.title[lang] || scenario.title['en'],
            description: scenario.description[lang] || scenario.description['en'],
            difficulty: scenario.difficulty[lang] || scenario.difficulty['en'],
            initialPrompt: scenario.initialPrompt[lang] || scenario.initialPrompt['en'],
        };
    });

    res.json(localizedScenarios);
});

module.exports = router; 