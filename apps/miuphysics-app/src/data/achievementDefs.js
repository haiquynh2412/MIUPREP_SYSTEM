/**
 * achievementDefs.js — Achievement & Level definitions for MiuPhysics
 * Gamification system: badges, streaks, mastery, speed, exploration, and leveling.
 */

export const ACHIEVEMENTS = [
  // ===== FIRST STEPS =====
  {
    id: 'ach_first_correct',
    icon: '🌟',
    title: 'Bước Đầu Tiên',
    titleEn: 'First Step',
    description: 'Trả lời đúng câu hỏi đầu tiên',
    descriptionEn: 'Correctly answer the first question',
    condition: 'first_correct',
    xpReward: 50,
  },
  {
    id: 'ach_first_chapter',
    icon: '📖',
    title: 'Mở Sách',
    titleEn: 'Book Opener',
    description: 'Hoàn thành bài học đầu tiên trong một chương',
    descriptionEn: 'Complete the first lesson in a chapter',
    condition: 'first_chapter_complete',
    xpReward: 75,
  },
  {
    id: 'ach_first_experiment',
    icon: '🧪',
    title: 'Nhà Thí Nghiệm Nhí',
    titleEn: 'Little Scientist',
    description: 'Hoàn thành thí nghiệm tại nhà đầu tiên',
    descriptionEn: 'Complete the first home experiment',
    condition: 'first_experiment',
    xpReward: 60,
  },
  {
    id: 'ach_first_detective',
    icon: '🔍',
    title: 'Thám Tử Tập Sự',
    titleEn: 'Junior Detective',
    description: 'Hoàn thành nhiệm vụ thám tử đầu tiên',
    descriptionEn: 'Complete the first detective mission',
    condition: 'first_detective',
    xpReward: 60,
  },

  // ===== STREAKS =====
  {
    id: 'ach_streak_3',
    icon: '🔥',
    title: 'Chuỗi Lửa',
    titleEn: 'Fire Streak',
    description: 'Học 3 ngày liên tiếp',
    descriptionEn: 'Study for 3 consecutive days',
    condition: 'streak_3',
    xpReward: 100,
  },
  {
    id: 'ach_streak_7',
    icon: '💎',
    title: 'Chuỗi Kim Cương',
    titleEn: 'Diamond Streak',
    description: 'Học 7 ngày liên tiếp',
    descriptionEn: 'Study for 7 consecutive days',
    condition: 'streak_7',
    xpReward: 250,
  },
  {
    id: 'ach_streak_14',
    icon: '🏆',
    title: 'Chuỗi Vàng',
    titleEn: 'Golden Streak',
    description: 'Học 14 ngày liên tiếp',
    descriptionEn: 'Study for 14 consecutive days',
    condition: 'streak_14',
    xpReward: 500,
  },
  {
    id: 'ach_streak_30',
    icon: '👑',
    title: 'Chuỗi Huyền Thoại',
    titleEn: 'Legendary Streak',
    description: 'Học 30 ngày liên tiếp',
    descriptionEn: 'Study for 30 consecutive days',
    condition: 'streak_30',
    xpReward: 1000,
  },

  // ===== CORRECT ANSWER MILESTONES =====
  {
    id: 'ach_correct_10',
    icon: '✅',
    title: 'Bắt Đầu Tốt',
    titleEn: 'Good Start',
    description: 'Trả lời đúng 10 câu hỏi',
    descriptionEn: 'Correctly answer 10 questions',
    condition: 'correct_10',
    xpReward: 80,
  },
  {
    id: 'ach_correct_50',
    icon: '🎯',
    title: 'Xạ Thủ',
    titleEn: 'Sharpshooter',
    description: 'Trả lời đúng 50 câu hỏi',
    descriptionEn: 'Correctly answer 50 questions',
    condition: 'correct_50',
    xpReward: 200,
  },
  {
    id: 'ach_correct_100',
    icon: '💯',
    title: 'Bách Phát Bách Trúng',
    titleEn: 'Century',
    description: 'Trả lời đúng 100 câu hỏi',
    descriptionEn: 'Correctly answer 100 questions',
    condition: 'correct_100',
    xpReward: 400,
  },
  {
    id: 'ach_correct_500',
    icon: '🌟',
    title: 'Siêu Sao',
    titleEn: 'Superstar',
    description: 'Trả lời đúng 500 câu hỏi',
    descriptionEn: 'Correctly answer 500 questions',
    condition: 'correct_500',
    xpReward: 1000,
  },

  // ===== PERFECT SCORES =====
  {
    id: 'ach_perfect_chapter',
    icon: '💯',
    title: 'Hoàn Hảo',
    titleEn: 'Perfect Score',
    description: 'Đạt 100% đúng trong một chương',
    descriptionEn: 'Get 100% correct in a single chapter',
    condition: 'perfect_chapter',
    xpReward: 300,
  },
  {
    id: 'ach_perfect_3_chapters',
    icon: '🏅',
    title: 'Hattrick Hoàn Hảo',
    titleEn: 'Perfect Hattrick',
    description: 'Đạt 100% đúng trong 3 chương',
    descriptionEn: 'Get 100% correct in 3 chapters',
    condition: 'perfect_3_chapters',
    xpReward: 600,
  },
  {
    id: 'ach_no_mistakes_10',
    icon: '🎯',
    title: 'Không Sai Một Câu',
    titleEn: 'Flawless 10',
    description: 'Trả lời đúng 10 câu liên tiếp',
    descriptionEn: 'Correctly answer 10 consecutive questions',
    condition: 'no_mistakes_10',
    xpReward: 250,
  },

  // ===== SPEED =====
  {
    id: 'ach_speed_demon',
    icon: '⚡',
    title: 'Nhanh Như Chớp',
    titleEn: 'Speed Demon',
    description: 'Trả lời đúng trong vòng 10 giây',
    descriptionEn: 'Correctly answer a question within 10 seconds',
    condition: 'answer_under_10s',
    xpReward: 100,
  },
  {
    id: 'ach_speed_5_streak',
    icon: '🚀',
    title: 'Tên Lửa',
    titleEn: 'Rocket',
    description: 'Trả lời đúng 5 câu liên tiếp dưới 15 giây mỗi câu',
    descriptionEn: 'Correctly answer 5 consecutive questions under 15 seconds each',
    condition: 'speed_streak_5',
    xpReward: 300,
  },

  // ===== CHAPTER MASTERY =====
  {
    id: 'ach_master_measurement',
    icon: '📏',
    title: 'Bậc Thầy Đo Lường',
    titleEn: 'Measurement Master',
    description: 'Đạt mastery 100% chương Các phép đo',
    descriptionEn: 'Reach 100% mastery in Measurement chapter',
    condition: 'master_measurement',
    xpReward: 200,
  },
  {
    id: 'ach_master_force',
    icon: '💪',
    title: 'Bậc Thầy Lực',
    titleEn: 'Force Master',
    description: 'Đạt mastery 100% chương Lực cơ bản',
    descriptionEn: 'Reach 100% mastery in Force Basics chapter',
    condition: 'master_force_basics',
    xpReward: 200,
  },
  {
    id: 'ach_master_light',
    icon: '💡',
    title: 'Bậc Thầy Ánh Sáng',
    titleEn: 'Light Master',
    description: 'Đạt mastery 100% chương Ánh sáng',
    descriptionEn: 'Reach 100% mastery in Light Basics chapter',
    condition: 'master_light_basics',
    xpReward: 200,
  },
  {
    id: 'ach_master_sound',
    icon: '🔊',
    title: 'Bậc Thầy Âm Thanh',
    titleEn: 'Sound Master',
    description: 'Đạt mastery 100% chương Âm thanh',
    descriptionEn: 'Reach 100% mastery in Sound Basics chapter',
    condition: 'master_sound_basics',
    xpReward: 200,
  },
  {
    id: 'ach_master_energy',
    icon: '⚡',
    title: 'Bậc Thầy Năng Lượng',
    titleEn: 'Energy Master',
    description: 'Đạt mastery 100% chương Năng lượng',
    descriptionEn: 'Reach 100% mastery in Energy Basics chapter',
    condition: 'master_energy_basics',
    xpReward: 200,
  },
  {
    id: 'ach_master_circuit',
    icon: '🔌',
    title: 'Bậc Thầy Mạch Điện',
    titleEn: 'Circuit Master',
    description: 'Đạt mastery 100% chương Mạch điện',
    descriptionEn: 'Reach 100% mastery in Electric Circuit chapter',
    condition: 'master_electric_circuit',
    xpReward: 250,
  },
  {
    id: 'ach_master_pressure',
    icon: '🔧',
    title: 'Bậc Thầy Áp Suất',
    titleEn: 'Pressure Master',
    description: 'Đạt mastery 100% chương Áp suất',
    descriptionEn: 'Reach 100% mastery in Pressure chapter',
    condition: 'master_pressure',
    xpReward: 200,
  },
  {
    id: 'ach_master_buoyancy',
    icon: '🚢',
    title: 'Bậc Thầy Archimedes',
    titleEn: 'Archimedes Master',
    description: 'Đạt mastery 100% chương Lực đẩy Archimedes',
    descriptionEn: 'Reach 100% mastery in Buoyancy chapter',
    condition: 'master_buoyancy',
    xpReward: 200,
  },

  // ===== GRADE COMPLETION =====
  {
    id: 'ach_complete_grade6',
    icon: '🎓',
    title: 'Tốt Nghiệp Lớp 6',
    titleEn: 'Grade 6 Graduate',
    description: 'Hoàn thành tất cả chương lớp 6',
    descriptionEn: 'Complete all Grade 6 chapters',
    condition: 'complete_grade_6',
    xpReward: 500,
  },
  {
    id: 'ach_complete_grade7',
    icon: '🎓',
    title: 'Tốt Nghiệp Lớp 7',
    titleEn: 'Grade 7 Graduate',
    description: 'Hoàn thành tất cả chương lớp 7',
    descriptionEn: 'Complete all Grade 7 chapters',
    condition: 'complete_grade_7',
    xpReward: 600,
  },
  {
    id: 'ach_complete_grade8',
    icon: '🎓',
    title: 'Tốt Nghiệp Lớp 8',
    titleEn: 'Grade 8 Graduate',
    description: 'Hoàn thành tất cả chương lớp 8',
    descriptionEn: 'Complete all Grade 8 chapters',
    condition: 'complete_grade_8',
    xpReward: 750,
  },
  {
    id: 'ach_complete_grade9',
    icon: '🎓',
    title: 'Tốt Nghiệp Lớp 9',
    titleEn: 'Grade 9 Graduate',
    description: 'Hoàn thành tất cả chương lớp 9',
    descriptionEn: 'Complete all Grade 9 chapters',
    condition: 'complete_grade_9',
    xpReward: 1000,
  },

  // ===== EXPLORATION =====
  {
    id: 'ach_explorer_3_chapters',
    icon: '🗺️',
    title: 'Nhà Thám Hiểm',
    titleEn: 'Explorer',
    description: 'Bắt đầu học ít nhất 3 chương khác nhau',
    descriptionEn: 'Start learning at least 3 different chapters',
    condition: 'explore_3_chapters',
    xpReward: 100,
  },
  {
    id: 'ach_explorer_all_grades',
    icon: '🌍',
    title: 'Xuyên Cấp Học',
    titleEn: 'Cross-Grade Explorer',
    description: 'Học ít nhất 1 chương từ mỗi khối lớp (6-9)',
    descriptionEn: 'Learn at least 1 chapter from each grade level (6-9)',
    condition: 'explore_all_grades',
    xpReward: 300,
  },
  {
    id: 'ach_phet_explorer',
    icon: '🧪',
    title: 'Nhà Khoa Học Ảo',
    titleEn: 'Virtual Scientist',
    description: 'Sử dụng 5 mô phỏng PhET khác nhau',
    descriptionEn: 'Interact with 5 different PhET simulations',
    condition: 'phet_5_sims',
    xpReward: 150,
  },
  {
    id: 'ach_video_learner',
    icon: '🎬',
    title: 'Học Qua Video',
    titleEn: 'Video Learner',
    description: 'Xem 10 video khám phá khác nhau',
    descriptionEn: 'Watch 10 different discovery videos',
    condition: 'watch_10_videos',
    xpReward: 150,
  },

  // ===== ERROR NOTEBOOK =====
  {
    id: 'ach_error_review_5',
    icon: '📝',
    title: 'Sửa Sai Tích Cực',
    titleEn: 'Active Corrector',
    description: 'Ôn tập 5 lỗi trong Sổ lỗi',
    descriptionEn: 'Review 5 mistakes in the Error Notebook',
    condition: 'error_review_5',
    xpReward: 120,
  },
  {
    id: 'ach_error_review_20',
    icon: '🧹',
    title: 'Dọn Sạch Sổ Lỗi',
    titleEn: 'Error Cleaner',
    description: 'Ôn tập và sửa 20 lỗi trong Sổ lỗi',
    descriptionEn: 'Review and correct 20 mistakes in the Error Notebook',
    condition: 'error_review_20',
    xpReward: 300,
  },

  // ===== SPECIAL =====
  {
    id: 'ach_night_owl',
    icon: '🦉',
    title: 'Cú Đêm',
    titleEn: 'Night Owl',
    description: 'Học bài sau 22:00',
    descriptionEn: 'Study after 10:00 PM',
    condition: 'study_after_10pm',
    xpReward: 50,
  },
  {
    id: 'ach_early_bird',
    icon: '🐦',
    title: 'Chim Sớm',
    titleEn: 'Early Bird',
    description: 'Học bài trước 6:00 sáng',
    descriptionEn: 'Study before 6:00 AM',
    condition: 'study_before_6am',
    xpReward: 50,
  },
  {
    id: 'ach_weekend_warrior',
    icon: '⚔️',
    title: 'Chiến Binh Cuối Tuần',
    titleEn: 'Weekend Warrior',
    description: 'Học bài cả thứ 7 và chủ nhật',
    descriptionEn: 'Study on both Saturday and Sunday',
    condition: 'study_both_weekend_days',
    xpReward: 100,
  },
  {
    id: 'ach_fact_collector',
    icon: '🧠',
    title: 'Nhà Sưu Tầm Kiến Thức',
    titleEn: 'Fact Collector',
    description: 'Đọc 30 Fun Facts khác nhau',
    descriptionEn: 'Read 30 different Fun Facts',
    condition: 'read_30_facts',
    xpReward: 150,
  },

  // ===== ZONE EXPLORER BADGES =====
  {
    id: 'ach_zone_kitchen',
    icon: '🍳',
    title: 'Bậc Thầy Nhiệt Năng',
    titleEn: 'Master of Thermal Energy',
    description: 'Hoàn thành tất cả chương trong Căn Bếp Kỳ Diệu',
    descriptionEn: 'Complete all chapters in the Kitchen Lab',
    condition: 'zone_complete_kitchen_lab',
    xpReward: 500,
  },
  {
    id: 'ach_zone_water',
    icon: '🌊',
    title: 'Chúa Tể Đại Dương',
    titleEn: 'Lord of the Oceans',
    description: 'Hoàn thành tất cả chương trong Thế Giới Nước',
    descriptionEn: 'Complete all chapters in Water World',
    condition: 'zone_complete_water_world',
    xpReward: 500,
  },
  {
    id: 'ach_zone_street',
    icon: '🏎️',
    title: 'Quỷ Tốc Độ',
    titleEn: 'Speed Demon',
    description: 'Hoàn thành tất cả chương trong Đường Phố & Chuyển Động',
    descriptionEn: 'Complete all chapters in Street & Motion',
    condition: 'zone_complete_street_motion',
    xpReward: 500,
  },
  {
    id: 'ach_zone_cosmic',
    icon: '🌈',
    title: 'Người Dệt Ánh Sáng',
    titleEn: 'Light Weaver',
    description: 'Hoàn thành tất cả chương trong Bầu Trời & Vũ Trụ',
    descriptionEn: 'Complete all chapters in Cosmic Sky',
    condition: 'zone_complete_cosmic_sky',
    xpReward: 500,
  },
  {
    id: 'ach_zone_sound',
    icon: '🎵',
    title: 'Pháp Sư Âm Vọng',
    titleEn: 'Echo Whisperer',
    description: 'Hoàn thành tất cả chương trong Phòng Hòa Nhạc',
    descriptionEn: 'Complete all chapters in the Sound Arena',
    condition: 'zone_complete_sound_arena',
    xpReward: 500,
  },
  {
    id: 'ach_zone_electric',
    icon: '⚡',
    title: 'Phù Thủy Điện Từ',
    titleEn: 'Electro Magnetizer',
    description: 'Hoàn thành tất cả chương trong Xưởng Điện & Nam Châm',
    descriptionEn: 'Complete all chapters in the Electric Workshop',
    condition: 'zone_complete_electric_workshop',
    xpReward: 500,
  },
];

export const LEVELS = [
  { level: 1, title: 'Học sinh Tập sự', titleEn: 'Apprentice', minXp: 0, icon: '🌱' },
  { level: 2, title: 'Nhà Khám Phá', titleEn: 'Explorer', minXp: 200, icon: '🔍' },
  { level: 3, title: 'Nhà Nghiên Cứu', titleEn: 'Researcher', minXp: 500, icon: '🔬' },
  { level: 4, title: 'Nhà Thí Nghiệm', titleEn: 'Experimenter', minXp: 1000, icon: '🧪' },
  { level: 5, title: 'Nhà Phát Minh', titleEn: 'Inventor', minXp: 2000, icon: '💡' },
  { level: 6, title: 'Nhà Vật Lý', titleEn: 'Physicist', minXp: 3500, icon: '⚛️' },
  { level: 7, title: 'Bậc Thầy', titleEn: 'Master', minXp: 5500, icon: '🏅' },
  { level: 8, title: 'Giáo Sư', titleEn: 'Professor', minXp: 8000, icon: '🎓' },
  { level: 9, title: 'Thiên Tài', titleEn: 'Genius', minXp: 12000, icon: '🧠' },
  { level: 10, title: 'Huyền Thoại Vật Lý', titleEn: 'Physics Legend', minXp: 18000, icon: '👑' },
];

/**
 * Helper: get current level based on XP
 * @param {number} xp - current total XP
 * @returns {object} current level object
 */
export const getLevelByXp = (xp) => {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
};

/**
 * Helper: get XP needed for next level
 * @param {number} xp - current total XP
 * @returns {number|null} XP needed, or null if max level
 */
export const getXpToNextLevel = (xp) => {
  const current = getLevelByXp(xp);
  const nextLevel = LEVELS.find((l) => l.minXp > current.minXp);
  return nextLevel ? nextLevel.minXp - xp : null;
};

export default { ACHIEVEMENTS, LEVELS, getLevelByXp, getXpToNextLevel };
