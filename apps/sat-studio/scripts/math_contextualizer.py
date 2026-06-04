import random

class MathContextualizer:
    def __init__(self):
        self.themes = [
            {"subject": "Biology", "template": "A biologist is studying the growth of a {species} population..."},
            {"subject": "Economics", "template": "A store owner sells {product} for ${price}..."},
            {"subject": "Physics", "template": "An object is thrown upwards with an initial velocity of {velocity} m/s..."}
        ]
        
    def generate_linear_equation_seed(self):
        """
        Tự động sinh ra phương trình bậc nhất và bẫy lỗi
        """
        # Sinh ngẫu nhiên hệ số
        a = random.randint(2, 9)
        x_correct = random.randint(3, 12)
        b = random.randint(5, 20)
        c = a * x_correct + b
        
        # Bối cảnh toán học: ax + b = c
        math_logic = f"{a}x + {b} = {c}"
        
        # Giả lập lỗi sai để làm đáp án nhiễu
        distractor_sign_error = (c + b) / a  # Lỗi sai dấu (chuyển +b sang vế kia thành +b)
        distractor_operation = c - b - a     # Lỗi trừ hệ số thay vì chia
        distractor_incomplete = c - b        # Lỗi chưa chia cho a (mới làm 1 bước)
        
        # Chuyển lỗi thành text (định dạng float 2 chữ số thập phân nếu cần)
        def format_ans(ans):
            return f"{ans:.2f}".rstrip('0').rstrip('.') if isinstance(ans, float) else str(ans)
            
        seed = {
            "math_type": "Linear Equation",
            "equation": math_logic,
            "correct_answer": x_correct,
            "distractors": {
                "sign_error": format_ans(distractor_sign_error),
                "operation_error": format_ans(distractor_operation),
                "incomplete_step": format_ans(distractor_incomplete)
            },
            "context_theme": random.choice(self.themes)['subject']
        }
        return seed

if __name__ == "__main__":
    contextualizer = MathContextualizer()
    seed = contextualizer.generate_linear_equation_seed()
    print(f"--- MATH SEED GENERATED ---")
    print(f"Equation: {seed['equation']}")
    print(f"Correct Answer (x): {seed['correct_answer']}")
    print(f"Calculated Distractors:")
    for error_type, val in seed['distractors'].items():
        print(f" - {error_type}: {val}")
    print(f"Theme to weave: {seed['context_theme']}")
