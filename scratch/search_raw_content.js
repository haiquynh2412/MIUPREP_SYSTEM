const fs = require('fs');
const path = require('path');

function inspectRawSource(grade, fileName) {
  const rawPath = path.resolve(__dirname, `../reports/content-quality/math${grade}-rich-raw-extract.json`);
  if (!fs.existsSync(rawPath)) {
    console.log(`Raw extract not found for Grade ${grade}`);
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const sources = rawData.sources || rawData;
  if (!Array.isArray(sources)) {
    console.log(`Sources is not an array for Grade ${grade}`);
    return;
  }
  
  const src = sources.find(s => (s.relativePath || s.fileName).includes(fileName));
  if (!src) {
    console.log(`Source containing [${fileName}] not found for Grade ${grade}`);
    return;
  }
  
  const text = src.text || '';
  console.log(`\n================ INSPECTING RAW SOURCE FOR GRADE ${grade}: ${fileName} (Length: ${text.length} chars) ================`);
  
  // Look for solution/answer markers
  const keywords = [
    'hướng dẫn giải', 'huong dan giai',
    'đáp án', 'dap an',
    'đáp số', 'dap so',
    'lời giải', 'loi giai',
    'bài giải', 'bai giai',
    'kết quả', 'ket qua'
  ];
  
  keywords.forEach(kw => {
    const regex = new RegExp(kw, 'gi');
    const matches = [...text.matchAll(regex)];
    if (matches.length > 0) {
      console.log(`- Keyword "${kw}": found ${matches.length} occurrences. First few indexes: ${matches.slice(0, 5).map(m => m.index).join(', ')}`);
    } else {
      console.log(`- Keyword "${kw}": not found`);
    }
  });
  
  // Print a sample around one of the matches if found
  const matchIndex = text.toLowerCase().indexOf('hướng dẫn giải') !== -1 ? text.toLowerCase().indexOf('hướng dẫn giải') : text.toLowerCase().indexOf('đáp án');
  if (matchIndex !== -1) {
    console.log(`\nSample around index ${matchIndex}:`);
    console.log(text.slice(Math.max(0, matchIndex - 100), Math.min(text.length, matchIndex + 500)));
  } else {
    console.log('\nNo solution marker matches found. Printing end of file (last 500 chars):');
    console.log(text.slice(Math.max(0, text.length - 500)));
  }
}

inspectRawSource(8, 'CHƯƠNG 2. HẰNG ĐẲNG THỨC.docx');
inspectRawSource(8, 'CHƯƠNG 4. ĐỊNH LÍ TA LÉT.docx');
inspectRawSource(8, 'CHƯƠNG 5. DỮ LIỆU VÀ BIỂU ĐỒ.docx');
inspectRawSource(7, '8-chuyen-de-boi-duong-hoc-sinh-gioi-mon-toan-7-phan-dai-so.pdf');
