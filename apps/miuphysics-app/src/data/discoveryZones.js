/**
 * Discovery Zones — Maps real-world themes to physics chapters.
 *
 * Each zone groups chapters by real-life context so students can explore
 * physics through familiar, curiosity-driven scenarios.
 *
 * Chapter coverage (30 chapters, each in exactly ONE zone):
 * ─────────────────────────────────────────────────────────
 * kitchen_lab        : heat_transfer, energy_conservation, mass_density, pressure
 * water_world        : liquid_pressure, buoyancy, measurement
 * street_motion      : motion_basics, speed_graph, force_basics, moment_of_force, kinetic_energy, potential_energy
 * cosmic_sky         : light_basics, reflection_refraction, light_spectrum, earth_solar_system, energy_basics
 * sound_arena        : sound_basics, sound_wave
 * electric_workshop  : resistance_ohm, electric_circuit, electric_power, magnetic_field_basics, magnetic_force, nuclear_energy_intro
 */

export const DISCOVERY_ZONES = [
  {
    id: 'kitchen_lab',
    name: 'Căn Bếp Kỳ Diệu',
    nameEn: 'Kitchen Lab',
    icon: '🍳',
    bgEmoji: '🔥',
    color: '#EF4444',
    colorLight: '#FCA5A5',
    gradient: 'linear-gradient(135deg, #EF4444, #F59E0B)',
    chapters: ['heat_transfer', 'energy_conservation', 'mass_density', 'pressure', 'gifted_heat_grade9'],
    curiosityHook:
      'Tại sao chảo có tay cầm bằng gỗ? Tại sao cốc nước đá "đổ mồ hôi"? Tại sao nước sôi ở 100°C nhưng trên đỉnh Everest chỉ 70°C?',
    curiosityHookEn:
      'Why do pans have wooden handles? Why do cold glasses "sweat"? Why does water boil at 100°C but only 70°C on Mt. Everest?',
    badge: {
      title: 'Master of Thermal Energy',
      titleVn: 'Bậc thầy Nhiệt năng',
      icon: '🔥',
    },
    description: 'Khám phá vật lý ẩn giấu trong mỗi bữa ăn, từ truyền nhiệt đến áp suất!',
    descriptionEn: 'Discover the physics hidden in every meal, from heat transfer to pressure!',
  },
  {
    id: 'water_world',
    name: 'Thế Giới Nước & Biển',
    nameEn: 'Water World',
    icon: '🌊',
    bgEmoji: '🚢',
    color: '#0EA5E9',
    colorLight: '#7DD3FC',
    gradient: 'linear-gradient(135deg, #0EA5E9, #22D3EE)',
    chapters: ['liquid_pressure', 'buoyancy', 'measurement'],
    curiosityHook:
      'Tại sao tàu thép vạn tấn nổi được, nhưng đinh nhỏ lại chìm? Tại sao lặn sâu bị đau tai? Thợ lặn chịu áp suất bao nhiêu?',
    curiosityHookEn: 'Why do massive steel ships float while tiny nails sink? Why do your ears hurt when diving deep?',
    badge: {
      title: 'Lord of the Oceans',
      titleVn: 'Chúa tể Đại dương',
      icon: '🌊',
    },
    description: 'Giải mã bí ẩn của nước, lực đẩy Archimedes và áp suất chất lỏng!',
    descriptionEn: "Decode the mysteries of water, Archimedes' buoyancy, and liquid pressure!",
  },
  {
    id: 'street_motion',
    name: 'Đường Phố & Chuyển Động',
    nameEn: 'Street & Motion',
    icon: '🚗',
    bgEmoji: '🏎️',
    color: '#10B981',
    colorLight: '#6EE7B7',
    gradient: 'linear-gradient(135deg, #10B981, #34D399)',
    chapters: [
      'motion_basics',
      'speed_graph',
      'force_basics',
      'moment_of_force',
      'kinetic_energy',
      'potential_energy',
      'gifted_mechanics_grade9',
    ],
    curiosityHook:
      'Tại sao thắt dây an toàn cứu sống bạn? Tại sao xe đạp không đổ khi chạy? Tốc độ âm thanh nhanh hơn xe F1?',
    curiosityHookEn:
      "Why does a seatbelt save your life? Why doesn't a bicycle fall when moving? Is the speed of sound faster than an F1 car?",
    badge: {
      title: 'Speed Demon',
      titleVn: 'Quỷ Tốc Độ',
      icon: '🏎️',
    },
    description: 'Vật lý trên mỗi con đường — từ lực ma sát đến năng lượng chuyển động!',
    descriptionEn: 'Physics on every road — from friction to kinetic energy!',
  },
  {
    id: 'cosmic_sky',
    name: 'Bầu Trời & Vũ Trụ',
    nameEn: 'Cosmic Sky',
    icon: '🌌',
    bgEmoji: '🪐',
    color: '#8B5CF6',
    colorLight: '#C4B5FD',
    gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    chapters: ['light_basics', 'reflection_refraction', 'light_spectrum', 'earth_solar_system', 'energy_basics'],
    curiosityHook:
      'Tại sao bầu trời xanh ban ngày nhưng đỏ lúc hoàng hôn? Cầu vồng hình thành thế nào? Ánh sáng đi nhanh cỡ nào?',
    curiosityHookEn:
      'Why is the sky blue during the day but red at sunset? How do rainbows form? How fast does light travel?',
    badge: {
      title: 'Light Weaver',
      titleVn: 'Người Dệt Ánh Sáng',
      icon: '🌈',
    },
    description: 'Hành trình từ tia sáng trong gương đến những vì sao xa xôi!',
    descriptionEn: 'Journey from light rays in mirrors to distant stars!',
  },
  {
    id: 'sound_arena',
    name: 'Phòng Hòa Nhạc & Âm Thanh',
    nameEn: 'Sound Arena',
    icon: '🎵',
    bgEmoji: '🎸',
    color: '#EC4899',
    colorLight: '#F9A8D4',
    gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
    chapters: ['sound_basics', 'sound_wave'],
    curiosityHook:
      'Tại sao sấm sét luôn đến sau tia chớp? Dơi "nhìn" bằng âm thanh thế nào? Tại sao hét trong hang lại có tiếng vọng?',
    curiosityHookEn:
      'Why does thunder always follow lightning? How do bats "see" with sound? Why does shouting in a cave create echoes?',
    badge: {
      title: 'Echo Whisperer',
      titleVn: 'Pháp sư Âm Vọng',
      icon: '🎵',
    },
    description: 'Giải mã sóng âm, tiếng vọng, và khoa học đằng sau âm nhạc!',
    descriptionEn: 'Decode sound waves, echoes, and the science behind music!',
  },
  {
    id: 'electric_workshop',
    name: 'Xưởng Điện & Nam Châm',
    nameEn: 'Electric Workshop',
    icon: '⚡',
    bgEmoji: '🧲',
    color: '#F59E0B',
    colorLight: '#FDE68A',
    gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    chapters: [
      'resistance_ohm',
      'electric_circuit',
      'electric_power',
      'magnetic_field_basics',
      'magnetic_force',
      'nuclear_energy_intro',
    ],
    curiosityHook:
      'Tại sao chim đậu trên dây điện không bị giật? Pin hoạt động thế nào? Nam châm hút sắt bằng phép thuật gì?',
    curiosityHookEn:
      "Why don't birds on power lines get electrocuted? How do batteries work? What magic makes magnets attract iron?",
    badge: {
      title: 'Electro Magnetizer',
      titleVn: 'Phù thủy Điện Từ',
      icon: '⚡',
    },
    description: 'Từ bóng đèn trong phòng đến lõi Trái Đất — thế giới điện từ kỳ diệu!',
    descriptionEn: "From lightbulbs in your room to Earth's core — the magical electromagnetic world!",
  },
];

/**
 * Find which zone a chapter belongs to.
 * @param {string} chapterId
 * @returns {object|null} The zone object, or null if not found.
 */
export function getZoneForChapter(chapterId) {
  return DISCOVERY_ZONES.find((z) => z.chapters.includes(chapterId)) || null;
}

/**
 * Get all chapters for a zone, optionally filtered by grade.
 * @param {string} zoneId
 * @param {Array} allChapters - Full chapter list (each item must have `.id` and `.grade`).
 * @param {number|null} grade - If provided, only return chapters matching this grade.
 * @returns {Array} Filtered chapter objects.
 */
export function getZoneChapters(zoneId, allChapters, grade = null) {
  const zone = DISCOVERY_ZONES.find((z) => z.id === zoneId);
  if (!zone) return [];
  let filtered = allChapters.filter((ch) => zone.chapters.includes(ch.id));
  if (grade) filtered = filtered.filter((ch) => ch.grade === grade);
  return filtered;
}
