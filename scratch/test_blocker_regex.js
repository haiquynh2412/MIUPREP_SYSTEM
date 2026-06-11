const prompt = `Bài 6: Bạn Bình cầm một bộ bài gồm {formula:/assets/math8/formulas/ch-ng-8-m-u-v-t-nh-x-c-su-t-c-a-bi-n-c-16-trang-docx-c676749d/formula0430.png|w=15|h=13}} lá và đưa cho Thảo rút bất kì một lá. Tính xác suất để thảo rút được lá có chất cơ. Tính xác suất để thảo rút được lá hình ( lá {formula:/assets/math8/formulas/ch-ng-8-m-u-v-t-nh-x-c-su-t-c-a-bi-n-c-16-trang-docx-c676749d/formula0431.png|w=42|h=15}} ) Tính xác suất để Thảo rút được lá nhỏ hơn {formula:/assets/math8/formulas/ch-ng-8-m-u-v-t-nh-x-c-su-t-c-a-bi-n-c-16-trang-docx-c676749d/formula0432.png|w=9|h=13}}`;

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

const text = normalizeSearchText(prompt);
const originalLower = String(prompt || '').toLowerCase();

// Safe boundary checks
const r3_safe = /(?:^|[^a-z0-9À-ỹ])(?:bi\u1ebft|b\u1eb1ng|l\u00e0)\s+(?:v\u00e0|;|,|\.)(?:$|[^a-z0-9À-ỹ])/i.test(originalLower);
const r4_part1_safe = /\b(?:biet|bang|la)\s+(?:va|;|,|\.)\b/.test(text);
const r4_part2_safe = !/(?:^|[^a-z0-9À-ỹ])(?:l\u00e1|la)\s+v\u00e0(?:$|[^a-z0-9À-ỹ])/i.test(originalLower);

console.log('r3_safe:', r3_safe);
console.log('r4_part1_safe:', r4_part1_safe);
console.log('r4_part2_safe:', r4_part2_safe);
console.log('hasBlankVerbOrConjunction (safe):', r3_safe || (r4_part1_safe && r4_part2_safe));
