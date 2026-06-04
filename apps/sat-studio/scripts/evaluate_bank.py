import json
import os

banks = [
    'antigravity-bank.json',
    'opensat-pinesat.json',
    'archive-source-ai-bank.json',
    'sat-1590-elite-ai-bank.json',
    'sat-king-supplemental-ai-bank.json',
    'kaplan-sat-math-ai-bank.json',
    'private-vault-archive-bank.json',
    'sat-studio-foundation-bank.json'
]

stats = {
    'total': 0,
    'sections': {'Math': 0, 'Reading and Writing': 0},
    'difficulties': {'Easy': 0, 'Medium': 0, 'Hard': 0},
    'skills': {},
    'banks': {}
}

for b in banks:
    filepath = os.path.join('data', b)
    if not os.path.exists(filepath):
        continue
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if isinstance(data, dict) and 'questions' in data:
            qs = data['questions']
        elif isinstance(data, list):
            qs = data
        else:
            qs = []
            
        stats['banks'][b] = len(qs)
        stats['total'] += len(qs)
        
        for q in qs:
            sec = q.get('section', 'Unknown')
            stats['sections'][sec] = stats['sections'].get(sec, 0) + 1
            
            diff = q.get('difficulty', 'Unknown')
            stats['difficulties'][diff] = stats['difficulties'].get(diff, 0) + 1
            
            skill = q.get('skill', 'Unknown')
            stats['skills'][skill] = stats['skills'].get(skill, 0) + 1
            
    except Exception as e:
        print(f'Error reading {b}: {e}')

print('--- AUDIT RESULTS ---')
print(f"Total: {stats['total']}")
print('By Bank:')
for k, v in stats['banks'].items():
    print(f'  {k}: {v}')
print('Sections:', stats['sections'])
print('Difficulties:', stats['difficulties'])
print('Skills:')
for k, v in sorted(stats['skills'].items(), key=lambda x: x[1], reverse=True):
    print(f'  {k}: {v}')
