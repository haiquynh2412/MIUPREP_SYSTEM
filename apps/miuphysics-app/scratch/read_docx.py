import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def read_docx(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} does not exist.")
        return ""
    
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for p in root.findall('.//w:p', namespaces):
                texts = [t.text for t in p.findall('.//w:t', namespaces) if t.text]
                if texts:
                    paragraphs.append("".join(texts))
            
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading docx: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python read_docx.py <path_to_docx> <path_to_output_txt>")
    else:
        path = sys.argv[1]
        out_path = sys.argv[2]
        text = read_docx(path)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Successfully wrote parsed docx text to {out_path}")
