import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

const LOGO_BAR_HEIGHT = 90;

const LogoBar = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: LOGO_BAR_HEIGHT,
    background: 'transparent',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  }}>
    <img src="/ctx-logo.png" alt="Logo" style={{ width: 120, height: 80, marginLeft: 120, pointerEvents: 'auto' }} />
  </div>
);

const BACK_TEXT = {
  'zh-TW': '返回',
  'zh-CN': '返回',
  'en': 'Back',
  'ja': '戻る',
  'ko': '뒤로',
  'th': 'กลับ',
  'vi': 'Quay lại',
  'ms': 'Kembali',
  'la': 'Revertere',
};

const LANGS = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'th', label: 'ไทย' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'la', label: 'Latin' },
];

const FOOTER_TEXT = {
  'zh-TW': { privacy: '隱私權政策', deletion: '資料刪除說明' },
  'zh-CN': { privacy: '隐私政策', deletion: '资料删除说明' },
  'en': { privacy: 'Privacy Policy', deletion: 'Data Deletion' },
  'ja': { privacy: 'プライバシーポリシー', deletion: 'データ削除について' },
  'ko': { privacy: '개인정보처리방침', deletion: '데이터 삭제 안내' },
  'th': { privacy: 'นโยบายความเป็นส่วนตัว', deletion: 'นโยบายการลบข้อมูล' },
  'vi': { privacy: 'Chính sách bảo mật', deletion: 'Chính sách xóa dữ liệu' },
  'ms': { privacy: 'Dasar Privasi', deletion: 'Dasar Pemadaman Data' },
  'la': { privacy: 'Consilium Privacy', deletion: 'Norma Deletionis Datae' },
};

const POLICY = {
  'zh-TW': (
    <div>
      <h1>Restarter™ App 隱私權政策</h1>
      <p>本應用程式由 Restarter™ 團隊開發，致力於保護您的個人資料與隱私權。本政策說明我們如何收集、使用、儲存、保護及分享您的個人資料，並說明您對於個人資料的權利。</p>
      <h2>一、我們收集的資料</h2>
      <ul>
        <li>電子郵件地址（Email）</li>
        <li>使用者名稱/暱稱</li>
        <li>頭像（如有上傳）</li>
        <li>性別、年齡、國家/地區、城市（如用戶自願填寫）</li>
        <li>興趣、經歷事件、個人描述等自願填寫的資料</li>
        <li>登入紀錄、操作紀錄（僅用於安全與服務優化）</li>
      </ul>
      <h2>二、資料用途</h2>
      <ul>
        <li>用於身份驗證、帳號管理與個人化服務</li>
        <li>用於社群互動、配對、任務、花園等功能</li>
        <li>用於服務安全、錯誤偵測與防止濫用</li>
        <li>用於統計分析與產品優化（僅以匿名方式）</li>
        <li>不會將您的個人資料出售、出租或未經授權分享給第三方</li>
      </ul>
      <h2>三、第三方服務</h2>
      <p>本應用程式使用 Google Firebase 作為後端服務平台，Firebase 可能會根據其 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">隱私政策</a> 處理技術資料（如裝置資訊、IP、操作紀錄等）。</p>
      <p>如您使用 Google、Apple、Facebook 等第三方帳號登入，僅會取得必要的公開資訊（如 email、暱稱、頭像），不會取得您的密碼。</p>
      <h2>四、Cookie 與追蹤技術</h2>
      <p>本應用程式可能使用 Cookie 或類似技術以提升用戶體驗與安全性。您可於瀏覽器設定中管理 Cookie 偏好。</p>
      <h2>五、資料儲存與保護</h2>
      <ul>
        <li>所有個人資料均儲存於 Google Firebase 雲端，並採用業界標準的加密與安全措施。</li>
        <li>僅授權人員可存取您的個人資料，且僅限於服務維護與法規要求。</li>
      </ul>
      <h2>六、您的權利</h2>
      <ul>
        <li>您有權查詢、更正、下載或刪除您的個人資料。</li>
        <li>您可隨時於 App 內或來信要求刪除帳號與所有資料，我們將於 3-5 個工作天內完成。</li>
        <li>聯絡信箱：<a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>七、政策變更</h2>
      <p>如本政策有重大變更，將於 App 內公告並更新本頁內容。</p>
    </div>
  ),
  'zh-CN': (
    <div>
      <h1>Restarter™ App 隐私政策</h1>
      <p>本应用程序由 Restarter™ 团队开发，致力于保护您的个人资料与隐私权。本政策说明我们如何收集、使用、存储、保护及分享您的个人资料，并说明您对于个人资料的权利。</p>
      <h2>一、我们收集的资料</h2>
      <ul>
        <li>电子邮件地址（Email）</li>
        <li>用户名/昵称</li>
        <li>头像（如有上传）</li>
        <li>性别、年龄、国家/地区、城市（如用户自愿填写）</li>
        <li>兴趣、经历事件、个人描述等自愿填写的资料</li>
        <li>登录记录、操作记录（仅用于安全与服务优化）</li>
      </ul>
      <h2>二、资料用途</h2>
      <ul>
        <li>用于身份验证、账号管理与个性化服务</li>
        <li>用于社群互动、配对、任务、花园等功能</li>
        <li>用于服务安全、错误检测与防止滥用</li>
        <li>用于统计分析与产品优化（仅以匿名方式）</li>
        <li>不会将您的个人资料出售、出租或未经授权分享给第三方</li>
      </ul>
      <h2>三、第三方服务</h2>
      <p>本应用程序使用 Google Firebase 作为后端服务平台，Firebase 可能会根据其 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">隐私政策</a> 处理技术资料（如设备信息、IP、操作记录等）。</p>
      <p>如您使用 Google、Apple、Facebook 等第三方账号登录，仅会取得必要的公开信息（如 email、昵称、头像），不会取得您的密码。</p>
      <h2>四、Cookie 与追踪技术</h2>
      <p>本应用程序可能使用 Cookie 或类似技术以提升用户体验与安全性。您可于浏览器设置中管理 Cookie 偏好。</p>
      <h2>五、资料存储与保护</h2>
      <ul>
        <li>所有个人资料均存储于 Google Firebase 云端，并采用业界标准的加密与安全措施。</li>
        <li>仅授权人员可存取您的个人资料，且仅限于服务维护与法规要求。</li>
      </ul>
      <h2>六、您的权利</h2>
      <ul>
        <li>您有权查询、更正、下载或删除您的个人资料。</li>
        <li>您可随时于 App 内或来信要求删除账号与所有资料，我们将于 3-5 个工作天内完成。</li>
        <li>联系邮箱：<a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>七、政策变更</h2>
      <p>如本政策有重大变更，将于 App 内公告并更新本页内容。</p>
    </div>
  ),
  'en': (
    <div>
      <h1>Privacy Policy for Restarter™ App</h1>
      <p>Restarter™ is committed to protecting your privacy. This policy explains how we collect, use, store, and protect your personal information, and your rights regarding your data.</p>
      <h2>1. Information We Collect</h2>
      <ul>
        <li>Email address</li>
        <li>Username/Nickname</li>
        <li>Avatar (if uploaded)</li>
        <li>Gender, age, country/region, city (if provided)</li>
        <li>Interests, life events, personal description (if provided)</li>
        <li>Login and activity logs (for security and service improvement)</li>
      </ul>
      <h2>2. Purpose of Collection</h2>
      <ul>
        <li>Authentication, account management, and personalized services</li>
        <li>Community interaction, matching, missions, garden features</li>
        <li>Service security, error detection, and abuse prevention</li>
        <li>Statistical analysis and product improvement (anonymized)</li>
        <li>We do not sell, rent, or share your personal data with third parties without your consent</li>
      </ul>
      <h2>3. Third-Party Services</h2>
      <p>This app uses Google Firebase as its backend. Firebase may process technical data according to its <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> (e.g., device info, IP, activity logs).</p>
      <p>If you log in via Google, Apple, or Facebook, we only access your public info (email, nickname, avatar), never your password.</p>
      <h2>4. Cookies and Tracking</h2>
      <p>We may use cookies or similar technologies to enhance your experience and security. You can manage cookie preferences in your browser settings.</p>
      <h2>5. Data Storage and Protection</h2>
      <ul>
        <li>All personal data is stored on Google Firebase cloud with industry-standard encryption and security.</li>
        <li>Only authorized personnel can access your data, solely for service maintenance or legal compliance.</li>
      </ul>
      <h2>6. Your Rights</h2>
      <ul>
        <li>You have the right to access, correct, download, or delete your personal data.</li>
        <li>You may request account/data deletion at any time via the app or by email. We will process your request within 3-5 business days.</li>
        <li>Contact: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. Policy Updates</h2>
      <p>We will notify users of major changes to this policy via in-app announcements and update this page accordingly.</p>
    </div>
  ),
  'ja': (
    <div>
      <h1>Restarter™ アプリ プライバシーポリシー</h1>
      <p>本アプリはRestarter™チームによって開発され、ユーザーの個人情報とプライバシーの保護に努めています。本ポリシーは、どのように個人情報を収集・利用・保存・保護・共有するか、またユーザーの権利について説明します。</p>
      <h2>1. 収集する情報</h2>
      <ul>
        <li>メールアドレス</li>
        <li>ユーザー名/ニックネーム</li>
        <li>アバター（アップロードした場合）</li>
        <li>性別、年齢、国/地域、都市（任意）</li>
        <li>興味、経験イベント、自己紹介（任意）</li>
        <li>ログイン・操作履歴（セキュリティ・サービス向上のため）</li>
      </ul>
      <h2>2. 利用目的</h2>
      <ul>
        <li>認証、アカウント管理、パーソナライズサービス</li>
        <li>コミュニティ交流、マッチング、ミッション、ガーデン機能</li>
        <li>サービスの安全性、エラー検出、不正防止</li>
        <li>統計分析・製品改善（匿名化）</li>
        <li>同意なく第三者に個人情報を販売・共有しません</li>
      </ul>
      <h2>3. サードパーティサービス</h2>
      <p>本アプリはGoogle Firebaseをバックエンドとして使用しています。Firebaseは <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</a> に従い技術情報（デバイス情報、IP、操作履歴など）を処理する場合があります。</p>
      <p>Google、Apple、Facebook等でログインした場合、公開情報（メール、ニックネーム、アバター）のみ取得し、パスワードは取得しません。</p>
      <h2>4. Cookieとトラッキング技術</h2>
      <p>本アプリはユーザー体験と安全性向上のため コッキー または類似技術を使用する場合があります。ブラウザ設定でCookieの管理が可能です。</p>
      <h2>5. データ保存と保護</h2>
      <ul>
        <li>全ての個人情報はGoogle Firebaseクラウドに保存され、業界標準の暗号化とセキュリティで保護されます。</li>
        <li>認可された担当者のみがサービス保守や法令遵守のためにアクセス可能です。</li>
      </ul>
      <h2>6. ユーザーの権利</h2>
      <ul>
        <li>個人情報の照会、訂正、ダウンロード、削除が可能です。</li>
        <li>アプリ内またはメールでいつでも削除依頼ができ、3～5営業日以内に対応します。</li>
        <li>連絡先：<a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. ポリシーの変更</h2>
      <p>本ポリシーに重大な変更がある場合、アプリ内で告知し本ページを更新します。</p>
    </div>
  ),
  'ko': (
    <div>
      <h1>Restarter™ 앱 개인정보처리방침</h1>
      <p>본 앱은 Restarter™ 팀이 개발하였으며, 사용자의 개인정보와 프라이버시 보호에 최선을 다합니다. 본 정책은 개인정보의 수집, 이용, 저장, 보호, 공유 방법과 사용자의 권리에 대해 설명합니다.</p>
      <h2>1. 수집하는 정보</h2>
      <ul>
        <li>이메일 주소</li>
        <li>사용자명/닉네임</li>
        <li>아바타(업로드한 경우)</li>
        <li>성별, 나이, 국가/지역, 도시(선택사항)</li>
        <li>관심사, 경험 이벤트, 자기소개(선택사항)</li>
        <li>로그인 및 활동 기록(보안 및 서비스 개선 목적)</li>
      </ul>
      <h2>2. 수집 목적</h2>
      <ul>
        <li>인증, 계정 관리, 개인화 서비스</li>
        <li>커뮤니티 상호작용, 매칭, 미션, 가든 기능</li>
        <li>서비스 보안, 오류 탐지, 오용 방지</li>
        <li>통계 분석 및 제품 개선(익명화)</li>
        <li>동의 없이 제3자에게 개인정보를 판매, 임대, 공유하지 않습니다</li>
      </ul>
      <h2>3. 제3자 서비스</h2>
      <p>본 앱은 Google Firebase를 백엔드로 사용합니다. Firebase는 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침</a>에 따라 기술 정보를 처리할 수 있습니다(예: 기기 정보, IP, 활동 기록 등).</p>
      <p>Google, Apple, Facebook 등으로 로그인 시 공개 정보(이메일, 닉네임, 아바타)만 수집하며, 비밀번호는 수집하지 않습니다.</p>
      <h2>4. 쿠키 및 추적 기술</h2>
      <p>본 앱은 사용자 경험 및 보안 향상을 위해 쿠키 또는 유사 기술을 사용할 수 있습니다. 브라우저 설정에서 쿠키 환경설정이 가능합니다.</p>
      <h2>5. 데이터 저장 및 보호</h2>
      <ul>
        <li>모든 개인정보는 Google Firebase 클라우드에 저장되며, 업계 표준 암호화 및 보안이 적용됩니다.</li>
        <li>서비스 유지보수 및 법적 요구에 한해 인가된 인원만 접근할 수 있습니다.</li>
      </ul>
      <h2>6. 사용자의 권리</h2>
      <ul>
        <li>개인정보의 조회, 수정, 다운로드, 삭제가 가능합니다.</li>
        <li>앱 내 또는 이메일로 언제든 삭제 요청이 가능하며, 3~5영업일 이내에 처리됩니다.</li>
        <li>연락처: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. 정책 변경</h2>
      <p>정책에 중대한 변경이 있을 경우 앱 내 공지 및 본 페이지를 업데이트합니다.</p>
    </div>
  ),
  'th': (
    <div>
      <h1>นโยบายความเป็นส่วนตัวของแอป Restarter™</h1>
      <p>แอปนี้พัฒนาโดยทีมงาน Restarter™ มุ่งมั่นในการปกป้องข้อมูลส่วนบุคคลและความเป็นส่วนตัวของคุณ นโยบายนี้อธิบายวิธีการเก็บรวบรวม ใช้ จัดเก็บ ปกป้อง และแบ่งปันข้อมูลส่วนบุคคลของคุณ รวมถึงสิทธิ์ของคุณ</p>
      <h2>1. ข้อมูลที่เราเก็บรวบรวม</h2>
      <ul>
        <li>ที่อยู่อีเมล</li>
        <li>ชื่อผู้ใช้/ชื่อเล่น</li>
        <li>อวาตาร์ (ถ้าอัปโหลด)</li>
        <li>เพศ อายุ ประเทศ/ภูมิภาค เมือง (ถ้าระบุ)</li>
        <li>ความสนใจ เหตุการณ์ในชีวิต คำอธิบายส่วนตัว (ถ้าระบุ)</li>
        <li>บันทึกการเข้าสู่ระบบและกิจกรรม (เพื่อความปลอดภัยและปรับปรุงบริการ)</li>
      </ul>
      <h2>2. วัตถุประสงค์ของการเก็บข้อมูล</h2>
      <ul>
        <li>การยืนยันตัวตน การจัดการบัญชี และบริการส่วนบุคคล</li>
        <li>การมีปฏิสัมพันธ์ในชุมชน การจับคู่ ภารกิจ ฟีเจอร์สวน</li>
        <li>ความปลอดภัยของบริการ การตรวจจับข้อผิดพลาด และป้องกันการละเมิด</li>
        <li>การวิเคราะห์สถิติและปรับปรุงผลิตภัณฑ์ (แบบไม่ระบุตัวตน)</li>
        <li>จะไม่ขาย ให้เช่า หรือแบ่งปันข้อมูลส่วนบุคคลของคุณกับบุคคลที่สามโดยไม่ได้รับความยินยอม</li>
      </ul>
      <h2>3. บริการของบุคคลที่สาม</h2>
      <p>แอปนี้ใช้ Google Firebase เป็นแบ็กเอนด์ Firebase อาจประมวลผลข้อมูลทางเทคนิคตาม <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">นโยบายความเป็นส่วนตัว</a> (เช่น ข้อมูลอุปกรณ์ IP บันทึกกิจกรรม)</p>
      <p>หากคุณเข้าสู่ระบบผ่าน Google, Apple หรือ Facebook เราจะเข้าถึงเฉพาะข้อมูลสาธารณะ (อีเมล ชื่อเล่น อวาตาร์) ไม่เคยเข้าถึงรหัสผ่านของคุณ</p>
      <h2>4. คุกกี้และการติดตาม</h2>
      <p>เราอาจใช้คุกกี้หรือเทคโนโลยีที่คล้ายกันเพื่อปรับปรุงประสบการณ์และความปลอดภัยของคุณ คุณสามารถจัดการคุกกี้ได้ในเบราว์เซอร์ของคุณ</p>
      <h2>5. การจัดเก็บและปกป้องข้อมูล</h2>
      <ul>
        <li>ข้อมูลส่วนบุคคลทั้งหมดจะถูกจัดเก็บบนคลาวด์ Google Firebase ด้วยการเข้ารหัสและความปลอดภัยตามมาตรฐานอุตสาหกรรม</li>
        <li>มีเพียงบุคลากรที่ได้รับอนุญาตเท่านั้นที่สามารถเข้าถึงข้อมูลของคุณเพื่อการบำรุงรักษาบริการหรือปฏิบัติตามกฎหมาย</li>
      </ul>
      <h2>6. สิทธิ์ของคุณ</h2>
      <ul>
        <li>คุณมีสิทธิ์เข้าถึง แก้ไข ดาวน์โหลด หรือขอลบข้อมูลส่วนบุคคลของคุณ</li>
        <li>คุณสามารถขอลบบัญชี/ข้อมูลได้ตลอดเวลาผ่านแอปหรืออีเมล เราจะดำเนินการภายใน 3-5 วันทำการ</li>
        <li>ติดต่อ: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. การอัปเดตนโยบาย</h2>
      <p>เราจะแจ้งให้ผู้ใช้ทราบถึงการเปลี่ยนแปลงที่สำคัญของนโยบายนี้ผ่านการประกาศในแอปและอัปเดตหน้านี้ตามความเหมาะสม</p>
    </div>
  ),
  'vi': (
    <div>
      <h1>Chính sách bảo mật cho ứng dụng Restarter™</h1>
      <p>Restarter™ cam kết bảo vệ quyền riêng tư của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn, cũng như quyền của bạn đối với dữ liệu đó.</p>
      <h2>1. Thông tin chúng tôi thu thập</h2>
      <ul>
        <li>Địa chỉ email</li>
        <li>Tên người dùng/Biệt danh</li>
        <li>Ảnh đại diện (nếu tải lên)</li>
        <li>Giới tính, tuổi, quốc gia/khu vực, thành phố (nếu cung cấp)</li>
        <li>Sở thích, sự kiện cuộc sống, mô tả cá nhân (nếu cung cấp)</li>
        <li>Nhật ký đăng nhập và hoạt động (để bảo mật và cải thiện dịch vụ)</li>
      </ul>
      <h2>2. Mục đích thu thập</h2>
      <ul>
        <li>Xác thực, quản lý tài khoản và dịch vụ cá nhân hóa</li>
        <li>Tương tác cộng đồng, ghép đôi, nhiệm vụ, tính năng vườn</li>
        <li>Bảo mật dịch vụ, phát hiện lỗi và ngăn chặn lạm dụng</li>
        <li>Phân tích thống kê và cải tiến sản phẩm (ẩn danh)</li>
        <li>Chúng tôi không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn với bên thứ ba nếu không có sự đồng ý của bạn</li>
      </ul>
      <h2>3. Dịch vụ của bên thứ ba</h2>
      <p>Ứng dụng này sử dụng Google Firebase làm backend. Firebase có thể xử lý dữ liệu kỹ thuật theo <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Chính sách bảo mật</a> (ví dụ: thông tin thiết bị, IP, nhật ký hoạt động).</p>
      <p>Nếu bạn đăng nhập qua Google, Apple hoặc Facebook, chúng tôi chỉ truy cập thông tin công khai của bạn (email, biệt danh, ảnh đại diện), không bao giờ truy cập mật khẩu của bạn.</p>
      <h2>4. Cookie và theo dõi</h2>
      <p>Chúng tôi có thể sử dụng cookie hoặc các công nghệ tương tự để nâng cao trải nghiệm và bảo mật của bạn. Bạn có thể quản lý cookie trong cài đặt trình duyệt của mình.</p>
      <h2>5. Lưu trữ và bảo vệ dữ liệu</h2>
      <ul>
        <li>Tất cả dữ liệu cá nhân được lưu trữ trên đám mây Google Firebase với mã hóa và bảo mật tiêu chuẩn ngành.</li>
        <li>Chỉ những nhân viên được ủy quyền mới có thể truy cập dữ liệu của bạn, chỉ để bảo trì dịch vụ hoặc tuân thủ pháp luật.</li>
      </ul>
      <h2>6. Quyền của bạn</h2>
      <ul>
        <li>Bạn có quyền truy cập, chỉnh sửa, tải xuống hoặc xóa dữ liệu cá nhân của mình.</li>
        <li>Bạn có thể yêu cầu xóa tài khoản/dữ liệu bất cứ lúc nào qua ứng dụng hoặc email. Chúng tôi sẽ xử lý yêu cầu của bạn trong vòng 3-5 ngày làm việc.</li>
        <li>Liên hệ: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. Cập nhật chính sách</h2>
      <p>Chúng tôi sẽ thông báo cho người dùng về những thay đổi lớn đối với chính sách này qua thông báo trong ứng dụng và cập nhật trang này cho phù hợp.</p>
    </div>
  ),
  'ms': (
    <div>
      <h1>Dasar Privasi untuk Aplikasi Restarter™</h1>
      <p>Restarter™ komited untuk melindungi privasi anda. Polisi ini menerangkan bagaimana kami mengumpul, menggunakan, menyimpan dan melindungi maklumat peribadi anda, serta hak anda terhadap data tersebut.</p>
      <h2>1. Maklumat yang Kami Kumpul</h2>
      <ul>
        <li>Alamat emel</li>
        <li>Nama pengguna/Nama samaran</li>
        <li>Avatar (jika dimuat naik)</li>
        <li>Jantina, umur, negara/wilayah, bandar (jika diberikan)</li>
        <li>Minat, peristiwa hidup, keterangan peribadi (jika diberikan)</li>
        <li>Log masuk dan aktiviti (untuk keselamatan dan penambahbaikan perkhidmatan)</li>
      </ul>
      <h2>2. Tujuan Pengumpulan</h2>
      <ul>
        <li>Pengesahan, pengurusan akaun dan perkhidmatan peribadi</li>
        <li>Interaksi komuniti, padanan, misi, ciri taman</li>
        <li>Keselamatan perkhidmatan, pengesanan ralat dan pencegahan penyalahgunaan</li>
        <li>Analisis statistik dan penambahbaikan produk (tanpa nama)</li>
        <li>Kami tidak akan menjual, menyewa atau berkongsi data peribadi anda dengan pihak ketiga tanpa kebenaran anda</li>
      </ul>
      <h2>3. Perkhidmatan Pihak Ketiga</h2>
      <p>Aplikasi ini menggunakan Google Firebase sebagai backend. Firebase mungkin memproses data teknikal mengikut <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Dasar Privasi</a> (cth: maklumat peranti, IP, log aktiviti).</p>
      <p>Jika anda log masuk melalui Google, Apple atau Facebook, kami hanya mengakses maklumat awam anda (emel, nama samaran, avatar), tidak pernah kata laluan anda.</p>
      <h2>4. Kuki dan Penjejakan</h2>
      <p>Kami mungkin menggunakan kuki atau teknologi serupa untuk meningkatkan pengalaman dan keselamatan anda. Anda boleh mengurus pilihan kuki dalam tetapan pelayar anda.</p>
      <h2>5. Penyimpanan dan Perlindungan Data</h2>
      <ul>
        <li>Semua data peribadi disimpan di awan Google Firebase dengan penyulitan dan keselamatan piawaian industri.</li>
        <li>Soli homines auctoritate praediti possunt tuas notitias accedere, tantum ad servitium vel leges tuendas.</li>
      </ul>
      <h2>6. Hak Anda</h2>
      <ul>
        <li>Anda berhak untuk mengakses, membetulkan, memuat turun atau memadam data peribadi anda.</li>
        <li>Anda boleh meminta pemadaman akaun/data pada bila-bila masa melalui aplikasi atau e-mel. Kami akan memproses permintaan anda dalam masa 3-5 hari bekerja.</li>
        <li>Hubungi: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. Kemas Kini Polisi</h2>
      <p>Kami akan memaklumkan pengguna tentang perubahan besar pada polisi ini melalui pengumuman dalam aplikasi dan mengemas kini halaman ini dengan sewajarnya.</p>
    </div>
  ),
  'la': (
    <div>
      <h1>Consilium Privacy pro Restarter™ App</h1>
      <p>Restarter™ ad tuendam tuam privacy studet. Haec consilia explicat quomodo notitias personales colligamus, utamur, condamus, tueamur, et iura tua de notitiis exponat.</p>
      <h2>1. Quae colligimus</h2>
      <ul>
        <li>Inscriptionem electronicam</li>
        <li>Nomen usoris/Sobriquet</li>
        <li>Avatar (si sublatus)</li>
        <li>Sexus, aetas, regio/natio, urbs (si praebetur)</li>
        <li>Studia, eventus vitae, descriptio personalis (si praebetur)</li>
        <li>Acta login et actio (ad securitatem et emendationem servitii)</li>
      </ul>
      <h2>2. Propositum collectionis</h2>
      <ul>
        <li>Authenticatio, administratio rationis, officia personalia</li>
        <li>Communitas, paria, missiones, hortus</li>
        <li>Securitas servitii, errorum detectio, abusus praeventio</li>
        <li>Analysis statistica et emendatio producti (anonymizata)</li>
        <li>Notitias tuas non vendimus, locamus, nec sine consensu communicamus</li>
      </ul>
      <h2>3. Officia tertiarum partium</h2>
      <p>Haec app utitur Google Firebase ut backend. Firebase potest notitias technicas tractare secundum <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">Consilium Privacy</a> (ex. info de machina, IP, acta actionum).</p>
      <p>Si per Google, Apple, Facebook ingredieris, solum publicas notitias tuas accedimus (email, sobriquet, avatar), numquam tesseram tuam.</p>
      <h2>4. Cookies et vestigatio</h2>
      <p>Possumus uti cookies aut similibus technologiis ad experientiam et securitatem tuam augendam. Praeferentias cookies in navigatoris tuis regere potes.</p>
      <h2>5. Reconditio et tutela notitiarum</h2>
      <ul>
        <li>Omnes notitiae personales in Google Firebase nube servantur, cum encryptione et securitate industriae.</li>
        <li>Soli homines auctoritate praediti possunt tuas notitias accedere, tantum ad servitium vel leges tuendas.</li>
      </ul>
      <h2>6. Iura tua</h2>
      <ul>
        <li>Ius habes accedere, corrigere, extrahere, aut delere notitias tuas personales.</li>
        <li>Potes petere deletionem rationis/datae quovis tempore per app vel email. Processum intra 3-5 dies negotiales perficimus.</li>
        <li>Contactus: <a href="mailto:rbben521@gmail.com">rbben521@gmail.com</a></li>
      </ul>
      <h2>7. Renovatio consilii</h2>
      <p>De mutationibus maioribus huius consilii usores per nuntios in app certiorem faciemus et hanc paginam proinde renovabimus.</p>
    </div>
  ),
};

export default function PrivacyPolicy() {
  const lang = localStorage.getItem('lang') || 'zh-TW';
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#111827', color: 'white', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <button
        onClick={() => navigate('/register', { replace: true })}
        style={{ position: 'absolute', top: 32, left: 36, zIndex: 10, backgroundColor: '#374151', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', fontSize: 16 }}>
        &larr; {BACK_TEXT[lang] || '返回'}
      </button>
      <div style={{ flex: '1 0 auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', color: '#111', borderRadius: 16, padding: 32, position: 'relative' }}>
          {POLICY[lang] || POLICY['zh-TW']}
          <div style={{ textAlign: 'center', marginTop: 48, color: '#888', fontSize: 16 }}>
            CTX Goodlife Copyright 2025
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 