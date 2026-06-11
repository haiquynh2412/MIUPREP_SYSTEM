const fs = require('fs');
const path = require('path');

const rawPath = path.resolve(__dirname, '../reports/content-quality/math11-rich-raw-extract.json');
if (!fs.existsSync(rawPath)) {
  console.log("Extract file not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const sources = data.sources || [];

const PRIVATE_USE_MATH_GLYPHS = {
  '\uf020': ' ', '\uf022': '∀', '\uf023': '#', '\uf024': '∃', '\uf026': '∧', '\uf027': "'", '\uf028': '(', '\uf029': ')',
  '\uf02a': '*', '\uf02b': '+', '\uf02d': '-', '\uf02e': '.', '\uf02f': '/', '\uf030': '0', '\uf031': '1', '\uf032': '2',
  '\uf033': '3', '\uf034': '4', '\uf035': '5', '\uf036': '6', '\uf037': '7', '\uf038': '8', '\uf039': '9', '\uf03a': ':',
  '\uf03b': ';', '\uf03c': '<', '\uf03d': '=', '\uf03e': '>', '\uf040': '≈', '\uf041': 'A', '\uf042': 'B', '\uf044': 'Δ',
  '\uf046': '⇒', '\uf049': '∩', '\uf04d': '⋮', '\uf04e': 'ℕ', '\uf050': 'P', '\uf052': 'ℝ', '\uf055': '∪', '\uf057': 'Ω',
  '\uf05b': '[', '\uf05d': ']', '\uf05e': '⊥', '\uf061': 'α', '\uf062': 'β', '\uf067': 'γ', '\uf068': 'η', '\uf06c': 'λ',
  '\uf06f': '°', '\uf070': 'π', '\uf071': 'θ', '\uf072': 'ρ', '\uf073': 'σ', '\uf074': 'τ', '\uf077': 'ω', '\uf078': 'ξ',
  '\uf079': 'ψ', '\uf07b': '{', '\uf07c': '|', '\uf07d': '}', '\uf0a1': 'ℝ', '\uf0a2': 'ℤ', '\uf0a3': '≤', '\uf0a4': 'ℚ',
  '\uf0a5': 'ℕ', '\uf0a7': '∋', '\uf0ae': '→', '\uf0b0': '°', '\uf0b1': '±', '\uf0b2': '″', '\uf0b3': '≥', '\uf0b5': '∠',
  '\uf0b7': '•', '\uf0b9': '≠', '\uf0bb': '≈', '\uf0bc': '...', '\uf0be': '→', '\uf0c6': '∅', '\uf0c7': '∩', '\uf0c8': '∪',
  '\uf0cc': '⊂', '\uf0ce': '∈', '\uf0cf': '∉', '\uf0d0': '⊂', '\uf0d1': '⊃', '\uf0d2': '⊄', '\uf0d3': '⊅', '\uf0d6': '√',
  '\uf0d7': '·', '\uf0db': '⇔', '\uf0de': '⇒', '\uf0e6': '(', '\uf0e7': '(', '\uf0e8': '(', '\uf0e9': '[', '\uf0ea': '[',
  '\uf0eb': '[', '\uf0ec': '{', '\uf0ed': ';', '\uf0ee': '}', '\uf0ef': '|', '\uf0f6': ')', '\uf0f7': ')', '\uf0f8': ')',
  '\uf0f9': ']', '\uf0fa': ']', '\uf0fb': ']', '\uf0fc': '}', '\uf0fd': ';', '\uf0fe': '}', '\uf0ff': '|', '\uf8e7': '-',
  '\uf8e8': '(', '\uf8eb': '(', '\uf8ec': '(', '\uf8ed': '(', '\uf8ee': '[', '\uf8ef': '|', '\uf8f0': '[', '\uf8f1': '{',
  '\uf8f2': ';', '\uf8f3': '}', '\uf8f4': '|', '\uf8f6': ')', '\uf8f7': ')', '\uf8f8': ')', '\uf8f9': ']', '\uf8fa': ']',
  '\uf8fb': ']', '\uf8fc': '}', '\uf8fd': ';', '\uf8fe': '}',
};

const unmapped = {};
for (const src of sources) {
  const text = src.text || "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    if (code >= 0xf000 && code <= 0xf8ff) {
      if (!PRIVATE_USE_MATH_GLYPHS[char]) {
        unmapped[char] = (unmapped[char] || 0) + 1;
      }
    }
  }
}

console.log("Unmapped Private Use Glyphs found:");
const entries = Object.entries(unmapped).sort((a, b) => b[1] - a[1]);
for (const [char, count] of entries) {
  console.log(`Glyph \\u${char.charCodeAt(0).toString(16)} (count: ${count})`);
}
