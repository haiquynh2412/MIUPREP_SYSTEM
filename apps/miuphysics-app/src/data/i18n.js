// ─────────────────────────────────────────────────────────
// MiuPhysics — Internationalization (i18n)
// Vietnamese (vi) + English (en) translations
// ─────────────────────────────────────────────────────────

const translations = {
  vi: {
    // App
    app_name: 'MiuPhysics',
    app_subtitle: 'Vật Lý Thông Minh',
    welcome_title: 'Chào mừng đến MiuPhysics!',
    welcome_subtitle_template: 'Lớp {grade} — Hệ thống học Vật Lý thông minh với Tư duy 6 bước',
    loading: 'Đang tải MiuPhysics...',
    loading_subtitle: 'Đang tải ngân hàng câu hỏi',
    grade_prefix: 'Lớp',

    // Nav tabs
    nav_chapters: 'Chương',
    nav_explore: 'Khám phá',
    nav_challenge: 'Thử thách',
    nav_diary: 'Nhật ký',
    nav_dashboard: 'Dashboard',
    nav_achievements: 'Thành tích',
    nav_errors: 'Sổ lỗi',

    // Home view
    total_attempts: 'Tổng lượt làm',
    avg_mastery: 'Mastery trung bình',
    experience: 'Kinh nghiệm',
    questions_count: 'Câu hỏi',

    // Chapter view
    back_to_chapters: '← Quay lại danh sách chương',
    guided_learning: '🧠 Học có hướng dẫn',
    self_practice: '✏️ Tự luyện tập',
    view_solutions: '👁️ Xem lời giải',
    question_list: 'Danh sách câu hỏi',
    questions_unit: 'câu',
    no_questions: 'Chưa có câu hỏi nào cho chương này',
    chapter_intro: 'Vào bài',
    full_screen: 'Toàn màn hình',
    explored_start: 'Đã khám phá → Bắt đầu học!',

    // Practice view
    back: '← Quay lại',
    question_of: 'Câu {current} / {total}',
    mode_guided: '🧠 Hướng dẫn',
    mode_practice: '✏️ Tự luyện',
    mode_review: '👁️ Xem lời giải',
    submit_answer: '✅ Nộp đáp án',
    correct_answer: '🎉 Chính xác!',
    wrong_answer: '❌ Sai rồi! Đáp án đúng là:',
    next_question: '→ Câu tiếp theo',
    complete: '🏁 Hoàn thành',
    show_thinking: '🧠 Xem hướng dẫn tư duy',
    hide_thinking: '🧠 Ẩn hướng dẫn tư duy',
    xp_gain: '+{xp} XP',

    // Explore view
    explore_title: 'Khám phá Vật Lý',
    explore_subtitle: 'Nhiệm vụ thám tử, thí nghiệm tại nhà — khám phá vật lý quanh bạn!',
    detective_title: 'Thám tử Vật Lý',
    home_lab_title: 'Thí nghiệm tại nhà',
    detective_missions: 'Nhiệm vụ Thám tử',

    // Challenge view
    challenge_title: 'Thử thách Nhanh',
    challenge_subtitle: 'Luyện tập nhanh 5 phút — kiểm tra kiến thức và phản xạ!',

    // Diary view
    diary_title: 'Nhật ký Quan sát',
    diary_subtitle: 'Ghi lại những hiện tượng vật lý bạn quan sát được trong đời sống!',

    // Achievement view
    achievement_title: 'Thành tích',
    achievement_subtitle: 'Thu thập huy hiệu, tích lũy XP và nâng cấp level!',

    // Dashboard
    dashboard_title: 'Tổng quan Học tập',
    total_attempts_label: 'Tổng lượt làm / Total Attempts',
    stable_skills: 'Kỹ năng ổn định / Stable Skills',
    needs_repair: 'Cần sửa lỗi / Needs Repair',
    due_review: 'Cần ôn tập / Due for Review',
    overall_mastery: 'Tổng Mastery',
    skill_progress: 'Tiến độ Kỹ năng',
    quick_actions: 'Hành động nhanh',
    choose_chapter: '📚 Chọn chương học',
    review_errors: '📝 Ôn tập lỗi sai',
    ai_recommendation: 'Đề xuất AI',
    recommendation_based: 'Dựa trên mẫu học tập của bạn',

    // Error Notebook
    error_title: 'Sổ lỗi sai',
    error_subtitle: 'Hệ thống lặp lại cách quãng (SRS) giúp bạn ôn tập hiệu quả',
    total_errors: 'Tổng lỗi',
    need_review: 'Cần ôn tập',
    mastered: 'Đã thuần thục',
    review_now: 'Cần ôn tập ngay',
    understood: '✅ Đã hiểu',
    okay: '🤔 Tạm ổn',
    not_understood: '❌ Chưa hiểu',
    all_errors: 'Tất cả lỗi sai',
    reviewed_times: 'Đã ôn {count} lần',
    interval_days: 'Khoảng cách: {days} ngày',
    mastered_badge: '✅ Thuần thục',
    reviewing_badge: '🔄 Đang ôn',
    no_errors_title: 'Chưa có lỗi sai nào!',
    no_errors_desc: 'Bắt đầu luyện tập để hệ thống theo dõi và giúp bạn khắc phục lỗi sai nhé.',
    start_learning: '📚 Bắt đầu học',

    // Streak
    streak_days: 'ngày liên tiếp',
    best_streak: 'Tốt nhất: {count}',

    // Real World
    real_world_title: 'Vật Lý Quanh Ta',

    // Daily Fact
    daily_fact_badge: 'Sự thật mỗi ngày',
    daily_fact_related: 'Liên quan:',

    // Thinking Guide
    thinking_step_1: '1. Hiểu đề bài',
    thinking_step_2: '2. Xác định kiến thức',
    thinking_step_3: '3. Lập kế hoạch',
    thinking_step_4: '4. Thực hiện',
    thinking_step_5: '5. Kiểm tra',
    thinking_step_6: '6. Mở rộng',

    // Footer
    footer_text: 'MiuPhysics — Vật Lý Thông Minh • Built with 💜 by MiuPrep System',

    // Mastery status
    mastery_not_started: 'Chưa bắt đầu',
    mastery_collect: 'Cần thêm dữ liệu',
    mastery_repair: 'Cần sửa lỗi',
    mastery_build: 'Đang xây nền',
    mastery_hard: 'Cần bài khó',
    mastery_stable: 'Ổn định',

    // Recommendation
    rec_diagnostic: 'Làm diagnostic',
    rec_review: 'Ôn tập sửa lỗi',
    rec_practice: 'Luyện tập',
    rec_challenge: 'Tăng độ khó',

    // Difficulty
    diff_easy: 'Dễ',
    diff_medium: 'Trung bình',
    diff_hard: 'Khó',

    // Language
    language_label: 'Ngôn ngữ',
    lang_vi: 'Tiếng Việt',
    lang_en: 'English',

    // New additions
    home_world_explorer: 'Khám phá Thế giới',
    home_by_chapter: 'Theo Chương',
    home_thematic_matrix: 'Ma trận Chuyên đề',
    correct_count: 'câu đúng',
    daily_fact_title: '💡 Sự thật Vật Lý hôm nay',
    daily_fact_sub: 'Sự thật mới mỗi ngày',
    achievement_title_text: 'Thành tích',
    achievement_level_prefix: 'Level {level} — {title}',
    achievement_max_level: 'Cấp độ tối đa!',
    achievement_level_progress: '{xpInLevel} / {xpNeeded} XP đến Level {nextLevel}',
    achievement_streak_title: '{count} ngày liên tiếp',
    achievement_streak_desc: 'Daily Streak — Hãy duy trì chuỗi ngày học!',
    achievement_locked_msg: 'Hãy bắt đầu học để mở khóa thành tích!',
    dashboard_title_text: 'Tổng quan Học tập',
    dashboard_overall_mastery: 'Tổng Mastery',
    dashboard_overall_mastery_sub: 'Độ thuần thục kiến thức',
    dashboard_progress_title: 'Tiến độ Kỹ năng',
    dashboard_actions_title: 'Hành động nhanh',
    dashboard_recommendation_title: 'Đề xuất:',
    detective_missions_title: 'Nhiệm vụ Thám tử Vật Lý',
    detective_no_missions: 'Chưa có nhiệm vụ nào',
    detective_task_label: 'Nhiệm vụ:',
    detective_hint_show: '💡 Xem gợi ý',
    detective_hint_hide: '🙈 Ẩn gợi ý',
    detective_completed_summary: '✅ {completed} / {total} nhiệm vụ hoàn thành',
    homelab_title: 'Thí nghiệm Tại Nhà',
    homelab_no_experiments: 'Chưa có thí nghiệm nào',
    homelab_completed_badge: '✅ Đã làm',
    homelab_materials_label: '📦 Vật liệu:',
    homelab_steps_label: '📝 Các bước:',
    homelab_safety_label: '⚠️ An toàn:',
    homelab_question_label: '❓ Câu hỏi:',
    homelab_answer_show: '👁️ Xem đáp án',
    homelab_answer_hide: '🙈 Ẩn đáp án',
    homelab_mark_completed: '✅ Đánh dấu đã hoàn thành',
    diary_title_text: 'Nhật ký Quan sát',
    diary_btn_new: '+ Ghi chép mới',
    diary_btn_close: '✕ Đóng',
    diary_new_title: '✏️ Ghi chép quan sát mới',
    diary_related_chapter: '📘 Chương liên quan',
    diary_select_chapter: '-- Chọn chương --',
    diary_observation_label: '📝 Quan sát của em',
    diary_observation_placeholder: 'Hôm nay em quan sát thấy...',
    diary_tags_label: '🏷️ Thẻ',
    diary_tag_placeholder: 'Nhập thẻ...',
    diary_add_tag: 'Thêm',
    diary_save_btn: '💾 Lưu quan sát',
    diary_empty_msg: 'Chưa có quan sát nào. Hãy bắt đầu ghi chép!',
    challenge_title_text: 'Thử thách Nhanh',
    challenge_subtitle_text: 'Chọn chế độ thử thách',
    challenge_no_questions: 'Cần có câu hỏi để bắt đầu thử thách',
    challenge_timer_label: '⏱️ Thời gian',
    challenge_time_used: '{seconds}s đã dùng',
    challenge_retry_btn: '🔄 Thử lại',
    challenge_other_mode_btn: 'Chọn chế độ khác',
    challenge_rating_perfect: 'Hoàn hảo!',
    challenge_rating_excellent: 'Xuất sắc!',
    challenge_rating_good: 'Tốt lắm!',
    challenge_rating_try: 'Cố gắng thêm!',
    challenge_rating_review: 'Cần ôn tập!',
    challenge_mode_speed: 'Tốc độ',
    challenge_mode_daily: 'Hàng ngày',
    challenge_mode_boss: 'Boss',
    challenge_desc_speed: '5 câu, 30 giây',
    challenge_desc_daily: '3 câu ngẫu nhiên',
    challenge_desc_boss: '1 câu khó',
    thinking_guide_title: 'Hướng dẫn Tư duy',
    thinking_guide_hints: '💡 Gợi ý',
    thinking_guide_next_hint: 'Xem gợi ý tiếp ({current}/{total})',
    thinking_guide_traps: '⚠️ Cạm bẫy thường gặp',
    thinking_guide_locked_hint: '👆 Nhấn để mở khóa bước tiếp theo...',
  },

  en: {
    // App
    app_name: 'MiuPhysics',
    app_subtitle: 'Smart Physics Learning',
    welcome_title: 'Welcome to MiuPhysics!',
    welcome_subtitle_template: 'Grade {grade} — Smart Physics Learning System with 6-Step Thinking',
    loading: 'Loading MiuPhysics...',
    loading_subtitle: 'Loading question database',
    grade_prefix: 'Grade',

    // Nav tabs
    nav_chapters: 'Chapters',
    nav_explore: 'Explore',
    nav_challenge: 'Challenge',
    nav_diary: 'Diary',
    nav_dashboard: 'Dashboard',
    nav_achievements: 'Achievements',
    nav_errors: 'Error Log',

    // Home view
    total_attempts: 'Total Attempts',
    avg_mastery: 'Avg Mastery',
    experience: 'Experience',
    questions_count: 'Questions',

    // Chapter view
    back_to_chapters: '← Back to Chapters',
    guided_learning: '🧠 Guided Learning',
    self_practice: '✏️ Self Practice',
    view_solutions: '👁️ View Solutions',
    question_list: 'Question List',
    questions_unit: 'questions',
    no_questions: 'No questions for this chapter yet',
    chapter_intro: 'Chapter Intro',
    full_screen: 'Full Screen',
    explored_start: 'Explored → Start Learning!',

    // Practice view
    back: '← Back',
    question_of: 'Question {current} / {total}',
    mode_guided: '🧠 Guided',
    mode_practice: '✏️ Practice',
    mode_review: '👁️ Review',
    submit_answer: '✅ Submit Answer',
    correct_answer: '🎉 Correct!',
    wrong_answer: '❌ Wrong! Correct answer is:',
    next_question: '→ Next Question',
    complete: '🏁 Complete',
    show_thinking: '🧠 Show Thinking Guide',
    hide_thinking: '🧠 Hide Thinking Guide',
    xp_gain: '+{xp} XP',

    // Explore view
    explore_title: 'Explore Physics',
    explore_subtitle: 'Detective missions, home experiments — discover physics around you!',
    detective_title: 'Physics Detective',
    home_lab_title: 'Home Lab',
    detective_missions: 'Detective Missions',

    // Challenge view
    challenge_title: 'Quick Challenge',
    challenge_subtitle: 'Quick 5-minute practice — test your knowledge and reflexes!',

    // Diary view
    diary_title: 'Observation Diary',
    diary_subtitle: 'Record physics phenomena you observe in daily life!',

    // Achievement view
    achievement_title: 'Achievements',
    achievement_subtitle: 'Collect badges, earn XP and level up!',

    // Dashboard
    dashboard_title: 'Learning Overview',
    total_attempts_label: 'Total Attempts',
    stable_skills: 'Stable Skills',
    needs_repair: 'Needs Repair',
    due_review: 'Due for Review',
    overall_mastery: 'Overall Mastery',
    skill_progress: 'Skill Progress',
    quick_actions: 'Quick Actions',
    choose_chapter: '📚 Choose Chapter',
    review_errors: '📝 Review Errors',
    ai_recommendation: 'AI Recommendation',
    recommendation_based: 'Based on your learning pattern',

    // Error Notebook
    error_title: 'Error Notebook',
    error_subtitle: 'Spaced Repetition System (SRS) for effective review',
    total_errors: 'Total Errors',
    need_review: 'Need Review',
    mastered: 'Mastered',
    review_now: 'Review Now',
    understood: '✅ Understood',
    okay: '🤔 Okay',
    not_understood: '❌ Not Understood',
    all_errors: 'All Errors',
    reviewed_times: 'Reviewed {count} times',
    interval_days: 'Interval: {days} days',
    mastered_badge: '✅ Mastered',
    reviewing_badge: '🔄 Reviewing',
    no_errors_title: 'No errors yet!',
    no_errors_desc: 'Start practicing to let the system track and help you fix mistakes.',
    start_learning: '📚 Start Learning',

    // Streak
    streak_days: 'day streak',
    best_streak: 'Best: {count}',

    // Real World
    real_world_title: 'Physics Around You',

    // Daily Fact
    daily_fact_badge: 'Daily Fact',
    daily_fact_related: 'Related:',

    // Thinking Guide
    thinking_step_1: '1. Understand the problem',
    thinking_step_2: '2. Identify knowledge',
    thinking_step_3: '3. Plan',
    thinking_step_4: '4. Execute',
    thinking_step_5: '5. Verify',
    thinking_step_6: '6. Extend',

    // Footer
    footer_text: 'MiuPhysics — Smart Physics • Built with 💜 by MiuPrep System',

    // Mastery status
    mastery_not_started: 'Not Started',
    mastery_collect: 'Need More Data',
    mastery_repair: 'Needs Repair',
    mastery_build: 'Building',
    mastery_hard: 'Needs Hard Questions',
    mastery_stable: 'Stable',

    // Recommendation
    rec_diagnostic: 'Run Diagnostic',
    rec_review: 'Review Errors',
    rec_practice: 'Practice',
    rec_challenge: 'Increase Difficulty',

    // Difficulty
    diff_easy: 'Easy',
    diff_medium: 'Medium',
    diff_hard: 'Hard',

    // Language
    language_label: 'Language',
    lang_vi: 'Tiếng Việt',
    lang_en: 'English',

    // New additions
    home_world_explorer: 'World Explorer',
    home_by_chapter: 'By Chapter',
    home_thematic_matrix: 'Thematic Matrix',
    correct_count: 'correct',
    daily_fact_title: '💡 Today\'s Physics Fact',
    daily_fact_sub: 'New fact every day',
    achievement_title_text: 'Achievements',
    achievement_level_prefix: 'Level {level} — {title}',
    achievement_max_level: 'Max level reached!',
    achievement_level_progress: '{xpInLevel} / {xpNeeded} XP to Level {nextLevel}',
    achievement_streak_title: '{count}-day streak',
    achievement_streak_desc: 'Daily Streak — Keep your learning streak going!',
    achievement_locked_msg: 'Start learning to unlock achievements!',
    dashboard_title_text: 'Learning Overview',
    dashboard_overall_mastery: 'Overall Mastery',
    dashboard_overall_mastery_sub: 'Overall knowledge mastery',
    dashboard_progress_title: 'Skill Progress',
    dashboard_actions_title: 'Quick Actions',
    dashboard_recommendation_title: 'Recommendation:',
    detective_missions_title: 'Detective Missions',
    detective_no_missions: 'No missions available yet',
    detective_task_label: 'Mission:',
    detective_hint_show: '💡 Show hint',
    detective_hint_hide: '🙈 Hide hint',
    detective_completed_summary: '✅ {completed} / {total} missions completed',
    homelab_title: 'Home Lab',
    homelab_no_experiments: 'No experiments available yet',
    homelab_completed_badge: '✅ Completed',
    homelab_materials_label: '📦 Materials:',
    homelab_steps_label: '📝 Steps:',
    homelab_safety_label: '⚠️ Safety:',
    homelab_question_label: '❓ Question:',
    homelab_answer_show: '👁️ Show answer',
    homelab_answer_hide: '🙈 Hide answer',
    homelab_mark_completed: '✅ Mark as completed',
    diary_title_text: 'Observation Diary',
    diary_btn_new: '+ New Entry',
    diary_btn_close: '✕ Close',
    diary_new_title: '✏️ New Observation',
    diary_related_chapter: '📘 Related Chapter',
    diary_select_chapter: '-- Select Chapter --',
    diary_observation_label: '📝 Your Observation',
    diary_observation_placeholder: 'Today I observed...',
    diary_tags_label: '🏷️ Tags',
    diary_tag_placeholder: 'Type tag...',
    diary_add_tag: 'Add',
    diary_save_btn: '💾 Save Observation',
    diary_empty_msg: 'No observations yet. Start recording!',
    challenge_title_text: 'Quick Challenge',
    challenge_subtitle_text: 'Select a challenge mode',
    challenge_no_questions: 'Need questions to start challenge',
    challenge_timer_label: '⏱️ Time',
    challenge_time_used: '{seconds}s used',
    challenge_retry_btn: '🔄 Retry',
    challenge_other_mode_btn: 'Select another mode',
    challenge_rating_perfect: 'Perfect!',
    challenge_rating_excellent: 'Excellent!',
    challenge_rating_good: 'Good!',
    challenge_rating_try: 'Keep trying!',
    challenge_rating_review: 'Review needed!',
    challenge_mode_speed: 'Speed',
    challenge_mode_daily: 'Daily',
    challenge_mode_boss: 'Boss',
    challenge_desc_speed: '5 questions, 30s',
    challenge_desc_daily: '3 random questions',
    challenge_desc_boss: '1 hard question',
    thinking_guide_title: 'Thinking Guide',
    thinking_guide_hints: '💡 Hints',
    thinking_guide_next_hint: 'Show next hint ({current}/{total})',
    thinking_guide_traps: '⚠️ Common Traps',
    thinking_guide_locked_hint: '👆 Click to unlock the next step...',
  },
};

const LANG_STORAGE_KEY = 'miu_physics_language';

/**
 * Load saved language preference from localStorage.
 * Defaults to 'vi' (Vietnamese) when no preference is stored.
 * @returns {'vi'|'en'}
 */
export function loadLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    return stored === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
}

/**
 * Persist the selected language to localStorage.
 * @param {'vi'|'en'} lang
 */
export function saveLanguage(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
}

/**
 * Translate a key, with optional template parameter interpolation.
 *
 * @param {string}        key    — translation key (e.g. 'welcome_title')
 * @param {'vi'|'en'}     lang   — active language (default 'vi')
 * @param {Record<string, string|number>} params — template replacements
 * @returns {string}
 *
 * @example
 *   t('question_of', 'vi', { current: 3, total: 10 })
 *   // → 'Câu 3 / 10'
 */
export function t(key, lang = 'vi', params = {}) {
  let text = translations[lang]?.[key] || translations['vi']?.[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  });
  return text;
}

export { translations };
