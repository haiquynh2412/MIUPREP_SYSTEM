import { createTranslator, type TranslationDict } from '@miuprep/i18n';

// Portal translations. Externalize incrementally, screen by screen — untranslated
// literals still render fine; only keys passed to t() use this dict (with a
// requested-lang -> vi -> raw-key fallback). Keep vi and en in parity
// (the i18n test guards this).
export const portalTranslations: TranslationDict = {
  vi: {
    // Auth — tabs
    auth_tab_login: '🔑 ĐĂNG NHẬP',
    auth_tab_register: '📝 ĐĂNG KÝ MỚI',
    // Auth — login form
    auth_username_label: 'Tên đăng nhập (Username)',
    auth_username_placeholder: 'Nhập username...',
    auth_password_label: 'Mật khẩu',
    auth_login_button: 'Đăng Nhập Ngay',
    auth_first_time_hint: '* Lần đầu sử dụng? Chuyển sang tab Đăng ký và chọn vai trò Quản trị để tạo tài khoản Admin đầu tiên.',
    // Auth — register form
    auth_role_question: 'Bạn là ai meow?',
    auth_role_student: '🎒 Học Sinh',
    auth_role_parent: '🏠 Phụ Huynh',
    auth_role_admin: '👑 Admin',
    auth_username_label_required: 'Tên đăng nhập (Username) *',
    auth_username_placeholder_example: 'Ví dụ: miu.math',
    auth_displayname_label: 'Tên hiển thị (Họ Tên) *',
    auth_displayname_placeholder: 'Ví dụ: Nguyễn Văn A',
    auth_password_label_required: 'Mật khẩu *',
    auth_password_placeholder: 'Tối thiểu 6 ký tự...',
    auth_contact_label: 'Liên hệ (SĐT / Email)',
    auth_contact_placeholder: 'Số điện thoại hoặc email...',
    auth_link_student_label: 'Username Học sinh liên kết *',
    auth_link_student_placeholder: 'Username của con (phải có sẵn)...',
    auth_link_student_hint: 'Phụ huynh cần nhập đúng tên đăng nhập học sinh để đồng bộ dữ liệu.',
    auth_admin_hint: 'Tài khoản Quản trị đầu tiên của hệ thống được tạo trực tiếp tại đây. Khi đã có Quản trị viên, tài khoản quản trị mới phải do Quản trị viên hiện tại cấp.',
    auth_register_button: 'Đăng Ký Tài Khoản',
    // Header / top-bar
    header_admin_content: 'Admin Content',
    header_logout: 'Đăng Xuất ➔',
    header_ecosystem_tagline: 'Hệ sinh thái số #1',
    header_subtitle: 'Ngày mai bắt đầu từ ngày hôm nay.',
  },
  en: {
    // Auth — tabs
    auth_tab_login: '🔑 SIGN IN',
    auth_tab_register: '📝 SIGN UP',
    // Auth — login form
    auth_username_label: 'Username',
    auth_username_placeholder: 'Enter username...',
    auth_password_label: 'Password',
    auth_login_button: 'Sign In Now',
    auth_first_time_hint: '* First time here? Switch to the Sign Up tab and pick the Admin role to create the first administrator account.',
    // Auth — register form
    auth_role_question: 'Who are you?',
    auth_role_student: '🎒 Student',
    auth_role_parent: '🏠 Parent',
    auth_role_admin: '👑 Admin',
    auth_username_label_required: 'Username *',
    auth_username_placeholder_example: 'e.g. miu.math',
    auth_displayname_label: 'Display name (Full name) *',
    auth_displayname_placeholder: 'e.g. Nguyen Van A',
    auth_password_label_required: 'Password *',
    auth_password_placeholder: 'At least 6 characters...',
    auth_contact_label: 'Contact (Phone / Email)',
    auth_contact_placeholder: 'Phone number or email...',
    auth_link_student_label: 'Linked student username *',
    auth_link_student_placeholder: "Your child's username (must exist)...",
    auth_link_student_hint: "Parents must enter the student's exact username to sync data.",
    auth_admin_hint: 'The first administrator account is created directly here. Once an administrator exists, new admin accounts must be issued by an existing administrator.',
    auth_register_button: 'Create Account',
    // Header / top-bar
    header_admin_content: 'Admin Content',
    header_logout: 'Sign Out ➔',
    header_ecosystem_tagline: '#1 Digital Ecosystem',
    header_subtitle: 'Tomorrow starts today.',
  },
};

export const portalI18n = createTranslator({
  translations: portalTranslations,
  languages: ['vi', 'en'] as const,
  defaultLang: 'vi',
  storageKey: 'miuprep_portal_lang',
});

export type PortalLang = 'vi' | 'en';
