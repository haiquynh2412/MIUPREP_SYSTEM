import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

toan7 = r"C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 7"
files = os.listdir(toan7)

print("DOCX Files in toan 7:")
for f in sorted(files):
    if f.lower().endswith(".docx"):
        # Print filename and its repr to see raw char codes
        print(f"{f} -> repr: {repr(f)}")
