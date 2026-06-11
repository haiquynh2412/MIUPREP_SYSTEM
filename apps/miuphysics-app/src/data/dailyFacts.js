/**
 * dailyFacts.js — Fun physics facts for MiuPhysics
 * 50+ engaging facts organized by chapter, covering all grades 6-9.
 * Each fact connects physics to everyday life in Vietnam.
 */

export const DAILY_FACTS = [
  // ===== GRADE 6 =====

  // --- measurement ---
  { id: 'fact_001', chapter: 'measurement', grade: 6, fact: 'Sấm sét có thể làm nóng không khí lên 30.000°C — nóng gấp 5 lần bề mặt Mặt Trời!', factEn: 'Lightning heats air to 30,000°C — 5x hotter than the Sun\'s surface!', emoji: '⚡', relatedTopic: 'Nhiệt độ' },
  { id: 'fact_002', chapter: 'measurement', grade: 6, fact: 'Một sợi tóc người dày khoảng 70 micromet — mỏng hơn tờ giấy A4 gần 2 lần!', factEn: 'A human hair is about 70 micrometers thick — nearly 2x thinner than A4 paper!', emoji: '💇', relatedTopic: 'Đơn vị đo' },
  { id: 'fact_003', chapter: 'measurement', grade: 6, fact: 'Đồng hồ nguyên tử chính xác đến mức nếu chạy từ thời khủng long, đến nay chỉ lệch 1 giây!', factEn: 'Atomic clocks are so precise that if running since dinosaur times, they\'d only be off by 1 second!', emoji: '⏰', relatedTopic: 'Đo thời gian' },

  // --- mass_density ---
  { id: 'fact_004', chapter: 'mass_density', grade: 6, fact: 'Nếu bỏ Sao Thổ vào bể nước khổng lồ, nó sẽ NỔI vì khối lượng riêng nhỏ hơn nước!', factEn: 'If you could put Saturn in a giant pool, it would FLOAT because its density is less than water!', emoji: '🪐', relatedTopic: 'Khối lượng riêng' },
  { id: 'fact_005', chapter: 'mass_density', grade: 6, fact: 'Vàng nặng đến nỗi 1 lít vàng nặng gần 20 kg — nặng gấp 20 lần 1 lít nước!', factEn: 'Gold is so dense that 1 liter weighs nearly 20 kg — 20 times heavier than water!', emoji: '🥇', relatedTopic: 'Khối lượng riêng' },
  { id: 'fact_006', chapter: 'mass_density', grade: 6, fact: 'Mật ong đặc hơn nước 1,4 lần — đó là lý do mật ong chảy chậm khi rót từ chai!', factEn: 'Honey is 1.4x denser than water — that\'s why it flows slowly when poured!', emoji: '🍯', relatedTopic: 'Khối lượng riêng' },

  // --- force_basics ---
  { id: 'fact_007', chapter: 'force_basics', grade: 6, fact: 'Khi bạn đi bộ, bạn thực ra đang ĐẨY Trái Đất ra sau — nhưng Trái Đất quá nặng nên không thấy!', factEn: 'When you walk, you\'re actually pushing the Earth backward — but Earth is too heavy to notice!', emoji: '🌍', relatedTopic: 'Phản lực' },
  { id: 'fact_008', chapter: 'force_basics', grade: 6, fact: 'Lực ma sát giúp bạn cầm được đũa gắp thức ăn. Không có ma sát, đũa sẽ trơn tuột!', factEn: 'Friction helps you grip chopsticks. Without it, chopsticks would slide right out!', emoji: '🥢', relatedTopic: 'Ma sát' },
  { id: 'fact_009', chapter: 'force_basics', grade: 6, fact: 'Một con kiến có thể mang vật nặng gấp 50 lần trọng lượng cơ thể nó — như bạn khiêng 3 tấn!', factEn: 'An ant can carry 50 times its body weight — like you carrying 3 tons!', emoji: '🐜', relatedTopic: 'Lực' },

  // --- motion_basics ---
  { id: 'fact_010', chapter: 'motion_basics', grade: 6, fact: 'Trái Đất quay quanh Mặt Trời với tốc độ 107.000 km/h — nhưng ta không cảm nhận được!', factEn: 'Earth orbits the Sun at 107,000 km/h — but we can\'t feel it!', emoji: '🌎', relatedTopic: 'Chuyển động tương đối' },
  { id: 'fact_011', chapter: 'motion_basics', grade: 6, fact: 'Khi ngồi trên xe buýt, bạn đứng yên so với ghế nhưng chuyển động so với cây cối bên đường!', factEn: 'On a bus, you\'re still relative to your seat but moving relative to roadside trees!', emoji: '🚌', relatedTopic: 'Vật mốc' },

  // --- energy_basics ---
  { id: 'fact_012', chapter: 'energy_basics', grade: 6, fact: 'Pin điện thoại của bạn chứa đủ năng lượng để nâng một quả tạ 10 kg lên cao 1.500 m!', factEn: 'Your phone battery has enough energy to lift a 10 kg weight 1,500 m high!', emoji: '🔋', relatedTopic: 'Năng lượng' },
  { id: 'fact_013', chapter: 'energy_basics', grade: 6, fact: 'Mỗi ngày, Mặt Trời cung cấp cho Trái Đất lượng năng lượng đủ dùng cho nhân loại trong 27 năm!', factEn: 'Every day, the Sun provides Earth with enough energy for humanity for 27 years!', emoji: '☀️', relatedTopic: 'Năng lượng Mặt Trời' },
  { id: 'fact_014', chapter: 'energy_basics', grade: 6, fact: 'Khi bạn xoa hai tay vào nhau thấy nóng, bạn đang chuyển động năng thành nhiệt năng!', factEn: 'When you rub your hands and feel warmth, you\'re converting kinetic energy to heat!', emoji: '🤲', relatedTopic: 'Chuyển hóa năng lượng' },

  // --- light_basics ---
  { id: 'fact_015', chapter: 'light_basics', grade: 6, fact: 'Ánh sáng Mặt Trời mất 8 phút 20 giây để đến Trái Đất — bạn luôn nhìn thấy Mặt Trời "quá khứ"!', factEn: 'Sunlight takes 8 min 20 sec to reach Earth — you always see the Sun\'s "past"!', emoji: '🌞', relatedTopic: 'Vận tốc ánh sáng' },
  { id: 'fact_016', chapter: 'light_basics', grade: 6, fact: 'Bóng của bạn dài hơn vào buổi sáng và chiều vì góc chiếu sáng của Mặt Trời thay đổi!', factEn: 'Your shadow is longer in morning and evening because the Sun\'s angle changes!', emoji: '🌅', relatedTopic: 'Bóng tối' },
  { id: 'fact_017', chapter: 'light_basics', grade: 6, fact: 'Nếu Trái Đất không có khí quyển, bầu trời sẽ đen kịt cả ban ngày — như trên Mặt Trăng!', factEn: 'Without atmosphere, the sky would be black in daytime — like on the Moon!', emoji: '🌙', relatedTopic: 'Tán xạ ánh sáng' },

  // --- sound_basics ---
  { id: 'fact_018', chapter: 'sound_basics', grade: 6, fact: 'Âm thanh truyền trong nước nhanh gấp 4 lần trong không khí — cá voi nói chuyện xa cả nghìn km!', factEn: 'Sound travels 4x faster in water — whales communicate across thousands of km!', emoji: '🐋', relatedTopic: 'Vận tốc âm thanh' },
  { id: 'fact_019', chapter: 'sound_basics', grade: 6, fact: 'Muỗi vo ve ở tần số khoảng 600 Hz — con người nghe được từ 20 Hz đến 20.000 Hz!', factEn: 'Mosquitoes buzz at about 600 Hz — humans hear from 20 Hz to 20,000 Hz!', emoji: '🦟', relatedTopic: 'Tần số' },
  { id: 'fact_020', chapter: 'sound_basics', grade: 6, fact: 'Trong vũ trụ không có không khí, nên không ai nghe thấy bạn hét — im lặng tuyệt đối!', factEn: 'In space there\'s no air, so no one can hear you scream — absolute silence!', emoji: '🚀', relatedTopic: 'Môi trường truyền âm' },

  // ===== GRADE 7 =====

  // --- speed_graph ---
  { id: 'fact_021', chapter: 'speed_graph', grade: 7, fact: 'Usain Bolt đạt tốc độ tối đa 44,72 km/h — nhanh hơn tốc độ giới hạn trong ngõ hẻm!', factEn: 'Usain Bolt\'s top speed was 44.72 km/h — faster than the speed limit in alleys!', emoji: '🏃‍♂️', relatedTopic: 'Tốc độ' },
  { id: 'fact_022', chapter: 'speed_graph', grade: 7, fact: 'Nếu vẽ đồ thị quãng đường-thời gian của ốc sên, đường gần như nằm ngang vì nó chỉ đi 0,05 km/h!', factEn: 'A snail\'s distance-time graph would be nearly flat — it only moves at 0.05 km/h!', emoji: '🐌', relatedTopic: 'Đồ thị chuyển động' },

  // --- reflection_refraction ---
  { id: 'fact_023', chapter: 'reflection_refraction', grade: 7, fact: 'Kim cương lấp lánh vì ánh sáng bị phản xạ toàn phần bên trong — chiết suất của kim cương rất cao!', factEn: 'Diamonds sparkle because light gets totally internally reflected — very high refractive index!', emoji: '💎', relatedTopic: 'Phản xạ toàn phần' },
  { id: 'fact_024', chapter: 'reflection_refraction', grade: 7, fact: 'Ống hút trong ly nước trông bị gãy vì ánh sáng bị khúc xạ khi đi từ nước sang không khí!', factEn: 'A straw looks bent in water because light refracts when passing from water to air!', emoji: '🥤', relatedTopic: 'Khúc xạ' },
  { id: 'fact_025', chapter: 'reflection_refraction', grade: 7, fact: 'Cầu vồng xuất hiện vì giọt mưa hoạt động như lăng kính — tách ánh sáng trắng thành 7 màu!', factEn: 'Rainbows appear because raindrops act as prisms — splitting white light into 7 colors!', emoji: '🌈', relatedTopic: 'Tán sắc ánh sáng' },

  // --- sound_wave ---
  { id: 'fact_026', chapter: 'sound_wave', grade: 7, fact: 'Tiếng sấm là tiếng "nổ siêu thanh" — không khí nở ra nhanh hơn tốc độ âm thanh!', factEn: 'Thunder is a sonic boom — air expands faster than the speed of sound!', emoji: '⛈️', relatedTopic: 'Sóng âm' },
  { id: 'fact_027', chapter: 'sound_wave', grade: 7, fact: 'Dơi dùng sóng siêu âm để "nhìn" trong bóng tối — gửi tín hiệu và đợi phản hồi!', factEn: 'Bats use ultrasound to "see" in the dark — they send signals and wait for echoes!', emoji: '🦇', relatedTopic: 'Siêu âm' },

  // --- magnetic_field_basics ---
  { id: 'fact_028', chapter: 'magnetic_field_basics', grade: 7, fact: 'Trái Đất là một nam châm khổng lồ — đó là lý do la bàn luôn chỉ hướng Bắc!', factEn: 'Earth is a giant magnet — that\'s why compasses always point north!', emoji: '🧭', relatedTopic: 'Từ trường Trái Đất' },
  { id: 'fact_029', chapter: 'magnetic_field_basics', grade: 7, fact: 'Cực Bắc từ của Trái Đất thực ra nằm ở gần cực Nam địa lý — và nó đang di chuyển mỗi năm!', factEn: 'Earth\'s magnetic north pole is actually near the geographic south — and it moves every year!', emoji: '🌐', relatedTopic: 'Từ trường Trái Đất' },

  // --- earth_solar_system ---
  { id: 'fact_030', chapter: 'earth_solar_system', grade: 7, fact: 'Sao Mộc lớn đến nỗi có thể chứa hơn 1.300 Trái Đất bên trong!', factEn: 'Jupiter is so huge that over 1,300 Earths could fit inside it!', emoji: '🪐', relatedTopic: 'Hệ Mặt Trời' },
  { id: 'fact_031', chapter: 'earth_solar_system', grade: 7, fact: 'Một ngày trên Sao Kim dài hơn một năm trên Sao Kim — nó quay quanh trục rất chậm!', factEn: 'A day on Venus is longer than a year on Venus — it rotates very slowly!', emoji: '🌟', relatedTopic: 'Chu kỳ quay' },

  // ===== GRADE 8 =====

  // --- pressure ---
  { id: 'fact_032', chapter: 'pressure', grade: 8, fact: 'Dao sắc cắt dễ hơn dao cùn vì diện tích tiếp xúc nhỏ hơn → áp suất lớn hơn!', factEn: 'Sharp knives cut easier because smaller contact area → greater pressure!', emoji: '🔪', relatedTopic: 'Áp suất' },
  { id: 'fact_033', chapter: 'pressure', grade: 8, fact: 'Lạc đà đi được trên sa mạc nhờ bàn chân rộng — giảm áp suất lên cát để không bị lún!', factEn: 'Camels walk on sand with wide feet — reducing pressure to avoid sinking!', emoji: '🐪', relatedTopic: 'Áp suất' },

  // --- liquid_pressure ---
  { id: 'fact_034', chapter: 'liquid_pressure', grade: 8, fact: 'Ở rãnh Mariana sâu nhất (11 km), áp suất nước gấp 1.086 lần áp suất khí quyển!', factEn: 'At the deepest Mariana Trench (11 km), water pressure is 1,086x atmospheric pressure!', emoji: '🌊', relatedTopic: 'Áp suất chất lỏng' },
  { id: 'fact_035', chapter: 'liquid_pressure', grade: 8, fact: 'Bạn hút nước bằng ống hút nhờ áp suất khí quyển đẩy nước lên — không phải bạn "hút" đâu!', factEn: 'You drink through a straw because atmospheric pressure pushes water up — you don\'t "suck" it!', emoji: '🧃', relatedTopic: 'Áp suất khí quyển' },

  // --- buoyancy ---
  { id: 'fact_036', chapter: 'buoyancy', grade: 8, fact: 'Tàu Titanic nặng 52.000 tấn nhưng vẫn nổi — vì thể tích nước bị chiếm chỗ tạo lực đẩy đủ lớn!', factEn: 'The Titanic weighed 52,000 tons but still floated — displaced water created enough buoyancy!', emoji: '🚢', relatedTopic: 'Lực đẩy Archimedes' },
  { id: 'fact_037', chapter: 'buoyancy', grade: 8, fact: 'Bạn cảm thấy nhẹ hơn khi bơi vì lực đẩy Archimedes đỡ một phần trọng lượng của bạn!', factEn: 'You feel lighter swimming because Archimedes\' buoyancy supports part of your weight!', emoji: '🏊', relatedTopic: 'Lực đẩy Archimedes' },

  // --- moment_of_force ---
  { id: 'fact_038', chapter: 'moment_of_force', grade: 8, fact: 'Archimedes từng nói: "Hãy cho tôi điểm tựa, tôi sẽ nâng cả Trái Đất!" — đó là nguyên lý đòn bẩy!', factEn: 'Archimedes said: "Give me a lever and I\'ll move the Earth!" — that\'s the lever principle!', emoji: '⚖️', relatedTopic: 'Đòn bẩy' },
  { id: 'fact_039', chapter: 'moment_of_force', grade: 8, fact: 'Tay nắm cửa đặt xa bản lề để tăng cánh tay đòn — mở cửa nhẹ nhàng hơn!', factEn: 'Door handles are far from hinges to increase the lever arm — making doors easier to open!', emoji: '🚪', relatedTopic: 'Momen lực' },

  // --- kinetic_energy ---
  { id: 'fact_040', chapter: 'kinetic_energy', grade: 8, fact: 'Xe máy chạy 60 km/h có động năng gấp 4 lần khi chạy 30 km/h — vì động năng tỉ lệ với v²!', factEn: 'A motorbike at 60 km/h has 4x the kinetic energy of 30 km/h — because KE ∝ v²!', emoji: '🏍️', relatedTopic: 'Động năng' },
  { id: 'fact_041', chapter: 'kinetic_energy', grade: 8, fact: 'Một giọt mưa nhỏ rơi từ mây cao 2 km — nếu không có sức cản không khí, nó sẽ đập như viên đạn!', factEn: 'A raindrop falling 2 km — without air resistance, it would hit like a bullet!', emoji: '🌧️', relatedTopic: 'Động năng' },

  // --- potential_energy ---
  { id: 'fact_042', chapter: 'potential_energy', grade: 8, fact: 'Nước trên đập thủy điện Hòa Bình có thế năng khổng lồ — khi rơi xuống, nó chạy turbine phát điện!', factEn: 'Water atop Hoa Binh Dam has huge potential energy — falling, it spins turbines for electricity!', emoji: '🏔️', relatedTopic: 'Thế năng trọng trường' },
  { id: 'fact_043', chapter: 'potential_energy', grade: 8, fact: 'Lò xo trong bút bi bị nén chứa thế năng đàn hồi — nhả ra, nó đẩy ngòi bút bật lên!', factEn: 'A compressed pen spring stores elastic potential energy — release it, the tip pops up!', emoji: '🖊️', relatedTopic: 'Thế năng đàn hồi' },

  // --- energy_conservation ---
  { id: 'fact_044', chapter: 'energy_conservation', grade: 8, fact: 'Khi bạn đu xích đu, năng lượng liên tục chuyển từ thế năng sang động năng và ngược lại!', factEn: 'On a swing, energy constantly converts between potential and kinetic energy!', emoji: '🎢', relatedTopic: 'Bảo toàn năng lượng' },
  { id: 'fact_045', chapter: 'energy_conservation', grade: 8, fact: 'Năng lượng không tự sinh ra hay mất đi — nó chỉ chuyển từ dạng này sang dạng khác!', factEn: 'Energy cannot be created or destroyed — it only transforms from one form to another!', emoji: '♻️', relatedTopic: 'Định luật bảo toàn' },

  // --- heat_transfer ---
  { id: 'fact_046', chapter: 'heat_transfer', grade: 8, fact: 'Nồi nhôm nấu nhanh hơn nồi đất vì nhôm dẫn nhiệt tốt gấp 100 lần!', factEn: 'Aluminum pots cook faster because aluminum conducts heat 100x better than clay!', emoji: '🍳', relatedTopic: 'Dẫn nhiệt' },
  { id: 'fact_047', chapter: 'heat_transfer', grade: 8, fact: 'Gió biển thổi từ biển vào đất ban ngày và ngược lại ban đêm — đó là đối lưu tự nhiên!', factEn: 'Sea breeze blows from sea to land by day and reverses at night — natural convection!', emoji: '🌬️', relatedTopic: 'Đối lưu' },

  // ===== GRADE 9 =====

  // --- resistance_ohm ---
  { id: 'fact_048', chapter: 'resistance_ohm', grade: 9, fact: 'Dây tóc bóng đèn sợi đốt nóng đến 2.500°C — gần bằng nhiệt độ bề mặt ngôi sao!', factEn: 'Incandescent bulb filaments heat to 2,500°C — nearly as hot as a star\'s surface!', emoji: '💡', relatedTopic: 'Điện trở' },
  { id: 'fact_049', chapter: 'resistance_ohm', grade: 9, fact: 'Cơ thể người có điện trở khoảng 1.000-100.000 Ω — da ướt giảm điện trở, dễ bị giật hơn!', factEn: 'Human body resistance is 1,000-100,000 Ω — wet skin reduces it, increasing shock risk!', emoji: '⚡', relatedTopic: 'Điện trở' },

  // --- electric_circuit ---
  { id: 'fact_050', chapter: 'electric_circuit', grade: 9, fact: 'Đèn LED tiêu thụ ít điện hơn đèn sợi đốt 10 lần — nhà bạn tiết kiệm bao nhiêu nếu đổi hết LED?', factEn: 'LEDs use 10x less electricity than incandescent bulbs — how much would your home save?', emoji: '💡', relatedTopic: 'Mạch điện' },
  { id: 'fact_051', chapter: 'electric_circuit', grade: 9, fact: 'Electron trong dây điện di chuyển rất chậm (~0,1 mm/s) nhưng tín hiệu điện truyền gần bằng tốc độ ánh sáng!', factEn: 'Electrons in wires move very slowly (~0.1 mm/s) but electrical signals travel near light speed!', emoji: '🔌', relatedTopic: 'Dòng điện' },

  // --- electric_power ---
  { id: 'fact_052', chapter: 'electric_power', grade: 9, fact: 'Điều hòa 1 HP tiêu thụ khoảng 750W — bật 8 giờ/ngày tốn ~150.000 VNĐ/tháng tiền điện!', factEn: 'A 1 HP AC uses ~750W — running 8 hrs/day costs ~150,000 VND/month in electricity!', emoji: '❄️', relatedTopic: 'Công suất điện' },
  { id: 'fact_053', chapter: 'electric_power', grade: 9, fact: 'Sét đánh trong 1 phần triệu giây nhưng công suất lên đến 1 tỷ Watt — đủ thắp sáng cả thành phố!', factEn: 'Lightning strikes in microseconds but peaks at 1 billion Watts — enough to light a city!', emoji: '⚡', relatedTopic: 'Công suất' },

  // --- magnetic_force ---
  { id: 'fact_054', chapter: 'magnetic_force', grade: 9, fact: 'Tàu đệm từ Maglev ở Nhật bay lơ lửng trên ray nhờ lực từ — đạt tốc độ 603 km/h!', factEn: 'Japan\'s Maglev train floats above tracks using magnetic force — reaching 603 km/h!', emoji: '🚄', relatedTopic: 'Lực từ' },
  { id: 'fact_055', chapter: 'magnetic_force', grade: 9, fact: 'Loa và tai nghe hoạt động nhờ lực từ — nam châm + cuộn dây + màng rung tạo ra âm thanh!', factEn: 'Speakers and earphones work via magnetic force — magnet + coil + membrane = sound!', emoji: '🎧', relatedTopic: 'Cảm ứng điện từ' },

  // --- light_spectrum ---
  { id: 'fact_056', chapter: 'light_spectrum', grade: 9, fact: 'Mắt người chỉ thấy 0,0035% quang phổ điện từ — phần còn lại là tia hồng ngoại, UV, sóng radio...', factEn: 'Human eyes see only 0.0035% of the EM spectrum — the rest is infrared, UV, radio waves...', emoji: '👁️', relatedTopic: 'Quang phổ' },
  { id: 'fact_057', chapter: 'light_spectrum', grade: 9, fact: 'Tôm bọ ngựa có 16 loại tế bào thụ cảm màu — con người chỉ có 3 (đỏ, xanh lá, xanh dương)!', factEn: 'Mantis shrimp have 16 types of color receptors — humans only have 3 (R, G, B)!', emoji: '🦐', relatedTopic: 'Ánh sáng nhìn thấy' },

  // --- nuclear_energy_intro ---
  { id: 'fact_058', chapter: 'nuclear_energy_intro', grade: 9, fact: '1 gram uranium-235 giải phóng năng lượng bằng 3 tấn than đá — theo E = mc²!', factEn: '1 gram of uranium-235 releases energy equal to 3 tons of coal — thanks to E = mc²!', emoji: '☢️', relatedTopic: 'Năng lượng hạt nhân' },
  { id: 'fact_059', chapter: 'nuclear_energy_intro', grade: 9, fact: 'Mặt Trời là một lò phản ứng nhiệt hạch khổng lồ — mỗi giây nó biến 600 triệu tấn hydro thành heli!', factEn: 'The Sun is a giant fusion reactor — converting 600 million tons of hydrogen to helium per second!', emoji: '☀️', relatedTopic: 'Phản ứng nhiệt hạch' },
  { id: 'fact_060', chapter: 'nuclear_energy_intro', grade: 9, fact: 'Nếu chuyển toàn bộ khối lượng 1 đồng xu thành năng lượng (E=mc²), đủ cung cấp điện cho Việt Nam hàng trăm năm!', factEn: 'Converting a coin\'s entire mass to energy (E=mc²) could power Vietnam for hundreds of years!', emoji: '🪙', relatedTopic: 'E = mc²' },
];

export default DAILY_FACTS;
