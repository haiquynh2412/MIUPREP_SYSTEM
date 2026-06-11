/**
 * detectiveMissions.js — Detective observation missions for MiuPhysics
 * 2-3 missions per chapter, all grades 6-9.
 * Students observe real physics phenomena in daily life — no special equipment needed.
 */

export const DETECTIVE_MISSIONS = {
  // ===== GRADE 6 =====

  measurement: [
    {
      id: 'det_meas_001',
      title: 'Thám tử Đo Lường',
      titleEn: 'Measurement Detective',
      description: 'Hãy ước lượng chiều dài/cao của các vật xung quanh bạn, rồi kiểm tra bằng thước!',
      task: 'Chọn 5 vật trong nhà (cái bàn, cửa sổ, quyển sách, điện thoại, chai nước). Ước lượng chiều dài bằng mắt trước, sau đó dùng thước đo chính xác. Ghi lại sai số của bạn.',
      hint: 'Dùng gang tay (khoảng 20 cm) hoặc sải tay (khoảng 1,5 m) làm đơn vị ước lượng!',
      reward: '🥇 Badge: Nhà Đo Lường',
    },
    {
      id: 'det_meas_002',
      title: 'Thám tử Thời Gian',
      titleEn: 'Time Detective',
      description: 'Bạn cảm nhận thời gian chính xác đến mức nào?',
      task: 'Nhắm mắt và đếm trong đầu 60 giây, sau đó mở mắt xem đồng hồ. Lặp lại 5 lần. Bạn sai lệch trung bình bao nhiêu giây?',
      hint: 'Thử đếm theo nhịp "một-nghìn-một, một-nghìn-hai..." — mỗi nhịp khoảng 1 giây!',
      reward: '⏰ Badge: Bậc Thầy Thời Gian',
    },
  ],

  mass_density: [
    {
      id: 'det_dens_001',
      title: 'Thám tử Nổi Chìm',
      titleEn: 'Float or Sink Detective',
      description: 'Vật nào nổi, vật nào chìm trong nước?',
      task: 'Thu thập 10 vật nhỏ trong nhà (chìa khóa, nắp chai nhựa, cục tẩy, đồng xu, quả cam, viên bi, miếng xốp...). Dự đoán nổi hay chìm, rồi thả vào chậu nước kiểm tra!',
      hint: 'Vật nổi thường có khối lượng riêng nhỏ hơn 1 g/cm³ (nước). Quả cam có vỏ xốp nên...?',
      reward: '🏊 Badge: Chuyên Gia Nổi Chìm',
    },
    {
      id: 'det_dens_002',
      title: 'Thám tử Siêu Thị',
      titleEn: 'Supermarket Detective',
      description: 'So sánh khối lượng riêng của các loại chất lỏng trong nhà bếp!',
      task: 'Lấy 3 loại chất lỏng: nước, dầu ăn, mật ong. Đổ chồng vào cốc thủy tinh (mật ong trước, rồi nước, rồi dầu). Quan sát và giải thích tại sao chúng tách lớp!',
      hint: 'Chất lỏng nào đặc hơn sẽ chìm xuống dưới. Mật ong > nước > dầu ăn.',
      reward: '🧪 Badge: Nhà Hóa Học Nhà Bếp',
    },
  ],

  force_basics: [
    {
      id: 'det_force_001',
      title: 'Thám tử Ma Sát',
      titleEn: 'Friction Detective',
      description: 'Khám phá ma sát ở khắp nơi trong nhà!',
      task: 'Kéo một quyển sách trên 3 bề mặt khác nhau: sàn gạch, thảm, bàn gỗ. Bề mặt nào kéo nặng nhất? Nhẹ nhất? Giải thích tại sao!',
      hint: 'Bề mặt gồ ghề tạo ma sát lớn hơn. Thử đặt thêm sách lên để tăng trọng lượng — ma sát thay đổi không?',
      reward: '🔬 Badge: Chuyên Gia Ma Sát',
    },
    {
      id: 'det_force_002',
      title: 'Thám tử Phản Lực',
      titleEn: 'Reaction Force Detective',
      description: 'Tìm các ví dụ về lực và phản lực trong đời sống!',
      task: 'Trong 1 ngày, ghi lại ít nhất 5 cặp lực - phản lực mà bạn quan sát được (ví dụ: đạp xe, nhảy lên, đẩy tường, bơi...). Vẽ sơ đồ lực cho mỗi trường hợp.',
      hint: 'Nhớ: lực và phản lực luôn cùng cường độ, ngược chiều, đặt trên 2 vật khác nhau!',
      reward: '💪 Badge: Newton Nhí',
    },
  ],

  motion_basics: [
    {
      id: 'det_motion_001',
      title: 'Thám tử Chuyển Động',
      titleEn: 'Motion Detective',
      description: 'Chuyển động hay đứng yên? Tùy vào vật mốc!',
      task: 'Ngồi trên xe buýt hoặc xe máy, quan sát: cây cối bên đường, người ngồi cạnh, mặt trời. Mỗi vật đang chuyển động hay đứng yên so với bạn? Ghi lại nhé!',
      hint: 'Cùng một vật có thể vừa chuyển động vừa đứng yên — tùy thuộc vào vật mốc bạn chọn!',
      reward: '🚌 Badge: Nhà Quan Sát',
    },
    {
      id: 'det_motion_002',
      title: 'Thám tử Tốc Độ Đi Bộ',
      titleEn: 'Walking Speed Detective',
      description: 'Bạn đi bộ nhanh bao nhiêu?',
      task: 'Đo quãng đường từ cổng trường đến lớp học (bước chân hoặc thước). Bấm giờ đi bộ bình thường. Tính tốc độ trung bình của bạn (m/s). So sánh với bạn bè!',
      hint: 'Người lớn đi bộ trung bình khoảng 1,2-1,5 m/s. Bạn nhanh hơn hay chậm hơn?',
      reward: '🏃 Badge: Đo Tốc Độ',
    },
  ],

  energy_basics: [
    {
      id: 'det_energy_001',
      title: 'Thám tử Năng Lượng',
      titleEn: 'Energy Detective',
      description: 'Năng lượng chuyển hóa ở khắp nơi — bạn có nhìn thấy không?',
      task: 'Trong 1 buổi sáng, ghi lại ít nhất 8 lần năng lượng chuyển hóa (ví dụ: bật đèn = điện→ánh sáng, nấu cơm = điện→nhiệt, chạy xe = xăng→chuyển động...).',
      hint: 'Mỗi khi có thay đổi (nóng lên, sáng lên, chuyển động...) — đó là năng lượng đang chuyển hóa!',
      reward: '⚡ Badge: Thợ Săn Năng Lượng',
    },
    {
      id: 'det_energy_002',
      title: 'Thám tử Tiết Kiệm Điện',
      titleEn: 'Energy Saver Detective',
      description: 'Nhà bạn tiêu tốn bao nhiêu năng lượng điện?',
      task: 'Liệt kê tất cả thiết bị điện trong nhà. Ghi lại công suất (W) trên nhãn. Ước tính mỗi thiết bị dùng bao nhiêu giờ/ngày. Thiết bị nào "ngốn" điện nhất?',
      hint: 'Điều hòa và bình nóng lạnh thường là "kẻ ngốn điện" lớn nhất trong nhà!',
      reward: '🔋 Badge: Anh Hùng Tiết Kiệm',
    },
  ],

  light_basics: [
    {
      id: 'det_light_001',
      title: 'Thám tử Bóng Tối',
      titleEn: 'Shadow Detective',
      description: 'Bóng tối thay đổi như thế nào trong một ngày?',
      task: 'Chọn một cây hoặc cột cờ ở sân trường. Vào 3 thời điểm (8h sáng, 12h trưa, 4h chiều), đánh dấu bóng và đo chiều dài. Vẽ sơ đồ bóng ở 3 thời điểm.',
      hint: 'Mặt Trời càng cao thì bóng càng ngắn. Lúc nào Mặt Trời ở cao nhất?',
      reward: '☀️ Badge: Thám Tử Bóng Tối',
    },
    {
      id: 'det_light_002',
      title: 'Thám tử Phản Chiếu',
      titleEn: 'Reflection Detective',
      description: 'Tìm các bề mặt phản chiếu quanh bạn!',
      task: 'Liệt kê 10 bề mặt phản chiếu (gương, kính cửa, mặt nước, thìa inox, điện thoại...). Xếp hạng từ phản chiếu rõ nhất đến mờ nhất. Giải thích tại sao có sự khác biệt!',
      hint: 'Bề mặt càng nhẵn bóng thì phản chiếu càng rõ — đó là phản xạ đều!',
      reward: '🪞 Badge: Bậc Thầy Phản Chiếu',
    },
  ],

  sound_basics: [
    {
      id: 'det_sound_001',
      title: 'Thám tử Âm Thanh',
      titleEn: 'Sound Detective',
      description: 'Âm thanh truyền qua vật rắn tốt hơn không khí — thử xem!',
      task: 'Áp tai xuống mặt bàn gỗ, nhờ bạn gõ nhẹ ở đầu kia. So sánh với nghe qua không khí. Thử với bàn kim loại. Vật liệu nào truyền âm tốt hơn?',
      hint: 'Người Thổ dân châu Mỹ áp tai xuống đất để nghe tiếng ngựa phi từ xa!',
      reward: '👂 Badge: Tai Thính',
    },
    {
      id: 'det_sound_002',
      title: 'Thám tử Tiếng Vang',
      titleEn: 'Echo Detective',
      description: 'Tìm nơi có tiếng vang (echo) ở trường hoặc gần nhà!',
      task: 'Tìm một nơi có bức tường lớn cách bạn ít nhất 17 mét. Vỗ tay mạnh và lắng nghe tiếng vang. Đo khoảng cách đến tường. Tính thời gian âm thanh đi-về!',
      hint: 'Âm thanh đi 340 m/s. Để nghe tiếng vang, tường phải cách ít nhất 17 m (âm đi-về = 34 m, mất 0,1s).',
      reward: '🏔️ Badge: Thợ Săn Tiếng Vang',
    },
  ],

  // ===== GRADE 7 =====

  speed_graph: [
    {
      id: 'det_speed_001',
      title: 'Thám tử Đồ Thị',
      titleEn: 'Graph Detective',
      description: 'Vẽ đồ thị quãng đường-thời gian cho hành trình của bạn!',
      task: 'Trong đường đi từ nhà đến trường, ghi lại quãng đường (dùng Google Maps) và thời gian ở mỗi đoạn (đi bộ, đợi đèn đỏ, ngồi xe). Vẽ đồ thị s-t.',
      hint: 'Đoạn đợi đèn đỏ sẽ là đường nằm ngang (quãng đường không đổi). Đoạn xe chạy nhanh sẽ là đường dốc!',
      reward: '📈 Badge: Họa Sĩ Đồ Thị',
    },
    {
      id: 'det_speed_002',
      title: 'Thám tử Tốc Độ',
      titleEn: 'Speed Tracker',
      description: 'So sánh tốc độ đi bộ, chạy, và xe đạp!',
      task: 'Đo một quãng đường 50 mét ở sân trường. Bấm giờ khi đi bộ, chạy chậm, và chạy nhanh. Tính tốc độ trung bình mỗi kiểu. Vẽ biểu đồ cột so sánh!',
      hint: 'Đi bộ ≈ 1,2 m/s, chạy chậm ≈ 3 m/s, chạy nhanh ≈ 6 m/s. Bạn đạt bao nhiêu?',
      reward: '🏃 Badge: Nhà Phân Tích Tốc Độ',
    },
  ],

  reflection_refraction: [
    {
      id: 'det_refrac_001',
      title: 'Thám tử Khúc Xạ',
      titleEn: 'Refraction Detective',
      description: 'Tìm các hiện tượng khúc xạ quanh bạn!',
      task: 'Đặt một chiếc đũa hoặc bút vào ly nước trong. Nhìn từ bên cạnh — đũa có vẻ bị gãy ở đâu? Thay đổi góc nhìn. Chụp ảnh và giải thích bằng kiến thức khúc xạ!',
      hint: 'Ánh sáng đổi hướng khi đi từ nước sang không khí vì tốc độ thay đổi!',
      reward: '🥤 Badge: Chuyên Gia Khúc Xạ',
    },
    {
      id: 'det_refrac_002',
      title: 'Thám tử Gương Phẳng',
      titleEn: 'Mirror Detective',
      description: 'Khám phá tính chất ảnh trong gương!',
      task: 'Đứng trước gương, giơ tay phải — ảnh giơ tay nào? Viết chữ trên giấy và soi gương — chữ bị đảo thế nào? Thử viết một từ đọc được cả trong gương!',
      hint: 'Chữ AMBULANCE trên xe cấp cứu viết ngược để đọc đúng trong gương chiếu hậu!',
      reward: '🪞 Badge: Bậc Thầy Gương',
    },
  ],

  sound_wave: [
    {
      id: 'det_swave_001',
      title: 'Thám tử Độ Cao Âm',
      titleEn: 'Pitch Detective',
      description: 'Khám phá mối liên hệ giữa chiều dài và cao độ âm thanh!',
      task: 'Lấy 5 chai nhựa giống nhau, đổ nước ở các mức khác nhau. Dùng đũa gõ vào chai. Chai nào kêu trầm nhất? Cao nhất? Sắp xếp thành bộ nhạc cụ!',
      hint: 'Cột không khí ngắn hơn → tần số cao hơn → âm cao hơn!',
      reward: '🎵 Badge: Nhạc Sĩ Vật Lý',
    },
    {
      id: 'det_swave_002',
      title: 'Thám tử Cách Âm',
      titleEn: 'Soundproofing Detective',
      description: 'Vật liệu nào cách âm tốt nhất?',
      task: 'Bật nhạc trên điện thoại. Bọc điện thoại bằng các vật liệu: khăn bông, túi nhựa, hộp gỗ, hộp xốp. Đánh giá mức giảm âm thanh (1-5). Vật liệu nào cách âm tốt nhất?',
      hint: 'Vật liệu xốp, mềm thường hấp thụ âm tốt hơn vật liệu cứng, nhẵn!',
      reward: '🔇 Badge: Kỹ Sư Cách Âm',
    },
  ],

  magnetic_field_basics: [
    {
      id: 'det_mag_001',
      title: 'Thám tử Nam Châm',
      titleEn: 'Magnet Detective',
      description: 'Vật nào bị nam châm hút? Bạn sẽ ngạc nhiên!',
      task: 'Lấy một nam châm (nam châm tủ lạnh) và thử hút 15 vật khác nhau: chìa khóa, đồng xu, nhôm, kẹp giấy, thìa inox, thìa nhựa, lon nước... Ghi lại kết quả!',
      hint: 'Không phải tất cả kim loại đều bị nam châm hút! Nhôm và đồng thì sao?',
      reward: '🧲 Badge: Bậc Thầy Nam Châm',
    },
    {
      id: 'det_mag_002',
      title: 'Thám tử La Bàn',
      titleEn: 'Compass Detective',
      description: 'La bàn luôn chỉ Bắc — nhưng có ngoại lệ không?',
      task: 'Dùng la bàn (hoặc app la bàn trên điện thoại). Di chuyển la bàn gần các vật: nam châm, loa, TV, dây điện, tủ lạnh. La bàn bị ảnh hưởng thế nào?',
      hint: 'Các thiết bị điện tạo ra từ trường — chúng có thể làm la bàn chỉ sai hướng!',
      reward: '🧭 Badge: Nhà Hoa Tiêu',
    },
  ],

  earth_solar_system: [
    {
      id: 'det_earth_001',
      title: 'Thám tử Mặt Trăng',
      titleEn: 'Moon Detective',
      description: 'Quan sát Mặt Trăng thay đổi hình dạng qua các ngày!',
      task: 'Trong 2 tuần, mỗi tối hãy ra ngoài quan sát Mặt Trăng. Vẽ lại hình dạng Mặt Trăng mỗi ngày. Bạn có nhận ra quy luật không?',
      hint: 'Mặt Trăng thay đổi theo chu kỳ ~29,5 ngày: trăng non → bán nguyệt → trăng tròn → bán nguyệt → trăng non.',
      reward: '🌙 Badge: Nhà Thiên Văn Nhí',
    },
    {
      id: 'det_earth_002',
      title: 'Thám tử Ngày Đêm',
      titleEn: 'Day-Night Detective',
      description: 'Tại sao mùa hè ngày dài hơn mùa đông?',
      task: 'Ghi lại giờ mặt trời mọc và lặn hôm nay. Hỏi bố mẹ hoặc tra mạng giờ mặt trời mọc/lặn 6 tháng trước. Ngày dài hơn bao nhiêu phút?',
      hint: 'Trục Trái Đất nghiêng 23,5° nên lượng ánh sáng nhận được thay đổi theo mùa!',
      reward: '🌍 Badge: Nhà Địa Lý Thiên Văn',
    },
  ],

  // ===== GRADE 8 =====

  pressure: [
    {
      id: 'det_press_001',
      title: 'Thám tử Áp Suất',
      titleEn: 'Pressure Detective',
      description: 'Áp suất thay đổi khi diện tích bị ép thay đổi!',
      task: 'Đặt một cục tẩy lên bảng. Ấn ngón tay lên cục tẩy bằng đầu ngón tay (diện tích nhỏ) rồi bằng cả lòng bàn tay (diện tích lớn). So sánh cảm giác đau. Giải thích!',
      hint: 'P = F/S — cùng một lực, diện tích nhỏ hơn → áp suất lớn hơn → đau hơn!',
      reward: '🔧 Badge: Kỹ Sư Áp Suất',
    },
    {
      id: 'det_press_002',
      title: 'Thám tử Giày Dép',
      titleEn: 'Footwear Detective',
      description: 'Giày cao gót vs dép tông — áp suất nào lớn hơn?',
      task: 'Quan sát dấu chân trên cát hoặc đất mềm khi mang các loại giày khác nhau: dép tông, giày thể thao, giày cao gót (nếu có). Dấu nào lún sâu nhất? Tính áp suất!',
      hint: 'Giày cao gót lún sâu vì diện tích tiếp xúc gót rất nhỏ (~1 cm²) → áp suất rất lớn!',
      reward: '👟 Badge: Chuyên Gia Áp Suất',
    },
  ],

  liquid_pressure: [
    {
      id: 'det_lpress_001',
      title: 'Thám tử Áp Suất Nước',
      titleEn: 'Water Pressure Detective',
      description: 'Nước ở dưới sâu có áp suất lớn hơn — chứng minh đi!',
      task: 'Lấy chai nhựa 1,5L, dùi 3 lỗ nhỏ ở 3 độ cao khác nhau (gần đáy, giữa, gần miệng). Đổ đầy nước và quan sát tia nước. Tia nào phun xa nhất? Tại sao?',
      hint: 'Áp suất chất lỏng = ρ × g × h. Lỗ ở sâu hơn → h lớn hơn → áp suất lớn hơn → phun xa hơn!',
      reward: '🌊 Badge: Thợ Lặn Áp Suất',
    },
    {
      id: 'det_lpress_002',
      title: 'Thám tử Ống Hút',
      titleEn: 'Straw Detective',
      description: 'Bạn thực sự "hút" nước lên hay áp suất khí quyển đẩy?',
      task: 'Cắm ống hút vào ly nước, bịt đầu trên bằng ngón tay, nhấc ống hút lên. Nước có chảy ra không? Tại sao? Bỏ ngón tay ra thì sao?',
      hint: 'Khi bịt đầu trên, áp suất khí quyển ở dưới giữ nước lại. Bỏ ngón tay → không khí vào → nước chảy!',
      reward: '🧃 Badge: Hiểu Khí Quyển',
    },
  ],

  buoyancy: [
    {
      id: 'det_buoy_001',
      title: 'Thám tử Archimedes',
      titleEn: 'Archimedes Detective',
      description: 'Đo lực đẩy Archimedes bằng dụng cụ đơn giản!',
      task: 'Treo một vật nặng (chìa khóa, đá) vào dây chun. Đo độ giãn của dây chun trong không khí. Nhúng vật vào nước — dây chun co lại bao nhiêu? Đó là lực đẩy Archimedes!',
      hint: 'Lực đẩy = Trọng lượng trong không khí − Trọng lượng biểu kiến trong nước.',
      reward: '🚢 Badge: Archimedes Nhí',
    },
    {
      id: 'det_buoy_002',
      title: 'Thám tử Tàu Giấy',
      titleEn: 'Paper Boat Detective',
      description: 'Thiết kế tàu giấy chở được nhiều đồng xu nhất!',
      task: 'Gấp tàu giấy từ 1 tờ giấy A4. Thả vào chậu nước, đặt từng đồng xu lên tàu. Đếm số đồng xu tàu chở được trước khi chìm. Thử thay đổi hình dạng tàu — kết quả khác không?',
      hint: 'Tàu rộng và dẹt chiếm nhiều thể tích nước hơn → lực đẩy lớn hơn → chở được nhiều hơn!',
      reward: '⛵ Badge: Kỹ Sư Tàu Thuyền',
    },
  ],

  moment_of_force: [
    {
      id: 'det_moment_001',
      title: 'Thám tử Đòn Bẩy',
      titleEn: 'Lever Detective',
      description: 'Tìm đòn bẩy ẩn giấu trong đời sống!',
      task: 'Liệt kê ít nhất 8 dụng cụ/vật dùng đòn bẩy trong nhà: kéo, kìm, mở nắp chai, bập bênh, chổi quét... Xác định điểm tựa, lực tác dụng, vật cần nâng cho mỗi cái.',
      hint: 'Phân loại: đòn bẩy loại 1 (kéo), loại 2 (xe rùa), loại 3 (gắp đá)!',
      reward: '⚖️ Badge: Bậc Thầy Đòn Bẩy',
    },
    {
      id: 'det_moment_002',
      title: 'Thám tử Cánh Cửa',
      titleEn: 'Door Detective',
      description: 'Mở cửa dễ hơn khi đẩy ở đâu?',
      task: 'Thử đẩy cửa phòng ở 3 vị trí: gần bản lề, giữa cánh cửa, và ở tay nắm (xa bản lề nhất). Cần lực bao nhiêu ở mỗi vị trí? Giải thích bằng momen lực!',
      hint: 'M = F × d. Khoảng cách đến bản lề (d) càng lớn → cần lực (F) càng nhỏ để tạo cùng momen!',
      reward: '🚪 Badge: Vua Momen',
    },
  ],

  kinetic_energy: [
    {
      id: 'det_ke_001',
      title: 'Thám tử Động Năng',
      titleEn: 'Kinetic Energy Detective',
      description: 'Tốc độ ảnh hưởng đến động năng nhiều hơn khối lượng!',
      task: 'Lăn một viên bi xuống dốc từ 3 độ cao khác nhau. Đặt lon rỗng ở cuối dốc. Đo khoảng cách lon bị đẩy đi. Tốc độ tăng gấp đôi → lon di chuyển xa hơn bao nhiêu lần?',
      hint: 'W = ½mv². Tốc độ gấp đôi → động năng gấp 4 → lon bị đẩy xa gấp ~4 lần!',
      reward: '🏎️ Badge: Chuyên Gia Động Năng',
    },
  ],

  potential_energy: [
    {
      id: 'det_pe_001',
      title: 'Thám tử Thế Năng',
      titleEn: 'Potential Energy Detective',
      description: 'Độ cao quyết định thế năng — chứng minh nhé!',
      task: 'Thả một quả bóng tennis từ 3 độ cao: 50 cm, 1 m, 1,5 m. Quan sát quả bóng nảy cao đến đâu sau khi chạm đất. Độ cao thả càng lớn → nảy cao hơn bao nhiêu?',
      hint: 'Thế năng = mgh. Rơi từ cao → tốc độ chạm đất lớn → nảy cao hơn!',
      reward: '⛰️ Badge: Leo Núi Thế Năng',
    },
  ],

  energy_conservation: [
    {
      id: 'det_econs_001',
      title: 'Thám tử Bảo Toàn',
      titleEn: 'Conservation Detective',
      description: 'Năng lượng đi đâu khi xích đu dừng lại?',
      task: 'Đẩy xích đu (hoặc con lắc treo bằng dây và vật nặng). Đếm số lần dao động cho đến khi dừng hẳn. Năng lượng ban đầu đã biến đi đâu? Liệt kê các dạng năng lượng!',
      hint: 'Năng lượng chuyển thành nhiệt (ma sát ở điểm treo + sức cản không khí). Tổng năng lượng vẫn bảo toàn!',
      reward: '♻️ Badge: Nhà Bảo Toàn',
    },
  ],

  heat_transfer: [
    {
      id: 'det_heat_001',
      title: 'Thám tử Truyền Nhiệt',
      titleEn: 'Heat Transfer Detective',
      description: 'Vật liệu nào dẫn nhiệt tốt nhất trong nhà bếp?',
      task: 'Đặt thìa inox, thìa gỗ, thìa nhựa vào cốc nước nóng. Sau 1 phút, sờ cán thìa. Thìa nào nóng nhất? Giải thích tại sao muỗng gỗ dùng nấu ăn an toàn hơn!',
      hint: 'Kim loại dẫn nhiệt tốt nhất. Gỗ và nhựa là chất cách nhiệt — đó là lý do cán nồi làm bằng nhựa!',
      reward: '🔥 Badge: Chuyên Gia Nhiệt',
    },
    {
      id: 'det_heat_002',
      title: 'Thám tử Bức Xạ Nhiệt',
      titleEn: 'Radiation Detective',
      description: 'Màu sắc ảnh hưởng đến hấp thụ nhiệt — thử xem!',
      task: 'Đặt 2 lon nước ngoài nắng: 1 lon bọc giấy đen, 1 lon bọc giấy trắng. Sau 30 phút, đo nhiệt độ nước bên trong. Lon nào nóng hơn? Tại sao?',
      hint: 'Vật màu đen hấp thụ bức xạ nhiệt tốt hơn vật màu trắng. Đó là lý do mặc áo sáng màu vào mùa hè!',
      reward: '☀️ Badge: Hiểu Bức Xạ',
    },
  ],

  // ===== GRADE 9 =====

  resistance_ohm: [
    {
      id: 'det_ohm_001',
      title: 'Thám tử Điện Trở',
      titleEn: 'Resistance Detective',
      description: 'Tìm hiểu điện trở ảnh hưởng đến độ sáng đèn!',
      task: 'Quan sát đèn trong nhà: đèn LED, đèn sợi đốt (nếu còn), đèn huỳnh quang. Đèn nào nóng nhất khi sờ vào? Đèn nóng hơn có điện trở dây tóc lớn hơn hay nhỏ hơn?',
      hint: 'Đèn sợi đốt nóng nhất vì hầu hết năng lượng biến thành nhiệt qua điện trở dây tóc!',
      reward: '⚡ Badge: Nhà Điện Học',
    },
    {
      id: 'det_ohm_002',
      title: 'Thám tử Vật Dẫn Điện',
      titleEn: 'Conductor Detective',
      description: 'Vật nào dẫn điện? Vật nào cách điện?',
      task: 'Dùng pin, bóng đèn LED, và dây nối đơn giản. Kẹp các vật vào giữa mạch: chìa khóa, bút chì (ruột than chì), tẩy, đồng xu, giấy. Đèn sáng với vật nào?',
      hint: 'Kim loại và than chì dẫn điện. Nhựa, giấy, cao su cách điện!',
      reward: '🔌 Badge: Thám Tử Mạch Điện',
    },
  ],

  electric_circuit: [
    {
      id: 'det_circuit_001',
      title: 'Thám tử Mạch Điện',
      titleEn: 'Circuit Detective',
      description: 'Nối tiếp hay song song — ảnh hưởng gì đến độ sáng?',
      task: 'Trong nhà bạn, khi tắt 1 bóng đèn, các đèn khác có tắt theo không? Đó là mạch nối tiếp hay song song? Tìm ví dụ mạch nối tiếp (đèn trang trí Noel cũ!).',
      hint: 'Đèn trong nhà mắc song song — tắt 1 đèn, đèn khác vẫn sáng. Đèn Noel cũ mắc nối tiếp — cháy 1 bóng, cả dây tắt!',
      reward: '💡 Badge: Kỹ Sư Mạch Điện',
    },
  ],

  electric_power: [
    {
      id: 'det_power_001',
      title: 'Thám tử Hóa Đơn Điện',
      titleEn: 'Electric Bill Detective',
      description: 'Ai là "thủ phạm" ngốn điện nhất trong nhà?',
      task: 'Đọc nhãn công suất (W) trên 10 thiết bị điện trong nhà. Ước tính giờ sử dụng mỗi ngày. Tính điện năng tiêu thụ = P × t (Wh). Thiết bị nào tiêu tốn nhiều nhất?',
      hint: '1 kWh ≈ 2.000-3.000 VNĐ. Điều hòa 1.000W chạy 8h = 8 kWh = ~20.000 VNĐ/ngày!',
      reward: '💰 Badge: Nhà Kinh Tế Năng Lượng',
    },
    {
      id: 'det_power_002',
      title: 'Thám tử Nhãn Năng Lượng',
      titleEn: 'Energy Label Detective',
      description: 'Đọc nhãn năng lượng trên thiết bị điện!',
      task: 'Tìm nhãn năng lượng trên tủ lạnh, điều hòa, hoặc máy giặt ở nhà. Ghi lại: hạng sao, công suất, điện năng tiêu thụ/năm. So sánh với thiết bị hạng sao thấp hơn.',
      hint: 'Thiết bị 5 sao tiết kiệm đến 40% điện so với thiết bị 1 sao cùng loại!',
      reward: '⭐ Badge: Chuyên Gia Nhãn Năng Lượng',
    },
  ],

  magnetic_force: [
    {
      id: 'det_emforce_001',
      title: 'Thám tử Điện Từ',
      titleEn: 'Electromagnetic Detective',
      description: 'Tạo nam châm điện từ tại nhà!',
      task: 'Quấn dây đồng (30-50 vòng) quanh một cây đinh sắt lớn. Nối 2 đầu dây với pin 1.5V. Thử hút kẹp giấy. Thêm vòng dây hoặc thêm pin — lực hút thay đổi thế nào?',
      hint: 'Nhiều vòng dây hơn hoặc dòng điện lớn hơn → từ trường mạnh hơn → hút mạnh hơn!',
      reward: '🧲 Badge: Nhà Phát Minh Điện Từ',
    },
  ],

  light_spectrum: [
    {
      id: 'det_spectrum_001',
      title: 'Thám tử Quang Phổ',
      titleEn: 'Spectrum Detective',
      description: 'Tạo cầu vồng tại nhà!',
      task: 'Dùng đĩa CD cũ (hoặc bong bóng xà phòng). Chiếu đèn pin vào bề mặt đĩa CD ở các góc khác nhau. Bạn thấy những màu gì? Sắp xếp theo thứ tự cầu vồng!',
      hint: 'Bề mặt CD có các rãnh siêu nhỏ hoạt động như cách tử nhiễu xạ — tách ánh sáng trắng thành quang phổ!',
      reward: '🌈 Badge: Họa Sĩ Quang Phổ',
    },
    {
      id: 'det_spectrum_002',
      title: 'Thám tử Tia UV',
      titleEn: 'UV Detective',
      description: 'Tia UV từ Mặt Trời — có thể "nhìn thấy" hiệu ứng!',
      task: 'Đặt một tờ giấy trắng ra nắng, đặt lên vài vật (chìa khóa, lá cây). Sau 2-3 ngày, nhấc vật lên. Giấy có thay đổi màu không? Tia UV đã làm gì?',
      hint: 'Tia UV làm phai màu giấy ở chỗ không bị che. Kem chống nắng hoạt động bằng cách chặn tia UV!',
      reward: '😎 Badge: Chuyên Gia UV',
    },
  ],

  nuclear_energy_intro: [
    {
      id: 'det_nuclear_001',
      title: 'Thám tử Phóng Xạ',
      titleEn: 'Radioactivity Detective',
      description: 'Phóng xạ tự nhiên ở quanh ta — đừng lo, rất nhỏ!',
      task: 'Tìm hiểu: thực phẩm nào chứa phóng xạ tự nhiên? (Gợi ý: chuối, hạt Brazil). Tra cứu: 1 quả chuối chứa bao nhiêu Potassium-40? Bạn cần ăn bao nhiêu chuối để "nguy hiểm"?',
      hint: '1 quả chuối chứa ~15 Bq K-40. Bạn cần ăn ~35 triệu quả chuối cùng lúc mới đáng lo!',
      reward: '☢️ Badge: Hiểu Phóng Xạ',
    },
  ],
};

export default DETECTIVE_MISSIONS;
