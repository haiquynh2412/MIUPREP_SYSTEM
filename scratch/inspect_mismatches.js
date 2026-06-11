const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = 'C:/Users/HAIQUYNH/OneDrive/CODE AI/MIUPREP_SYSTEM';

const idsToInspect = [
  // Grade 1
  { grade: 1, id: 'math1.number_ops_10.13_de_thi_toan_lop_1_hk1_2010_.1608alg.039' },
  { grade: 1, id: 'math1.number_ops_10.de_on_tap_toan_hoc_ki2_lop_1_1.1d4gat0.058' },
  { grade: 1, id: 'math1.number_ops_10.de_on_tap_toan_hoc_ki2_lop_1_1.1d4gat0.077' },
  { grade: 1, id: 'math1.number_ops_10.de_on_tap_toan_hoc_ki2_lop_1_1.1d4gat0.084' },
  // Grade 2
  { grade: 2, id: 'math2.number_mul_div.bo_de_kiem_tra_hoc_ki_1_mon_to.0nu23g2.219' },
  { grade: 2, id: 'math2.number_mul_div.de_kiem_tra_cuoi_ki_1_mon_toan.0xkqpd9.008' },
  { grade: 2, id: 'math2.number_mul_div.toan_lop_2_30_de_thi_hsg_lop2_.05wyzzj.096' },
  { grade: 2, id: 'math2.number_mul_div.toan_lop_2_de_kiem_tra_hoc_ky_.00p09gi.006' },
  { grade: 2, id: 'math2.number_mul_div.toan_lop_2_tuyen_tap_de_kiem_t.10t25wn.020' },
  { grade: 2, id: 'math2.number_mul_div.toan_lop_2_tuyen_tap_de_kiem_t.10t25wn.030' },
  // Grade 3
  { grade: 3, id: 'math3.number_mul_div_table.de_kiem_tra_hk_i_doc.1t0idr9.008' },
  { grade: 3, id: 'math3.number_mul_div_table.de_kiem_tra_hk_i_doc.1t0idr9.018' },
  { grade: 3, id: 'math3.geometry_midpoint_perimeter_area.tuyen_tap_de_kiem_tra_giua_hoc.1kd4s42.074' },
  { grade: 3, id: 'math3.geometry_midpoint_perimeter_area.tuyen_tap_de_kiem_tra_giua_hoc.1kd4s42.158' }
];

let output = '';

idsToInspect.forEach(({ grade, id }) => {
  const filePath = path.resolve(workspaceRoot, `reports/content-quality/math${grade}-display-ready-preview.json`);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const item = data.items.find(it => it.id === id);

  if (item) {
    output += `\n==================================================\n`;
    output += `ID: ${item.id}\n`;
    output += `Source File: ${item.metadata?.sourceFile}\n`;
    output += `--------------------------------------------------\n`;
    output += `PROMPT:\n${item.prompt}\n`;
    output += `--------------------------------------------------\n`;
    output += `CORRECT ANSWER: "${item.correctAnswer}"\n`;
    output += `--------------------------------------------------\n`;
    output += `EXPLANATION:\n${item.explanation}\n`;
    output += `==================================================\n`;
  } else {
    output += `Item not found: ${id}\n`;
  }
});

fs.writeFileSync(path.resolve(workspaceRoot, 'scratch/inspect_mismatches_output.txt'), output, 'utf8');
console.log('Inspection complete.');
