import requests
import random
import re

class ReadingSeedFetcher:
    def __init__(self):
        # Gutendex is a free REST API for Project Gutenberg
        self.api_url = "https://gutendex.com/books"
        
    def fetch_literature_seed(self):
        print("Đang tìm một tác phẩm văn học ngẫu nhiên từ Project Gutenberg...")
        # Lấy ngẫu nhiên các sách phổ biến (ví dụ Jane Austen, Dickens)
        response = requests.get(f"{self.api_url}?sort=popular")
        if response.status_code != 200:
            return None
            
        books = response.json().get('results', [])
        if not books: return None
        
        # Chọn 1 sách có file text
        book = random.choice(books)
        text_url = None
        for fmt, url in book['formats'].items():
            if 'text/plain' in fmt:
                text_url = url
                break
                
        if not text_url:
            return None
            
        print(f"Đã chọn tác phẩm: {book['title']}. Đang tải văn bản...")
        text_response = requests.get(text_url)
        text = text_response.text
        
        # Lấy một đoạn văn ngẫu nhiên từ giữa cuốn sách (bỏ qua phần giới thiệu)
        start_idx = int(len(text) * 0.2)
        end_idx = int(len(text) * 0.8)
        search_area = text[start_idx:end_idx]
        
        # Cắt lấy một đoạn khoảng 100 - 150 từ (tương đương 1 đoạn văn SAT)
        paragraphs = search_area.split('\n\n')
        valid_paragraphs = [p.replace('\r', '').replace('\n', ' ') for p in paragraphs if 50 < len(p.split()) < 150]
        
        if valid_paragraphs:
            seed_text = random.choice(valid_paragraphs)
            return {
                "title": book['title'],
                "author": book['authors'][0]['name'] if book['authors'] else "Unknown",
                "text": seed_text.strip()
            }
        return None

if __name__ == "__main__":
    fetcher = ReadingSeedFetcher()
    seed = fetcher.fetch_literature_seed()
    if seed:
        print("\n--- KẾT QUẢ NGỮ LIỆU (SEED) ĐÃ TỰ ĐỘNG LẤY ---")
        print(f"Tác phẩm: {seed['title']}")
        print(f"Tác giả: {seed['author']}")
        print(f"Đoạn văn ({len(seed['text'].split())} từ):\n{seed['text']}")
