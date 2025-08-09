// 法律文件多語言處理腳本
(function() {
    'use strict';

    // 支援的語言代碼
    const SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en', 'ja', 'ko', 'th', 'vi', 'ms', 'la'];
    
    // 語言標籤映射
    const LANG_LABELS = {
        'zh-TW': '繁體中文',
        'zh-CN': '简体中文', 
        'en': 'English',
        'ja': '日本語',
        'ko': '한국어',
        'th': 'ภาษาไทย',
        'vi': 'Tiếng Việt',
        'ms': 'Bahasa Melayu',
        'la': 'Latīna'
    };

    // 獲取當前語言設定
    function getCurrentLanguage() {
        try {
            const savedLang = localStorage.getItem('lang');
            if (savedLang && SUPPORTED_LANGS.includes(savedLang)) {
                return savedLang;
            }
            
            // 如果沒有保存的語言，嘗試從瀏覽器語言檢測
            const browserLang = navigator.language || navigator.userLanguage || 'en';
            const langMap = {
                'en': 'en',
                'en-US': 'en',
                'en-GB': 'en',
                'zh-TW': 'zh-TW',
                'zh-HK': 'zh-TW',
                'zh-Hant': 'zh-TW',
                'zh-CN': 'zh-CN',
                'zh-Hans': 'zh-CN',
                'ja': 'ja',
                'ko': 'ko',
                'vi': 'vi',
                'th': 'th',
                'ms': 'ms',
                'la': 'la'
            };
            
            if (langMap[browserLang]) {
                return langMap[browserLang];
            } else if (langMap[browserLang.split('-')[0]]) {
                return langMap[browserLang.split('-')[0]];
            }
        } catch (error) {
            console.warn('Failed to get language setting:', error);
        }
        
        return 'zh-TW'; // 預設語言
    }

    // 法律文件的多語言內容
    const LEGAL_TRANSLATIONS = {
        'privacy-policy': {
            'zh-TW': {
                title: 'Restarter™ 隱私權政策',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 隐私权政策',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Privacy Policy',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ プライバシーポリシー',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 개인정보처리방침',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ นโยบายความเป็นส่วนตัว',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Chính sách bảo mật',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Dasar Privasi',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Politica Privatitatis',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'terms-of-service': {
            'zh-TW': {
                title: 'Restarter™ 服務條款',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 服务条款',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Terms of Service',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ 利用規約',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 서비스 약관',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ ข้อกำหนดการใช้บริการ',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Điều khoản dịch vụ',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Terma Perkhidmatan',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Conditiones Servitii',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'ai-statement': {
            'zh-TW': {
                title: 'Restarter™ AI使用聲明',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ AI使用声明',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ AI Usage Statement',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ AI使用声明',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ AI 사용 성명',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ คำแถลงการใช้ AI',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Tuyên bố sử dụng AI',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Kenyataan Penggunaan AI',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Declaratio Usus AI',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'mental-health-disclaimer': {
            'zh-TW': {
                title: 'Restarter™ 心理健康免責聲明',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 心理健康免责声明',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Mental Health Disclaimer',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ メンタルヘルス免責事項',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 정신건강 면책조항',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ ข้อปฏิเสธความรับผิดชอบด้านสุขภาพจิต',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Tuyên bố miễn trách về sức khỏe tâm thần',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Penafian Kesihatan Mental',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Disclaimatio Sanitatis Mentalis',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'data-deletion': {
            'zh-TW': {
                title: 'Restarter™ 數據刪除說明',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 数据删除说明',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Data Deletion Guide',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ データ削除ガイド',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 데이터 삭제 가이드',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ คู่มือการลบข้อมูล',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Hướng dẫn xóa dữ liệu',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Panduan Pemadaman Data',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Manuale Deletionis Datorum',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'cookie-policy': {
            'zh-TW': {
                title: 'Restarter™ Cookie政策',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ Cookie政策',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Cookie Policy',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ Cookieポリシー',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 쿠키 정책',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ นโยบาย Cookie',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Chính sách Cookie',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Dasar Cookie',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Politica Cookie',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'children-privacy': {
            'zh-TW': {
                title: 'Restarter™ 兒童隱私保護',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 儿童隐私保护',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Children\'s Privacy Protection',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ 児童プライバシー保護',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 아동 개인정보 보호',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ การปกป้องความเป็นส่วนตัวของเด็ก',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Bảo vệ quyền riêng tư trẻ em',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Perlindungan Privasi Kanak-kanak',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Protectio Privatitatis Infantum',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'international-users': {
            'zh-TW': {
                title: 'Restarter™ 國際用戶聲明',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 国际用户声明',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ International Users Statement',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ 国際ユーザー声明',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 국제 사용자 성명',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ คำแถลงผู้ใช้นานาชาติ',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Tuyên bố người dùng quốc tế',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Kenyataan Pengguna Antarabangsa',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Declaratio Usorum Internationalium',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'security-statement': {
            'zh-TW': {
                title: 'Restarter™ 安全聲明',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 安全声明',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Security Statement',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ セキュリティ声明',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 보안 성명',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ คำแถลงความปลอดภัย',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Tuyên bố bảo mật',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Kenyataan Keselamatan',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Declaratio Securitatis',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        },
        'update-notification': {
            'zh-TW': {
                title: 'Restarter™ 更新通知機制',
                lastUpdated: '最後更新：',
                effectiveDate: '生效日期：'
            },
            'zh-CN': {
                title: 'Restarter™ 更新通知机制',
                lastUpdated: '最后更新：',
                effectiveDate: '生效日期：'
            },
            'en': {
                title: 'Restarter™ Update Notification Policy',
                lastUpdated: 'Last Updated:',
                effectiveDate: 'Effective Date:'
            },
            'ja': {
                title: 'Restarter™ 更新通知ポリシー',
                lastUpdated: '最終更新：',
                effectiveDate: '発効日：'
            },
            'ko': {
                title: 'Restarter™ 업데이트 알림 정책',
                lastUpdated: '최종 업데이트：',
                effectiveDate: '시행일：'
            },
            'th': {
                title: 'Restarter™ นโยบายการแจ้งเตือนการอัปเดต',
                lastUpdated: 'อัปเดตล่าสุด：',
                effectiveDate: 'วันที่มีผลบังคับใช้：'
            },
            'vi': {
                title: 'Restarter™ Chính sách thông báo cập nhật',
                lastUpdated: 'Cập nhật lần cuối：',
                effectiveDate: 'Ngày có hiệu lực：'
            },
            'ms': {
                title: 'Restarter™ Dasar Pemberitahuan Kemaskini',
                lastUpdated: 'Kemaskini Terakhir：',
                effectiveDate: 'Tarikh Berkuatkuasa：'
            },
            'la': {
                title: 'Restarter™ Politica Notificationis Renovationis',
                lastUpdated: 'Novissime Renovatum：',
                effectiveDate: 'Dies Effectivus：'
            }
        }
    };

    // 聯絡資訊的多語言資料
    const CONTACT_TRANSLATIONS = {
        'zh-TW': {
            contactUs: '聯絡我們',
            email: '電子郵件：',
            phone: '電話：',
            address: '地址：',
            dpo: '資料保護官（DPO）',
            support: '客服支援',
            legal: '法律諮詢',
            privacy: '隱私權投訴'
        },
        'zh-CN': {
            contactUs: '联系我们',
            email: '电子邮件：',
            phone: '电话：',
            address: '地址：',
            dpo: '数据保护官（DPO）',
            support: '客服支持',
            legal: '法律咨询',
            privacy: '隐私权投诉'
        },
        'en': {
            contactUs: 'Contact Us',
            email: 'Email:',
            phone: 'Phone:',
            address: 'Address:',
            dpo: 'Data Protection Officer (DPO)',
            support: 'Customer Support',
            legal: 'Legal Consultation',
            privacy: 'Privacy Complaints'
        },
        'ja': {
            contactUs: 'お問い合わせ',
            email: 'メール：',
            phone: '電話：',
            address: '住所：',
            dpo: 'データ保護責任者（DPO）',
            support: 'カスタマーサポート',
            legal: '法的相談',
            privacy: 'プライバシー苦情'
        },
        'ko': {
            contactUs: '문의하기',
            email: '이메일：',
            phone: '전화：',
            address: '주소：',
            dpo: '개인정보보호책임자（DPO）',
            support: '고객 지원',
            legal: '법률 상담',
            privacy: '개인정보 불만'
        },
        'th': {
            contactUs: 'ติดต่อเรา',
            email: 'อีเมล：',
            phone: 'โทรศัพท์：',
            address: 'ที่อยู่：',
            dpo: 'เจ้าหน้าที่คุ้มครองข้อมูล（DPO）',
            support: 'ฝ่ายสนับสนุนลูกค้า',
            legal: 'คำปรึกษาทางกฎหมาย',
            privacy: 'ร้องเรียนเรื่องความเป็นส่วนตัว'
        },
        'vi': {
            contactUs: 'Liên hệ với chúng tôi',
            email: 'Email：',
            phone: 'Điện thoại：',
            address: 'Địa chỉ：',
            dpo: 'Nhân viên bảo vệ dữ liệu（DPO）',
            support: 'Hỗ trợ khách hàng',
            legal: 'Tư vấn pháp lý',
            privacy: 'Khiếu nại về quyền riêng tư'
        },
        'ms': {
            contactUs: 'Hubungi Kami',
            email: 'E-mel：',
            phone: 'Telefon：',
            address: 'Alamat：',
            dpo: 'Pegawai Perlindungan Data（DPO）',
            support: 'Sokongan Pelanggan',
            legal: 'Perundingan Undang-undang',
            privacy: 'Aduan Privasi'
        },
        'la': {
            contactUs: 'Contacte Nos',
            email: 'Epistula：',
            phone: 'Telephonium：',
            address: 'Sedes：',
            dpo: 'Officialis Protectionis Datorum（DPO）',
            support: 'Auxilium Clientum',
            legal: 'Consultatio Legalis',
            privacy: 'Querelae Privatitatis'
        }
    };

    // 更新頁面內容
    function updatePageContent() {
        const currentLang = getCurrentLanguage();
        
        // 獲取當前頁面類型
        const pageType = getPageType();
        
        // 更新標題
        updateTitle(pageType, currentLang);
        
        // 更新聯絡資訊
        updateContactInfo(currentLang);
        
        // 更新語言切換器
        updateLanguageToggle(currentLang);
        
        // 更新HTML lang屬性
        document.documentElement.lang = currentLang;
    }

    // 獲取頁面類型
    function getPageType() {
        const path = window.location.pathname;
        if (path.includes('privacy-policy')) return 'privacy-policy';
        if (path.includes('terms-of-service')) return 'terms-of-service';
        if (path.includes('ai-statement')) return 'ai-statement';
        if (path.includes('mental-health-disclaimer')) return 'mental-health-disclaimer';
        if (path.includes('data-deletion')) return 'data-deletion';
        if (path.includes('cookie-policy')) return 'cookie-policy';
        if (path.includes('children-privacy')) return 'children-privacy';
        if (path.includes('international-users')) return 'international-users';
        if (path.includes('security-statement')) return 'security-statement';
        if (path.includes('update-notification')) return 'update-notification';
        return 'privacy-policy'; // 預設
    }

    // 更新標題
    function updateTitle(pageType, lang) {
        const translations = LEGAL_TRANSLATIONS[pageType];
        if (translations && translations[lang]) {
            const titleElement = document.querySelector('h1');
            if (titleElement) {
                titleElement.textContent = translations[lang].title;
            }
            
            // 更新頁面標題
            document.title = translations[lang].title;
        }
    }

    // 更新聯絡資訊
    function updateContactInfo(lang) {
        const contactData = CONTACT_TRANSLATIONS[lang] || CONTACT_TRANSLATIONS['zh-TW'];
        
        // 更新聯絡我們標題
        const contactTitle = document.querySelector('.contact-title, h2:contains("聯絡我們")');
        if (contactTitle) {
            contactTitle.textContent = contactData.contactUs;
        }
    }

    // 添加語言切換器
    function addLanguageToggle() {
        // 檢查是否已經存在語言切換器
        if (document.getElementById('lang-toggle')) return;
        
        const toggleContainer = document.createElement('div');
        toggleContainer.id = 'lang-toggle';
        toggleContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 8px;
        `;
        
        const select = document.createElement('select');
        select.style.cssText = `
            border: none;
            background: transparent;
            font-size: 14px;
            font-weight: 600;
            color: #6B5BFF;
            cursor: pointer;
            outline: none;
            padding: 4px 8px;
        `;
        
        // 添加選項
        SUPPORTED_LANGS.forEach(langCode => {
            const option = document.createElement('option');
            option.value = langCode;
            option.textContent = LANG_LABELS[langCode];
            select.appendChild(option);
        });
        
        // 設置當前語言
        select.value = getCurrentLanguage();
        
        // 添加變更事件
        select.addEventListener('change', function() {
            const newLang = this.value;
            localStorage.setItem('lang', newLang);
            updatePageContent();
        });
        
        toggleContainer.appendChild(select);
        document.body.appendChild(toggleContainer);
    }

    // 更新語言切換器
    function updateLanguageToggle(currentLang) {
        const select = document.querySelector('#lang-toggle select');
        if (select) {
            select.value = currentLang;
        }
    }

    // 監聽語言變更
    function setupLanguageListener() {
        // 監聽 localStorage 變更
        window.addEventListener('storage', function(e) {
            if (e.key === 'lang') {
                updatePageContent();
            }
        });
        
        // 定期檢查語言設定（用於同頁面內的語言切換）
        setInterval(() => {
            const currentLang = getCurrentLanguage();
            if (window.lastDetectedLang !== currentLang) {
                window.lastDetectedLang = currentLang;
                updatePageContent();
            }
        }, 1000);
    }

    // 初始化
    function init() {
        updatePageContent();
        addLanguageToggle();
        setupLanguageListener();
        
        // 設置初始語言
        window.lastDetectedLang = getCurrentLanguage();
    }

    // 當 DOM 加載完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露全域函數供外部使用
    window.LegalMultilingual = {
        getCurrentLanguage,
        updatePageContent,
        SUPPORTED_LANGS,
        LANG_LABELS
    };

})();
