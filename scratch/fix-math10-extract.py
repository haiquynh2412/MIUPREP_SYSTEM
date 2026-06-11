import json
import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

workspace_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw_extract_path = os.path.join(workspace_root, "reports", "content-quality", "math10-rich-raw-extract.json")

with open(raw_extract_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

print(f"Loaded raw extract. Total sources: {len(raw_data['sources'])}")

# Control and page break characters regex
CONTROL_RE = re.compile(r'[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd]')

def clean_text(text, rel_path):
    # 1. Clean control characters
    cleaned = CONTROL_RE.sub(' ', text)
    
    # 2. Clean OLE markers
    cleaned = cleaned.replace('\u0001', ' ').replace('\u0002', ' ')
    
    # 3. Handle specific files
    rel_path_lower = rel_path.lower()
    
    # General TCVN3 cleanup for Le Ba Bao files & general review files
    is_le_ba_bao = "le-ba-bao" in rel_path_lower or "le_ba_bao" in rel_path_lower or "bo-de-on-tap" in rel_path_lower or "chuyen-de-bpt" in rel_path_lower or "dang-viet-dong" in rel_path_lower
    
    if is_le_ba_bao:
        tcvn_replacements = {
            'Líp': 'Lớp',
            'thÇy': 'thầy',
            'L£': 'LÊ',
            'B¸': 'BÁ',
            'B¶o': 'Bảo',
            'NguyÔn': 'Nguyễn',
            'Lé': 'Lộ',
            'Tr¹ch': 'Trạch',
            'HuÕ': 'Huế',
            'TR¾C': 'TRẮC',
            'NGHIÖM': 'NGHIỆM',
            'CHUY£N': 'CHUYÊN',
            '§Ò': 'ĐỀ',
            'M«n': 'Môn',
            'To¸n': 'Toán',
            'S§T': 'SĐT',
            'Lª': 'Lê',
            'TR¾C NGHIÖM': 'TRẮC NGHIỆM',
            'CHUY£N §Ò': 'CHUYÊN ĐỀ',
            'biễu diễn': 'biểu diễn',
            'biÕt': 'biết',
            'm)n': 'mãn',
            'thỏa m)n': 'thỏa mãn',
        }
        for k, v in tcvn_replacements.items():
            cleaned = cleaned.replace(k, v)
            
    # For D10_C5_THONG KE.pdf
    if "thong ke" in rel_path_lower or "thong_ke" in rel_path_lower:
        thong_ke_reps = {
            'C©u': 'Câu',
            'Thèng': 'Thống',
            'kª': 'kê',
            'm«n': 'môn',
            'to¸n': 'toán',
            'kú': 'kỳ',
            'cña': 'của',
            'häc': 'học',
            'Ngêi': 'Người',
            'tÇn': 'tần',
            'suÊt': 'suất',
            'gi¸': 'giá',
            'trÞ': 'trị',
            'nhiªu': 'nhiêu',
            'biÕt': 'biết',
            '®iÓm': 'điểm',
            'sè': 'số',
            'thùc': 'thực',
            'tÇn suÊt': 'tần suất',
            'gi¸ trÞ': 'giá trị',
            'vÒ': 'về',
            'mét': 'một',
            'k×': 'kỳ',
            'Ng­êi': 'Người',
            'thÊy': 'thấy',
            'cã': 'có',
            'bµi': 'bài',
            '®­îc': 'được',
            'Hái': 'Hỏi',
            'lµ': 'là',
            '®­îc': 'được',
            'líp': 'lớp',
        }
        for k, v in thong_ke_reps.items():
            cleaned = cleaned.replace(k, v)
            
    # For Le Quang Xe files (containing latex bracket issues)
    # CRITICAL: We only apply bracket replacements to actual Le Quang Xe files to avoid corrupting other files.
    is_le_quang_xe = "le-quang-xe" in rel_path_lower or "le_quang_xe" in rel_path_lower
    if is_le_quang_xe:
        # Standard replacements
        replacements = {
            '¶': '{',
            '©': '}',
            '®': 'R',
            'ß': '{',
            '™': '}',
            'Ä': '(',
            'ä': ')',
            'Ç': '(',
            'å': ')',
            'ñ': '[',
            'ï': '[',
            'ã': ')',
            'Å': '(',
            'ò': ']',
            'ö': '(',
            'ü': ')'
        }
        for k, v in replacements.items():
            cleaned = cleaned.replace(k, v)
            
        # Context-aware replacement of 'ô' when used as a bracket (ONLY after digits, infinity, plus, minus, space, square root)
        # Never after letters (like m in môn, kh in không)
        cleaned = re.sub(r'([0-9\+−∞√\s]+)ô(?=\s|[\.\,\)\}\]\|\n]|$)', r'\1]', cleaned)
        cleaned = re.sub(r';\s*ô', '; ]', cleaned)
        cleaned = re.sub(r'([0-9\+−∞√]+)ô', r'\1]', cleaned)
        
        # Restore any broken Vietnamese words containing 'ô' that might have been corrupted by previous runs
        cleaned = cleaned.replace('m]n', 'môn').replace('kh]ng', 'không').replace('h]p', 'hộp')

    # General cleanup for chapter 1 files with Syriac symbols & mojibake
    if "menh de va tap hop" in rel_path_lower or "menh_de_va_tap_hop" in rel_path_lower:
        syriac_reps = {
            'ܧ': 'A',
            'CN': 'A',
            'CN': 'A',
            'ܣ': 'A',
            'ܤ': 'B',
            '݊': 'n',
            '': '•',
            'm]n': 'môn',
            'kh]ng': 'không',
            'c]n': 'còn',
            'đ) học': 'đã học',
            'H)y': 'Hãy',
            'cuả': 'của',
            'tâp': 'tập',
            'hơp': 'hợp',
            'Giải thướngh': 'Giải thích',
            'v] hạn': 'vô hạn',
            'v] tỉ': 'vô tỉ',
            'vµ': 'và',
            'hoÆc': 'hoặc',
            'thỏa m)n': 'thỏa mãn',
            'đ) cho': 'đã cho',
            'lµ': 'là',
            '­íc': 'ước',
            'c[a': 'của',
            'H)y': 'Hãy',
            'ñ': 'n', # ñ represents 'n' in this specific file
            '×': '*', # Replace legacy multiply sign to avoid false positive
        }
        for k, v in syriac_reps.items():
            cleaned = cleaned.replace(k, v)
            
    # Standard TCVN3 legacy font cleanups in general math files
    if "menh de" in rel_path_lower or "menh_de" in rel_path_lower:
        tcvn_replacements = {
            'cã': 'có',
            'nghiÖm': 'nghiệm',
            'ph©n': 'phân',
            'biÖt': 'biệt',
            'híng': 'hướng',
            'híc': 'hướng'
        }
        for k, v in tcvn_replacements.items():
            cleaned = cleaned.replace(k, v)
            
    # Restore any broken Vietnamese words corrupted by bracket replacements
    restorations = {
        'tr]n': 'tròn',
        'h]a': 'hòa',
        'c]n': 'còn',
        'd]ng': 'dòng',
        'l]ng': 'lòng',
        'v]ng': 'vòng',
        'nh)n': 'nhãn',
        'h)ng': 'hãng',
        'm)ng': 'mãng',
        'mu)c': 'mục',
        'lu)c': 'lục',
        'h)y': 'hãy',
        'trảl)i': 'trả lãi',
        'l)i': 'lãi',
        'm)n': 'mãn',
        'm]n': 'môn',
        'kh]ng': 'không',
        'h]p': 'hộp',
        'X) Hội': 'Xã hội',
        'x) hội': 'xã hội',
        'v] hạn': 'vô hạn',
        'v] tỉ': 'vô tỉ',
        'v] cùng': 'vô cùng',
        'xe ] tô': 'xe ô tô',
        '] tô': 'ô tô',
        'Mu)c lu)c': 'Mục lục',
        'đ) cho': 'đã cho',
        'đ) học': 'đã học',
        'đ) vay': 'đã vay',
        'đ) bán': 'đã bán',
        'đ) biết': 'đã biết',
        'đ) có': 'đã có',
        'đ) gặp': 'đã gặp',
        'đ) ': 'đã ',
        'C]n': 'Còn',
        'D]ng': 'Dòng',
        'L]ng': 'Lòng',
        'V]ng': 'Vòng',
        'Nh)n': 'Nhãn',
        'H)ng': 'Hãng',
        'M)ng': 'Mãng',
        'Mu)c': 'Mục',
        'H)y': 'Hãy',
        'L)i': 'Lại', # wait, 'L)i suất' is 'Lãi suất', so 'L)i' -> 'Lãi' (for L)i suất)
        'L)i suất': 'Lãi suất',
        'L)i': 'Lãi',
        'M)n': 'Mãn',
        'M]n': 'Môn',
        'Kh]ng': 'Không',
        'H]p': 'Hộp',
        'Tr]n': 'Tròn',
        'H]a': 'Hòa'
    }
    for k, v in restorations.items():
        cleaned = cleaned.replace(k, v)
            
    return cleaned

fixed_count = 0
for src in raw_data["sources"]:
    rel_path = src["relativePath"] or src["fileName"]
    old_text = src["text"]
    new_text = clean_text(old_text, rel_path)
    
    if old_text != new_text:
        src["text"] = new_text
        fixed_count += 1

print(f"Cleaned and fixed {fixed_count} source files in memory.")

# Write back to file
with open(raw_extract_path, "w", encoding="utf-8") as f:
    json.dump(raw_data, f, ensure_ascii=False, indent=2)

print("Saved updated raw extract.")
