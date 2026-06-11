// =============================================================================
// CHAPTER RESOURCES — MiuPhysics App
// Comprehensive learning resources for all chapters (Grades 6–9)
// Each chapter includes: intro, phet[], question_sims, videos[], books[]
// =============================================================================

export const CHAPTER_RESOURCES = {
  // =========================================================================
  // GRADE 6
  // =========================================================================

  // --- Measurement ---
  measurement: {
    intro: {
      title: 'Measurement',
      titleVn: 'Các phép đo lường',
      url: 'https://phet.colorado.edu/sims/html/estimation/latest/estimation_all.html',
      description: 'Khám phá các phép đo lường với PhET',
      descriptionEn: 'Explore measurement concepts with interactive PhET estimation simulation',
    },
    phet: [
      {
        title: 'Estimation',
        titleVn: 'Ước lượng',
        url: 'https://phet.colorado.edu/sims/html/estimation/latest/estimation_all.html',
        description: 'Khám phá cách ước lượng và đo lường trong đời sống hàng ngày',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'How We Measure the Universe',
        titleVn: 'Cách chúng ta đo vũ trụ',
        url: 'https://www.youtube.com/embed/LQyiVITGlNc',
        channel: 'Veritasium',
        duration: '12:30',
      },
      {
        title: 'Why the Metric System Matters',
        titleVn: 'Tại sao hệ đo lường mét quan trọng',
        url: 'https://www.youtube.com/embed/SmSJXC6_qQ8',
        channel: 'MinutePhysics',
        duration: '3:45',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 1: Đo lường trong đời sống',
      },
      {
        title: 'Sách giáo khoa Vật lý 6',
        author: 'Bộ GD&ĐT',
        note: 'Bài 1–3: Đo độ dài, đo thể tích, đo khối lượng',
      },
    ],
  },

  // --- Mass & Density ---
  mass_density: {
    intro: {
      title: 'Mass & Density',
      titleVn: 'Khối lượng & Khối lượng riêng',
      url: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
      description: 'Khám phá khối lượng riêng với PhET',
      descriptionEn: 'Explore mass and density concepts with PhET density simulation',
    },
    phet: [
      {
        title: 'Density',
        titleVn: 'Khối lượng riêng',
        url: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
        description: 'Tìm hiểu mối quan hệ giữa khối lượng, thể tích và khối lượng riêng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Density?',
        titleVn: 'Khối lượng riêng là gì?',
        url: 'https://www.youtube.com/embed/qMSEJsOBs0c',
        channel: 'Kurzgesagt',
        duration: '6:12',
      },
      {
        title: 'Density Explained',
        titleVn: 'Giải thích khối lượng riêng',
        url: 'https://www.youtube.com/embed/r0nOsuoRuJc',
        channel: 'The Action Lab',
        duration: '8:45',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 3: Khối lượng riêng và ứng dụng',
      },
      {
        title: 'Sách giáo khoa Vật lý 6',
        author: 'Bộ GD&ĐT',
        note: 'Bài 4–5: Khối lượng, khối lượng riêng',
      },
    ],
  },

  // --- Force Basics ---
  force_basics: {
    intro: {
      title: 'Force Basics',
      titleVn: 'Lực cơ bản',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
      description: 'Tìm hiểu về lực với PhET',
      descriptionEn: 'Learn the fundamentals of forces with PhET interactive simulation',
    },
    phet: [
      {
        title: 'Forces and Motion: Basics',
        titleVn: 'Lực và chuyển động: Cơ bản',
        url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
        description: 'Khám phá cách lực ảnh hưởng đến chuyển động của vật thể',
      },
      {
        title: 'Friction',
        titleVn: 'Lực ma sát',
        url: 'https://phet.colorado.edu/sims/html/friction/latest/friction_all.html',
        description: 'Tìm hiểu lực ma sát ở cấp độ phân tử',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is a Force?',
        titleVn: 'Lực là gì?',
        url: 'https://www.youtube.com/embed/HIiitDaSo4A',
        channel: 'MinutePhysics',
        duration: '4:22',
      },
      {
        title: 'Newton\'s Laws of Motion',
        titleVn: 'Các định luật Newton về chuyển động',
        url: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
        channel: 'SmarterEveryDay',
        duration: '10:15',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 5: Lực trong cuộc sống',
      },
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 12: Characteristics of Force',
      },
    ],
  },

  // --- Motion Basics ---
  motion_basics: {
    intro: {
      title: 'Motion Basics',
      titleVn: 'Chuyển động cơ bản',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
      description: 'Tìm hiểu về chuyển động với PhET',
      descriptionEn: 'Explore motion fundamentals with PhET simulation',
    },
    phet: [
      {
        title: 'Forces and Motion: Basics',
        titleVn: 'Lực và chuyển động: Cơ bản',
        url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
        description: 'Quan sát cách lực tạo ra chuyển động và thay đổi tốc độ',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Motion in a Straight Line',
        titleVn: 'Chuyển động thẳng',
        url: 'https://www.youtube.com/embed/ZM8ECpBuQYE',
        channel: 'Veritasium',
        duration: '7:18',
      },
      {
        title: 'Is Motion an Illusion?',
        titleVn: 'Chuyển động có phải ảo giác?',
        url: 'https://www.youtube.com/embed/VNqNnUJVcVs',
        channel: 'Kurzgesagt',
        duration: '9:30',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 2: Chuyển động và quán tính',
      },
      {
        title: 'Sách giáo khoa Vật lý 6',
        author: 'Bộ GD&ĐT',
        note: 'Bài 6–8: Chuyển động cơ học',
      },
    ],
  },

  // --- Energy Basics ---
  energy_basics: {
    intro: {
      title: 'Energy Basics',
      titleVn: 'Năng lượng cơ bản',
      url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
      description: 'Khám phá các dạng năng lượng với PhET',
      descriptionEn: 'Discover energy forms and transformations with PhET simulation',
    },
    phet: [
      {
        title: 'Energy Forms and Changes',
        titleVn: 'Các dạng năng lượng và sự chuyển hóa',
        url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
        description: 'Khám phá cách năng lượng chuyển hóa giữa các dạng khác nhau',
      },
      {
        title: 'Energy Skate Park: Basics',
        titleVn: 'Công viên trượt ván năng lượng',
        url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
        description: 'Tìm hiểu năng lượng thông qua mô phỏng trượt ván',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Energy?',
        titleVn: 'Năng lượng là gì?',
        url: 'https://www.youtube.com/embed/CW0_S5YpYVo',
        channel: 'MinutePhysics',
        duration: '3:55',
      },
      {
        title: 'Energy Can Neither Be Created Nor Destroyed',
        titleVn: 'Năng lượng không tự sinh ra và mất đi',
        url: 'https://www.youtube.com/embed/2S6e11NBwiw',
        channel: 'Kurzgesagt',
        duration: '8:42',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 6: Năng lượng trong cuộc sống hàng ngày',
      },
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 4: Conservation of Energy',
      },
    ],
  },

  // --- Light Basics ---
  light_basics: {
    intro: {
      title: 'Light Basics',
      titleVn: 'Ánh sáng cơ bản',
      url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
      description: 'Khám phá ánh sáng và màu sắc với PhET',
      descriptionEn: 'Explore light and color vision with PhET simulation',
    },
    phet: [
      {
        title: 'Color Vision',
        titleVn: 'Thị giác màu sắc',
        url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
        description: 'Tìm hiểu cách mắt nhìn thấy màu sắc và cách pha trộn ánh sáng',
      },
      {
        title: 'Bending Light',
        titleVn: 'Khúc xạ ánh sáng',
        url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
        description: 'Quan sát cách ánh sáng bẻ cong khi đi qua các môi trường khác nhau',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Light?',
        titleVn: 'Ánh sáng là gì?',
        url: 'https://www.youtube.com/embed/IXxZRZxafEQ',
        channel: 'Kurzgesagt',
        duration: '7:33',
      },
      {
        title: 'How Does Light Work?',
        titleVn: 'Ánh sáng hoạt động như thế nào?',
        url: 'https://www.youtube.com/embed/p-OCfiglZRQ',
        channel: 'SmarterEveryDay',
        duration: '11:20',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 8: Ánh sáng và bóng tối',
      },
      {
        title: 'Sách giáo khoa Vật lý 6',
        author: 'Bộ GD&ĐT',
        note: 'Bài: Ánh sáng — Nguồn sáng và vật sáng',
      },
    ],
  },

  // --- Sound Basics ---
  sound_basics: {
    intro: {
      title: 'Sound Basics',
      titleVn: 'Âm thanh cơ bản',
      url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html',
      description: 'Khám phá âm thanh với PhET',
      descriptionEn: 'Explore sound waves and properties with PhET simulation',
    },
    phet: [
      {
        title: 'Sound Waves',
        titleVn: 'Sóng âm',
        url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html',
        description: 'Tìm hiểu cách sóng âm truyền đi và các tính chất của âm thanh',
      },
      {
        title: 'Waves Intro',
        titleVn: 'Giới thiệu về sóng',
        url: 'https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro_all.html',
        description: 'Khám phá các loại sóng cơ bản: sóng nước, sóng âm, sóng ánh sáng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Sound?',
        titleVn: 'Âm thanh là gì?',
        url: 'https://www.youtube.com/embed/qV4lR9EWGlY',
        channel: 'SmarterEveryDay',
        duration: '8:15',
      },
      {
        title: 'Visualizing Sound',
        titleVn: 'Trực quan hóa âm thanh',
        url: 'https://www.youtube.com/embed/wMHKJbNvDKE',
        channel: 'Veritasium',
        duration: '6:28',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 9: Âm thanh và tiếng vang',
      },
      {
        title: 'Sách giáo khoa Vật lý 7',
        author: 'Bộ GD&ĐT',
        note: 'Chương III: Âm học',
      },
    ],
  },

  // =========================================================================
  // GRADE 7
  // =========================================================================

  // --- Speed & Graphs ---
  speed_graph: {
    intro: {
      title: 'Speed & Graphs',
      titleVn: 'Tốc độ & Đồ thị',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
      description: 'Tìm hiểu tốc độ qua đồ thị với PhET',
      descriptionEn: 'Understand speed and velocity through graphs with PhET simulation',
    },
    phet: [
      {
        title: 'Forces and Motion: Basics',
        titleVn: 'Lực và chuyển động: Cơ bản',
        url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
        description: 'Quan sát mối quan hệ giữa lực, tốc độ và đồ thị chuyển động',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Speed, Velocity, and Acceleration',
        titleVn: 'Tốc độ, vận tốc và gia tốc',
        url: 'https://www.youtube.com/embed/oIZV-ixRTcY',
        channel: 'Veritasium',
        duration: '9:05',
      },
      {
        title: 'Understanding Motion Graphs',
        titleVn: 'Hiểu đồ thị chuyển động',
        url: 'https://www.youtube.com/embed/ZvTskNoF-gY',
        channel: 'MinutePhysics',
        duration: '4:50',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 4: Vận tốc trong tự nhiên',
      },
      {
        title: 'Sách giáo khoa Vật lý 7',
        author: 'Bộ GD&ĐT',
        note: 'Bài: Tốc độ chuyển động và đồ thị quãng đường–thời gian',
      },
    ],
  },

  // --- Reflection & Refraction ---
  reflection_refraction: {
    intro: {
      title: 'Reflection & Refraction',
      titleVn: 'Phản xạ & Khúc xạ ánh sáng',
      url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
      description: 'Khám phá phản xạ và khúc xạ ánh sáng với PhET',
      descriptionEn: 'Explore light reflection and refraction with PhET bending light simulation',
    },
    phet: [
      {
        title: 'Bending Light',
        titleVn: 'Khúc xạ ánh sáng',
        url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
        description: 'Quan sát hiện tượng phản xạ và khúc xạ ánh sáng qua các môi trường',
      },
      {
        title: 'Color Vision',
        titleVn: 'Thị giác màu sắc',
        url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
        description: 'Tìm hiểu cách ánh sáng và màu sắc được cảm nhận',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Why Does Light Bend?',
        titleVn: 'Tại sao ánh sáng bị bẻ cong?',
        url: 'https://www.youtube.com/embed/NLmpNM0sgYk',
        channel: 'Veritasium',
        duration: '10:48',
      },
      {
        title: 'Total Internal Reflection',
        titleVn: 'Phản xạ toàn phần',
        url: 'https://www.youtube.com/embed/VwSw4KZuEHA',
        channel: 'SmarterEveryDay',
        duration: '7:35',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 8: Gương, thấu kính và ảo ảnh quang học',
      },
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 26: Optics: The Principle of Least Time',
      },
    ],
  },

  // --- Sound Waves ---
  sound_wave: {
    intro: {
      title: 'Sound Waves',
      titleVn: 'Sóng âm',
      url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html',
      description: 'Tìm hiểu sóng âm chuyên sâu với PhET',
      descriptionEn: 'Dive deeper into sound wave properties with PhET simulation',
    },
    phet: [
      {
        title: 'Sound Waves',
        titleVn: 'Sóng âm',
        url: 'https://phet.colorado.edu/sims/html/sound-waves/latest/sound-waves_all.html',
        description: 'Khám phá tần số, biên độ và cách sóng âm truyền đi trong không gian',
      },
      {
        title: 'Waves Intro',
        titleVn: 'Giới thiệu về sóng',
        url: 'https://phet.colorado.edu/sims/html/waves-intro/latest/waves-intro_all.html',
        description: 'So sánh sóng âm với sóng nước và sóng ánh sáng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'How Sound Works',
        titleVn: 'Cách hoạt động của âm thanh',
        url: 'https://www.youtube.com/embed/dvNZfGBp0Xo',
        channel: 'SmarterEveryDay',
        duration: '11:22',
      },
      {
        title: 'Standing Waves',
        titleVn: 'Sóng dừng',
        url: 'https://www.youtube.com/embed/1yaqUI4b974',
        channel: 'Veritasium',
        duration: '8:17',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 9: Sóng âm và cộng hưởng',
      },
      {
        title: 'Sách giáo khoa Vật lý 7',
        author: 'Bộ GD&ĐT',
        note: 'Chương III: Âm học — Sóng âm, độ cao, độ to',
      },
    ],
  },

  // --- Magnetic Field Basics ---
  magnetic_field_basics: {
    intro: {
      title: 'Magnetic Field Basics',
      titleVn: 'Từ trường cơ bản',
      url: 'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_all.html',
      description: 'Tìm hiểu từ trường với PhET',
      descriptionEn: 'Explore magnetic fields and electromagnets with PhET simulation',
    },
    phet: [
      {
        title: 'Magnets and Electromagnets',
        titleVn: 'Nam châm và nam châm điện',
        url: 'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_all.html',
        description: 'Khám phá từ trường của nam châm và nguyên lý nam châm điện',
      },
      {
        title: 'Faraday\'s Law',
        titleVn: 'Định luật Faraday',
        url: 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html',
        description: 'Tìm hiểu cách từ trường biến đổi tạo ra dòng điện',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'How Do Magnets Work?',
        titleVn: 'Nam châm hoạt động như thế nào?',
        url: 'https://www.youtube.com/embed/hFAOXdXZ5TM',
        channel: 'Veritasium',
        duration: '13:02',
      },
      {
        title: 'Magnetic Fields Visualized',
        titleVn: 'Trực quan hóa từ trường',
        url: 'https://www.youtube.com/embed/VGO5woyiAEc',
        channel: 'The Action Lab',
        duration: '6:45',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 7: Nam châm và la bàn',
      },
      {
        title: 'Feynman Lectures on Physics — Vol 2',
        author: 'Richard Feynman',
        note: 'Chapter 13: Magnetostatics',
      },
    ],
  },

  // --- Earth & Solar System ---
  earth_solar_system: {
    intro: {
      title: 'Earth & Solar System',
      titleVn: 'Trái Đất & Hệ Mặt Trời',
      url: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_all.html',
      description: 'Khám phá hệ Mặt Trời với PhET',
      descriptionEn: 'Explore gravity, orbits, and the solar system with PhET simulation',
    },
    phet: [
      {
        title: 'Gravity and Orbits',
        titleVn: 'Trọng lực và quỹ đạo',
        url: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_all.html',
        description: 'Mô phỏng quỹ đạo các hành tinh quanh Mặt Trời',
      },
      {
        title: 'My Solar System',
        titleVn: 'Hệ Mặt Trời của tôi',
        url: 'https://phet.colorado.edu/sims/html/my-solar-system/latest/my-solar-system_all.html',
        description: 'Xây dựng và khám phá hệ hành tinh riêng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'The Solar System — Our Home in Space',
        titleVn: 'Hệ Mặt Trời — Ngôi nhà của chúng ta',
        url: 'https://www.youtube.com/embed/libKVRa01L8',
        channel: 'Kurzgesagt',
        duration: '6:39',
      },
      {
        title: 'How Gravity Works',
        titleVn: 'Trọng lực hoạt động như thế nào',
        url: 'https://www.youtube.com/embed/XRr1kaXKBsU',
        channel: 'Veritasium',
        duration: '14:26',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 10: Trái Đất, Mặt Trời và các vì sao',
      },
      {
        title: 'Sách giáo khoa Vật lý 7',
        author: 'Bộ GD&ĐT',
        note: 'Bài: Hệ Mặt Trời và Trái Đất trong hệ Mặt Trời',
      },
    ],
  },

  // =========================================================================
  // GRADE 8
  // =========================================================================

  // --- Pressure ---
  pressure: {
    intro: {
      title: 'Pressure',
      titleVn: 'Áp suất',
      url: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html',
      description: 'Khám phá áp suất với PhET',
      descriptionEn: 'Explore pressure concepts with PhET Under Pressure simulation',
    },
    phet: [
      {
        title: 'Under Pressure',
        titleVn: 'Dưới áp suất',
        url: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html',
        description: 'Tìm hiểu áp suất chất lỏng và áp suất khí quyển',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Atmospheric Pressure Explained',
        titleVn: 'Giải thích áp suất khí quyển',
        url: 'https://www.youtube.com/embed/EAhFJcpo6d4',
        channel: 'Veritasium',
        duration: '8:34',
      },
      {
        title: 'What is Pressure?',
        titleVn: 'Áp suất là gì?',
        url: 'https://www.youtube.com/embed/gMv0JoOLTXw',
        channel: 'The Action Lab',
        duration: '7:12',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 6: Áp suất và sức ép',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 7: Áp suất',
      },
    ],
  },

  // --- Liquid Pressure ---
  liquid_pressure: {
    intro: {
      title: 'Liquid Pressure',
      titleVn: 'Áp suất chất lỏng',
      url: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html',
      description: 'Tìm hiểu áp suất chất lỏng với PhET',
      descriptionEn: 'Explore liquid pressure and Pascal\'s principle with PhET simulation',
    },
    phet: [
      {
        title: 'Under Pressure',
        titleVn: 'Dưới áp suất',
        url: 'https://phet.colorado.edu/sims/html/under-pressure/latest/under-pressure_all.html',
        description: 'Khám phá áp suất chất lỏng thay đổi theo độ sâu và mật độ',
      },
      {
        title: 'Density',
        titleVn: 'Khối lượng riêng',
        url: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
        description: 'Tìm hiểu mối liên hệ giữa khối lượng riêng và áp suất chất lỏng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Pascal\'s Principle',
        titleVn: 'Nguyên lý Pascal',
        url: 'https://www.youtube.com/embed/Ks6pDviQVXo',
        channel: 'SmarterEveryDay',
        duration: '9:44',
      },
      {
        title: 'Hydraulic Press Explained',
        titleVn: 'Máy ép thủy lực giải thích',
        url: 'https://www.youtube.com/embed/0T3PL0zAHaE',
        channel: 'Mark Rober',
        duration: '12:03',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 7: Áp suất chất lỏng và bình thông nhau',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 8: Áp suất chất lỏng — Bình thông nhau',
      },
    ],
  },

  // --- Buoyancy ---
  buoyancy: {
    intro: {
      title: 'Buoyancy',
      titleVn: 'Lực đẩy Archimedes',
      url: 'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html',
      description: 'Khám phá lực đẩy Archimedes với PhET',
      descriptionEn: 'Explore Archimedes\' principle and buoyancy with PhET simulation',
    },
    phet: [
      {
        title: 'Buoyancy',
        titleVn: 'Lực đẩy Archimedes',
        url: 'https://phet.colorado.edu/sims/html/buoyancy/latest/buoyancy_all.html',
        description: 'Tìm hiểu tại sao vật nổi hoặc chìm trong chất lỏng',
      },
      {
        title: 'Density',
        titleVn: 'Khối lượng riêng',
        url: 'https://phet.colorado.edu/sims/html/density/latest/density_all.html',
        description: 'Khám phá mối liên hệ giữa khối lượng riêng và sự nổi/chìm',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Why Do Things Float?',
        titleVn: 'Tại sao vật nổi?',
        url: 'https://www.youtube.com/embed/16HDJNoXQII',
        channel: 'Veritasium',
        duration: '5:56',
      },
      {
        title: 'Archimedes\' Eureka Moment',
        titleVn: 'Khoảnh khắc Eureka của Archimedes',
        url: 'https://www.youtube.com/embed/ijj58xD5fDI',
        channel: 'MinutePhysics',
        duration: '4:10',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 8: Archimedes và lực đẩy',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 10: Lực đẩy Archimedes',
      },
    ],
  },

  // --- Moment of Force ---
  moment_of_force: {
    intro: {
      title: 'Moment of Force',
      titleVn: 'Mô-men lực',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
      description: 'Tìm hiểu mô-men lực với PhET',
      descriptionEn: 'Explore torque and moment of force with PhET simulation',
    },
    phet: [
      {
        title: 'Forces and Motion: Basics',
        titleVn: 'Lực và chuyển động: Cơ bản',
        url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
        description: 'Tìm hiểu lực và cánh tay đòn trong cân bằng lực',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Torque Explained',
        titleVn: 'Giải thích mô-men lực',
        url: 'https://www.youtube.com/embed/MeHY_BxNh_s',
        channel: 'SmarterEveryDay',
        duration: '9:30',
      },
      {
        title: 'Levers and Mechanical Advantage',
        titleVn: 'Đòn bẩy và lợi thế cơ học',
        url: 'https://www.youtube.com/embed/YlYEi0PgG1g',
        channel: 'Mark Rober',
        duration: '10:14',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 9: Đòn bẩy và mô-men lực',
      },
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 18: Rotation in Two Dimensions',
      },
    ],
  },

  // --- Kinetic Energy ---
  kinetic_energy: {
    intro: {
      title: 'Kinetic Energy',
      titleVn: 'Động năng',
      url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
      description: 'Tìm hiểu động năng với PhET',
      descriptionEn: 'Explore kinetic energy with PhET Energy Skate Park simulation',
    },
    phet: [
      {
        title: 'Energy Skate Park: Basics',
        titleVn: 'Công viên trượt ván năng lượng',
        url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
        description: 'Quan sát sự chuyển hóa giữa động năng và thế năng trên đường trượt',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Kinetic Energy?',
        titleVn: 'Động năng là gì?',
        url: 'https://www.youtube.com/embed/Jnj8mc04r9E',
        channel: 'MinutePhysics',
        duration: '4:30',
      },
      {
        title: 'Kinetic Energy in Real Life',
        titleVn: 'Động năng trong đời sống',
        url: 'https://www.youtube.com/embed/3mier94pbnU',
        channel: 'The Action Lab',
        duration: '8:05',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 5: Động năng — Năng lượng của chuyển động',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 16: Cơ năng — Động năng',
      },
    ],
  },

  // --- Potential Energy ---
  potential_energy: {
    intro: {
      title: 'Potential Energy',
      titleVn: 'Thế năng',
      url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
      description: 'Tìm hiểu thế năng với PhET',
      descriptionEn: 'Explore potential energy with PhET Energy Skate Park simulation',
    },
    phet: [
      {
        title: 'Energy Skate Park: Basics',
        titleVn: 'Công viên trượt ván năng lượng',
        url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
        description: 'Quan sát thế năng hấp dẫn thay đổi theo độ cao',
      },
      {
        title: 'Energy Forms and Changes',
        titleVn: 'Các dạng năng lượng',
        url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
        description: 'Tìm hiểu các dạng thế năng và sự chuyển hóa năng lượng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Potential Energy Explained',
        titleVn: 'Giải thích thế năng',
        url: 'https://www.youtube.com/embed/AJORax1bfYo',
        channel: 'Veritasium',
        duration: '7:22',
      },
      {
        title: 'Gravitational Potential Energy',
        titleVn: 'Thế năng hấp dẫn',
        url: 'https://www.youtube.com/embed/gkk6gQ6MV7c',
        channel: 'MinutePhysics',
        duration: '3:55',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 5: Thế năng — Năng lượng tiềm ẩn',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 17: Cơ năng — Thế năng',
      },
    ],
  },

  // --- Energy Conservation ---
  energy_conservation: {
    intro: {
      title: 'Energy Conservation',
      titleVn: 'Bảo toàn năng lượng',
      url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
      description: 'Khám phá bảo toàn năng lượng với PhET',
      descriptionEn: 'Explore the law of energy conservation with PhET simulation',
    },
    phet: [
      {
        title: 'Energy Skate Park: Basics',
        titleVn: 'Công viên trượt ván năng lượng',
        url: 'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_all.html',
        description: 'Xác minh định luật bảo toàn năng lượng trên đường trượt ván',
      },
      {
        title: 'Energy Forms and Changes',
        titleVn: 'Các dạng năng lượng và sự chuyển hóa',
        url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
        description: 'Theo dõi năng lượng khi nó chuyển đổi giữa các dạng',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Conservation of Energy',
        titleVn: 'Bảo toàn năng lượng',
        url: 'https://www.youtube.com/embed/2S6e11NBwiw',
        channel: 'Kurzgesagt',
        duration: '8:42',
      },
      {
        title: 'Why Energy is Never Lost',
        titleVn: 'Tại sao năng lượng không bao giờ mất đi',
        url: 'https://www.youtube.com/embed/nYFuxTXDj90',
        channel: 'Veritasium',
        duration: '11:15',
      },
    ],
    books: [
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 4: Conservation of Energy',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 18: Định luật bảo toàn năng lượng',
      },
    ],
  },

  // --- Heat Transfer ---
  heat_transfer: {
    intro: {
      title: 'Heat Transfer',
      titleVn: 'Truyền nhiệt',
      url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
      description: 'Tìm hiểu truyền nhiệt với PhET',
      descriptionEn: 'Explore heat transfer mechanisms with PhET Energy Forms simulation',
    },
    phet: [
      {
        title: 'Energy Forms and Changes',
        titleVn: 'Các dạng năng lượng và sự chuyển hóa',
        url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
        description: 'Quan sát cách nhiệt truyền giữa các vật thể qua dẫn nhiệt, đối lưu, bức xạ',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Heat Transfer — Conduction, Convection, Radiation',
        titleVn: 'Truyền nhiệt — Dẫn nhiệt, Đối lưu, Bức xạ',
        url: 'https://www.youtube.com/embed/1DlUWvVu_5U',
        channel: 'SmarterEveryDay',
        duration: '10:08',
      },
      {
        title: 'Why Does Metal Feel Cold?',
        titleVn: 'Tại sao kim loại cảm thấy lạnh?',
        url: 'https://www.youtube.com/embed/vqDbMEdLiCs',
        channel: 'Veritasium',
        duration: '5:36',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 4: Nhiệt và nhiệt độ',
      },
      {
        title: 'Sách giáo khoa Vật lý 8',
        author: 'Bộ GD&ĐT',
        note: 'Bài 22–24: Dẫn nhiệt, Đối lưu, Bức xạ nhiệt',
      },
    ],
  },

  // =========================================================================
  // GRADE 9
  // =========================================================================

  // --- Resistance & Ohm's Law ---
  resistance_ohm: {
    intro: {
      title: 'Resistance & Ohm\'s Law',
      titleVn: 'Điện trở & Định luật Ohm',
      url: 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html',
      description: 'Khám phá định luật Ohm với PhET',
      descriptionEn: 'Explore Ohm\'s Law and electrical resistance with PhET simulation',
    },
    phet: [
      {
        title: 'Ohm\'s Law',
        titleVn: 'Định luật Ohm',
        url: 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html',
        description: 'Tìm hiểu mối quan hệ giữa hiệu điện thế, cường độ dòng điện và điện trở',
      },
      {
        title: 'Resistance in a Wire',
        titleVn: 'Điện trở trong dây dẫn',
        url: 'https://phet.colorado.edu/sims/html/resistance-in-a-wire/latest/resistance-in-a-wire_all.html',
        description: 'Khám phá cách chiều dài, tiết diện và vật liệu ảnh hưởng đến điện trở',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Ohm\'s Law Explained',
        titleVn: 'Giải thích định luật Ohm',
        url: 'https://www.youtube.com/embed/HsLLq6Rm5tU',
        channel: 'Veritasium',
        duration: '7:45',
      },
      {
        title: 'What is Electrical Resistance?',
        titleVn: 'Điện trở là gì?',
        url: 'https://www.youtube.com/embed/J4Vq-xHqUo8',
        channel: 'SmarterEveryDay',
        duration: '10:30',
      },
    ],
    books: [
      {
        title: 'Feynman Lectures on Physics — Vol 2',
        author: 'Richard Feynman',
        note: 'Chapter 23: Cavity Resonators — includes Ohm\'s law derivation',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 1–2: Sự phụ thuộc của cường độ dòng điện vào hiệu điện thế, Điện trở',
      },
    ],
  },

  // --- Electric Circuits ---
  electric_circuit: {
    intro: {
      title: 'Electric Circuits',
      titleVn: 'Mạch điện',
      url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
      description: 'Xây dựng mạch điện với PhET',
      descriptionEn: 'Build and explore DC circuits with PhET Circuit Construction Kit',
    },
    phet: [
      {
        title: 'Circuit Construction Kit: DC',
        titleVn: 'Bộ lắp mạch điện: DC',
        url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
        description: 'Xây dựng mạch điện với pin, bóng đèn, điện trở và dây dẫn',
      },
      {
        title: 'Ohm\'s Law',
        titleVn: 'Định luật Ohm',
        url: 'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_all.html',
        description: 'Áp dụng định luật Ohm vào phân tích mạch điện',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'How Circuits Work',
        titleVn: 'Mạch điện hoạt động như thế nào',
        url: 'https://www.youtube.com/embed/F_vLWkkOETI',
        channel: 'SmarterEveryDay',
        duration: '11:42',
      },
      {
        title: 'Series vs Parallel Circuits',
        titleVn: 'Mạch nối tiếp và mạch song song',
        url: 'https://www.youtube.com/embed/x2EuYqjhqUs',
        channel: 'Veritasium',
        duration: '8:18',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 6: Dòng điện và mạch điện',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 4–5: Đoạn mạch nối tiếp, Đoạn mạch song song',
      },
    ],
  },

  // --- Electric Power ---
  electric_power: {
    intro: {
      title: 'Electric Power',
      titleVn: 'Công suất điện',
      url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
      description: 'Tìm hiểu công suất điện với PhET',
      descriptionEn: 'Explore electric power and energy consumption with PhET circuits',
    },
    phet: [
      {
        title: 'Circuit Construction Kit: DC',
        titleVn: 'Bộ lắp mạch điện: DC',
        url: 'https://phet.colorado.edu/sims/html/circuit-construction-kit-dc/latest/circuit-construction-kit-dc_all.html',
        description: 'Đo công suất và năng lượng tiêu thụ trong mạch điện',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'What is Electric Power?',
        titleVn: 'Công suất điện là gì?',
        url: 'https://www.youtube.com/embed/VSpB3HivkhY',
        channel: 'MinutePhysics',
        duration: '4:15',
      },
      {
        title: 'How Electricity Works',
        titleVn: 'Cách hoạt động của điện',
        url: 'https://www.youtube.com/embed/mc979OhitAg',
        channel: 'SmarterEveryDay',
        duration: '14:22',
      },
    ],
    books: [
      {
        title: 'Feynman Lectures on Physics — Vol 2',
        author: 'Richard Feynman',
        note: 'Chapter 22: AC Circuits — Power in circuits',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 12–13: Công suất điện, Điện năng — Công của dòng điện',
      },
    ],
  },

  // --- Magnetic Force ---
  magnetic_force: {
    intro: {
      title: 'Magnetic Force',
      titleVn: 'Lực từ',
      url: 'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_all.html',
      description: 'Khám phá lực từ với PhET',
      descriptionEn: 'Explore magnetic force and electromagnetic induction with PhET',
    },
    phet: [
      {
        title: 'Magnets and Electromagnets',
        titleVn: 'Nam châm và nam châm điện',
        url: 'https://phet.colorado.edu/sims/html/magnets-and-electromagnets/latest/magnets-and-electromagnets_all.html',
        description: 'Tìm hiểu lực từ giữa nam châm và nam châm điện',
      },
      {
        title: 'Faraday\'s Law',
        titleVn: 'Định luật Faraday',
        url: 'https://phet.colorado.edu/sims/html/faradays-law/latest/faradays-law_all.html',
        description: 'Khám phá cảm ứng điện từ và định luật Faraday',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Electromagnetic Induction',
        titleVn: 'Cảm ứng điện từ',
        url: 'https://www.youtube.com/embed/NqdOyGY1lCA',
        channel: 'Veritasium',
        duration: '11:35',
      },
      {
        title: 'How Electric Motors Work',
        titleVn: 'Động cơ điện hoạt động như thế nào',
        url: 'https://www.youtube.com/embed/CWulQ1ZSE3c',
        channel: 'SmarterEveryDay',
        duration: '12:06',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Chương 7: Lực từ và ứng dụng',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 21–24: Từ trường, Lực điện từ, Động cơ điện',
      },
    ],
  },

  // --- Light Spectrum ---
  light_spectrum: {
    intro: {
      title: 'Light Spectrum',
      titleVn: 'Quang phổ ánh sáng',
      url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
      description: 'Khám phá quang phổ ánh sáng với PhET',
      descriptionEn: 'Explore the visible light spectrum and color mixing with PhET',
    },
    phet: [
      {
        title: 'Color Vision',
        titleVn: 'Thị giác màu sắc',
        url: 'https://phet.colorado.edu/sims/html/color-vision/latest/color-vision_all.html',
        description: 'Tìm hiểu quang phổ ánh sáng nhìn thấy và cách pha màu',
      },
      {
        title: 'Bending Light',
        titleVn: 'Khúc xạ ánh sáng',
        url: 'https://phet.colorado.edu/sims/html/bending-light/latest/bending-light_all.html',
        description: 'Quan sát sự tán sắc ánh sáng qua lăng kính',
      },
      {
        title: 'Geometric Optics',
        titleVn: 'Quang hình học (Thấu kính)',
        url: 'https://phet.colorado.edu/sims/html/geometric-optics/latest/geometric-optics_all.html',
        description: 'Khám phá sự tạo ảnh qua thấu kính hội tụ và thấu kính phân kì',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'The Electromagnetic Spectrum',
        titleVn: 'Phổ điện từ',
        url: 'https://www.youtube.com/embed/lwfJPc-rSXw',
        channel: 'Kurzgesagt',
        duration: '7:56',
      },
      {
        title: 'How Do We See Color?',
        titleVn: 'Làm sao chúng ta nhìn thấy màu sắc?',
        url: 'https://www.youtube.com/embed/l8_fZPHasdo',
        channel: 'Veritasium',
        duration: '9:44',
      },
    ],
    books: [
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 35: Color Vision — The spectrum of light',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 40–42: Ánh sáng trắng, Ánh sáng màu, Tán sắc ánh sáng',
      },
    ],
  },

  // --- Nuclear Energy Intro ---
  nuclear_energy_intro: {
    intro: {
      title: 'Nuclear Energy Introduction',
      titleVn: 'Giới thiệu năng lượng hạt nhân',
      url: 'https://phet.colorado.edu/sims/html/build-a-nucleus/latest/build-a-nucleus_all.html',
      description: 'Tìm hiểu năng lượng hạt nhân với PhET',
      descriptionEn: 'Explore nuclear structure and energy with PhET Build a Nucleus simulation',
    },
    phet: [
      {
        title: 'Build a Nucleus',
        titleVn: 'Xây dựng hạt nhân',
        url: 'https://phet.colorado.edu/sims/html/build-a-nucleus/latest/build-a-nucleus_all.html',
        description: 'Xây dựng hạt nhân nguyên tử và tìm hiểu về phân rã phóng xạ',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Nuclear Energy Explained',
        titleVn: 'Giải thích năng lượng hạt nhân',
        url: 'https://www.youtube.com/embed/rcOFV4y5z8c',
        channel: 'Kurzgesagt',
        duration: '6:27',
      },
      {
        title: 'How Nuclear Power Works',
        titleVn: 'Năng lượng hạt nhân hoạt động ra sao',
        url: 'https://www.youtube.com/embed/R7WPEYGr1Vs',
        channel: 'MinutePhysics',
        duration: '5:10',
      },
      {
        title: 'Fission vs Fusion',
        titleVn: 'Phân hạch và nhiệt hạch',
        url: 'https://www.youtube.com/embed/Uy7rks05QIc',
        channel: 'Kurzgesagt',
        duration: '8:18',
      },
    ],
    books: [
      {
        title: 'Feynman Lectures on Physics — Vol 1',
        author: 'Richard Feynman',
        note: 'Chapter 5: The Theory of Gravitation — Nuclear forces mentioned',
      },
      {
        title: 'Sách giáo khoa Vật lý 9',
        author: 'Bộ GD&ĐT',
        note: 'Bài 55–57: Năng lượng hạt nhân, Phản ứng hạt nhân',
      },
      {
        title: 'Vật lý vui — Tập 2',
        author: 'Yakov Perelman',
        note: 'Phụ lục: Năng lượng nguyên tử và tương lai',
      },
    ],
  },
  
  // --- Advanced Mechanics & Physics Fun ---
  gifted_mechanics_grade9: {
    intro: {
      title: 'Advanced Mechanics',
      titleVn: 'Cơ học chuyên sâu & Vật lý vui',
      url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
      description: 'Tìm hiểu lực và chuyển động nâng cao với PhET',
      descriptionEn: 'Explore forces and relative motion concepts with PhET simulation',
    },
    phet: [
      {
        title: 'Forces and Motion: Basics',
        titleVn: 'Lực và Chuyển động: Cơ bản',
        url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
        description: 'Tìm hiểu lực kéo, lực ma sát và tác dụng lên vận tốc',
      },
      {
        title: 'Vector Addition',
        titleVn: 'Cộng Vector',
        url: 'https://phet.colorado.edu/sims/html/vector-addition/latest/vector-addition_all.html',
        description: 'Trực quan hóa phép cộng vector vận tốc trong chuyển động tương đối',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'The Relativity of Motion',
        titleVn: 'Tính tương đối của chuyển động',
        url: 'https://www.youtube.com/embed/17J8v68S89A',
        channel: 'MinutePhysics',
        duration: '4:52',
      },
      {
        title: 'Can You Solve This Circular Race Riddle?',
        titleVn: 'Giải bài toán rượt đuổi vòng tròn',
        url: 'https://www.youtube.com/embed/R3-7k2R1aVY',
        channel: 'TED-Ed',
        duration: '5:30',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 2: Chuyển động và Lực',
      },
      {
        title: 'Bồi dưỡng Học sinh giỏi Vật lý 9 - Cơ học',
        author: 'Nhiều tác giả',
        note: 'Chuyên đề: Chuyển động cơ học, vận tốc và chuyển động tương đối',
      },
    ],
  },

  // --- Advanced Heat & Thermodynamics ---
  gifted_heat_grade9: {
    intro: {
      title: 'Advanced Heat & Thermodynamics',
      titleVn: 'Nhiệt học nâng cao & Cân bằng',
      url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
      description: 'Khám phá sự cân bằng nhiệt và truyền nhiệt nâng cao với PhET',
      descriptionEn: 'Explore heat transfer and thermal equilibrium with PhET simulation',
    },
    phet: [
      {
        title: 'Energy Forms and Changes',
        titleVn: 'Các dạng năng lượng và Sự chuyển hóa',
        url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_all.html',
        description: 'Mô phỏng truyền nhiệt, nóng chảy và hóa hơi của các chất',
      },
    ],
    question_sims: {},
    videos: [
      {
        title: 'Misconceptions About Temperature',
        titleVn: 'Những hiểu lầm về nhiệt độ',
        url: 'https://www.youtube.com/embed/hNGJ0WHXMyE',
        channel: 'Veritasium',
        duration: '6:12',
      },
      {
        title: 'What is Entropy?',
        titleVn: 'Entropy là gì?',
        url: 'https://www.youtube.com/embed/DxL2HoqLbyA',
        channel: 'Kurzgesagt',
        duration: '8:40',
      },
    ],
    books: [
      {
        title: 'Vật lý vui — Tập 1',
        author: 'Yakov Perelman',
        note: 'Chương 9: Nhiệt học và các hiện tượng nhiệt',
      },
      {
        title: 'Bồi dưỡng Học sinh giỏi Vật lý THCS - Chuyên đề Nhiệt học',
        author: 'Nhiều tác giả',
        note: 'Chuyên đề: Cân bằng nhiệt, sự chuyển thể của các chất',
      },
    ],
  },
};

