# Math 6 Learning Matrix

Source root: `C:/Users/HAIQUYNH/OneDrive/SACH VIET/TOAN/TAI LIEU TOAN 6`

Generated design target: one canonical Grade 6 topic matrix that can be accessed by grade, semester, strand, unit, topic, level, exam target, and source lineage.

## Access Axes

| Axis | Example |
| --- | --- |
| Grade | `6` |
| Semester | `1`, `2`, `full_year` |
| Strand | `number`, `geometry`, `advanced` |
| Unit | `N1`, `N2`, `G1`, `A1` |
| Topic | `math6.number.divisibility` |
| Level | `foundation`, `core`, `application`, `advanced`, `hsg` |
| Exam target | `school`, `diagnostic`, `hsg`, `olympic` |

## Topic Matrix

| Order | Topic ID | Semester | Strand | Unit | Main Levels | Source Focus |
| ---: | --- | --- | --- | --- | --- | --- |
| 10 | `math6.number.sets_natural_numbers` | 1 | number | N1 | foundation, core, application | Tap hop, so tu nhien |
| 20 | `math6.number.natural_operations` | 1 | number | N2 | foundation, core, application | Cac phep toan lop 6 |
| 30 | `math6.number.powers_order_operations` | 1 | number | N3 | foundation, core, application, advanced | Luy thua, chu so tan cung |
| 40 | `math6.number.divisibility` | 1 | number | N4 | foundation, core, application, advanced | Dau hieu chia het |
| 50 | `math6.number.prime_factor_gcd_lcm` | 1 | number | N5 | foundation, core, application, advanced | So nguyen to, UCLN, BCNN |
| 60 | `math6.number.integers_intro` | 1 | number | N6 | foundation, core, application | So nguyen, cong tru so nguyen |
| 70 | `math6.geometry.points_lines_segments` | 1 | geometry | G1 | foundation, core, application | Diem, duong thang, tia, doan thang, trung diem |
| 80 | `math6.number.fraction_foundation` | 2 | number | N7 | foundation, core, application | Phan so, rut gon, quy dong, so sanh |
| 90 | `math6.number.fraction_operations` | 2 | number | N8 | foundation, core, application | Phep tinh phan so |
| 100 | `math6.number.fraction_three_basic_problems` | 2 | number | N9 | core, application | Ba dang toan co ban ve phan so |
| 110 | `math6.number.decimal_percent` | 2 | number | N10 | foundation, core, application | Hon so, so thap phan, phan tram |
| 120 | `math6.geometry.angles` | 2 | geometry | G2 | foundation, core, application | Goc, do goc, quan he goc |
| 210 | `math6.advanced.divisibility_hsg` | full_year | advanced | A1 | advanced, hsg | Chia het nang cao, chu so tan cung, so chinh phuong |
| 220 | `math6.advanced.gcd_lcm_applications` | full_year | advanced | A2 | application, advanced, hsg | UCLN, BCNN ung dung |
| 230 | `math6.advanced.sequence_patterns` | full_year | advanced | A3 | advanced, hsg | Day so viet theo quy luat |

## Checkpoints

| Checkpoint | Timing | Topic Scope | Source Focus |
| --- | --- | --- | --- |
| `math6.checkpoint.entry_diagnostic` | Week 1 | Entry number foundation | KSCL dau nam |
| `math6.checkpoint.midterm_1` | Week 9 | N1-N4 | Giua ky 1 |
| `math6.checkpoint.final_1` | Week 17 | N5-N6, G1 | On thi cuoi ky 1 |
| `math6.checkpoint.final_2` | Week 34 | N7-N10, G2 | On thi cuoi ky 2 |
| `math6.checkpoint.hsg_olympic` | Full year | A1-A3 | HSG, Olympic, Violympic |

## Implementation

Machine-readable data lives in `packages/content/src/math6-plan.ts`.

The exported helpers are:

- `getMath6TopicById(topicId)`
- `getMath6TopicsByAxis(axis, value)`
- `getMath6PatternsByLevel(level)`
- `buildMath6CoverageMatrix()`

