export type Math6GeometryFigureKind =
  | 'opposite_rays'
  | 'collinear_segments'
  | 'ray_points'
  | 'angle'
  | 'angle_bisector'
  | 'triangle_points'
  | 'intersecting_lines'
  | 'generic_points_lines';

export interface Math6GeneratedFigure {
  kind: Math6GeometryFigureKind;
  confidence: number;
  svg: string;
  description: string;
  labels: string[];
}

export function generateMath6GeometryFigure(prompt: string, topicId = ''): Math6GeneratedFigure | undefined {
  const text = normalize(prompt);
  const geometryTopic = topicId.includes('geometry') || /(?:goc|tia|diem|duong thang|doan thang|trung diem|thang hang)/.test(text);
  if (!geometryTopic) return undefined;

  const oppositeRays = generateOppositeRays(prompt, text);
  if (oppositeRays) return oppositeRays;

  const rayPoints = generateRayPoints(prompt, text);
  if (rayPoints) return rayPoints;

  const collinear = generateCollinearSegments(prompt, text);
  if (collinear) return collinear;

  const angle = generateAngle(prompt, text);
  if (angle) return angle;

  const triangle = generateTrianglePoints(prompt, text);
  if (triangle) return triangle;

  const intersecting = generateIntersectingLines(prompt, text);
  if (intersecting) return intersecting;

  if (/ve hinh|duong thang|tia|doan thang|diem/.test(text)) {
    return genericPointsLinesFigure();
  }

  return undefined;
}

export function needsOriginalGeometryImage(prompt: string): boolean {
  const text = normalize(prompt);
  if (/ve hinh theo cach dien dat/.test(text)) return false;
  return /\bhinh\s+(?:ve|\d|ben|sau|duoi|tren)\b/.test(text)
    || /\b(?:cho|ve|theo)\s+hinh\b/.test(text)
    || /\bbang\s+o\b/.test(text);
}

function generateOppositeRays(prompt: string, text: string): Math6GeneratedFigure | undefined {
  if (!/(?:duong thang xy|hai tia doi nhau|tia ox.*tia oy|tia oy.*tia ox)/.test(text)) return undefined;
  if (!/(?:diem o|goc o|\bo\b)/.test(text)) return undefined;

  return {
    kind: 'opposite_rays',
    confidence: 0.88,
    labels: ['x', 'N', 'O', 'M', 'y'],
    description: 'Duong thang xy voi hai tia doi nhau Ox va Oy, cac diem nam tren hai tia.',
    svg: svgFrame(`
      <line x1="34" y1="105" x2="286" y2="105" stroke="#0f172a" stroke-width="2.5" marker-start="url(#arrow)" marker-end="url(#arrow)" />
      ${point(150, 105, 'O', -8, -14)}
      ${point(92, 105, 'N', -8, 22)}
      ${point(218, 105, 'M', -8, 22)}
      ${label(42, 92, 'x')}
      ${label(274, 92, 'y')}
      ${caption(prompt)}
    `),
  };
}

function generateRayPoints(prompt: string, text: string): Math6GeneratedFigure | undefined {
  const oa = findLength(text, 'oa');
  const ob = findLength(text, 'ob');
  if (!(oa && ob) && !/(?:tren tia ox|thuoc tia ox|tia ox)/.test(text)) return undefined;
  if (!/(?:diem a|diem b|oa|ob)/.test(text)) return undefined;

  const aX = oa && ob && ob > oa ? 90 + (oa / ob) * 170 : 150;
  const bX = 260;
  return {
    kind: 'ray_points',
    confidence: oa && ob ? 0.9 : 0.76,
    labels: ['O', 'A', 'B', 'x'],
    description: 'Tia Ox voi cac diem A, B nam tren tia.',
    svg: svgFrame(`
      <line x1="54" y1="105" x2="286" y2="105" stroke="#0f172a" stroke-width="2.5" marker-end="url(#arrow)" />
      ${point(62, 105, 'O', -8, -14)}
      ${point(aX, 105, 'A', -8, 22)}
      ${point(bX, 105, 'B', -8, 22)}
      ${label(276, 92, 'x')}
      ${oa ? measure(62, 128, aX, 128, `OA=${oa}`) : ''}
      ${ob ? measure(62, 150, bX, 150, `OB=${ob}`) : ''}
      ${caption(prompt)}
    `),
  };
}

function generateCollinearSegments(prompt: string, text: string): Math6GeneratedFigure | undefined {
  const ab = findLength(text, 'ab');
  const bc = findLength(text, 'bc');
  const ac = findLength(text, 'ac');
  if (!/(?:thang hang|nam giua|trung diem)/.test(text) && !(ab && bc && ac)) return undefined;
  if (!/(?:diem a|ab|bc|ac)/.test(text)) return undefined;

  const aX = 56;
  const bX = ab && bc ? 56 + (ab / (ab + bc)) * 210 : 145;
  const cX = 266;
  return {
    kind: 'collinear_segments',
    confidence: ab && bc ? 0.92 : 0.78,
    labels: ['A', 'B', 'C'],
    description: 'Ba diem A, B, C thang hang, B nam giua A va C.',
    svg: svgFrame(`
      <line x1="42" y1="105" x2="282" y2="105" stroke="#0f172a" stroke-width="2.5" />
      ${point(aX, 105, 'A', -8, -14)}
      ${point(bX, 105, 'B', -8, -14)}
      ${point(cX, 105, 'C', -8, -14)}
      ${ab ? measure(aX, 132, bX, 132, `AB=${ab}`) : ''}
      ${bc ? measure(bX, 154, cX, 154, `BC=${bc}`) : ''}
      ${ac ? measure(aX, 176, cX, 176, `AC=${ac}`) : ''}
      ${caption(prompt)}
    `),
  };
}

function generateAngle(prompt: string, text: string): Math6GeneratedFigure | undefined {
  if (!hasStrongAngleCue(text)) return undefined;
  const hasBisector = /(?:phan giac|om|ot)/.test(text);
  const angleValues = [...text.matchAll(/(\d{2,3})\s*(?:do|0|\u00b0)/g)].map((match) => Number(match[1])).filter((value) => value > 0 && value <= 180);
  const angle = angleValues[0] || 70;
  const outer = Math.min(Math.max(angle, 40), 140);
  const lower = polar(152, 120, 92, 0);
  const upper = polar(152, 120, 92, -outer);
  const mid = polar(152, 120, 78, -outer / 2);

  return {
    kind: hasBisector ? 'angle_bisector' : 'angle',
    confidence: angleValues.length ? 0.86 : 0.72,
    labels: hasBisector ? ['O', 'x', 'y', 't'] : ['O', 'x', 'y'],
    description: hasBisector ? 'Goc xOy va tia phan giac ben trong goc.' : 'Goc xOy tao boi hai tia Ox va Oy.',
    svg: svgFrame(`
      <line x1="152" y1="120" x2="${lower.x}" y2="${lower.y}" stroke="#0f172a" stroke-width="2.5" marker-end="url(#arrow)" />
      <line x1="152" y1="120" x2="${upper.x}" y2="${upper.y}" stroke="#0f172a" stroke-width="2.5" marker-end="url(#arrow)" />
      ${hasBisector ? `<line x1="152" y1="120" x2="${mid.x}" y2="${mid.y}" stroke="#10b981" stroke-width="2.2" stroke-dasharray="6 5" marker-end="url(#arrowGreen)" />` : ''}
      <path d="M 185 120 A 33 33 0 0 0 ${polar(152, 120, 33, -outer).x} ${polar(152, 120, 33, -outer).y}" fill="none" stroke="#64748b" stroke-width="1.8" />
      ${point(152, 120, 'O', -12, 22)}
      ${label(lower.x + 4, lower.y + 4, 'x')}
      ${label(upper.x - 12, upper.y - 8, 'y')}
      ${hasBisector ? label(mid.x + 2, mid.y - 4, 't') : ''}
      ${label(184, 92, `${angleValues[0] ? angleValues[0] : '?'}\u00b0`)}
      ${caption(prompt)}
    `),
  };
}

function hasStrongAngleCue(text: string): boolean {
  return /\b(?:tia\s+phan\s+giac|phan\s+giac|ke\s+bu|so\s+do\s+goc|nua\s+mat\s+phang|goc\s+[a-z]{2,4}|goc\s+[a-z]\s+(?:vuong|nhon|tu|bet))\b/.test(text);
}

function generateTrianglePoints(prompt: string, text: string): Math6GeneratedFigure | undefined {
  if (!/(?:khong thang hang|tam giac|ba diem a.*b.*c|ba diem m.*n.*p)/.test(text)) return undefined;
  const labels = /m.*n.*p/.test(text) ? ['M', 'N', 'P'] : ['A', 'B', 'C'];
  return {
    kind: 'triangle_points',
    confidence: 0.74,
    labels,
    description: 'Ba diem khong thang hang, co the noi thanh cac doan thang hoac tia theo de.',
    svg: svgFrame(`
      ${point(70, 145, labels[0], -8, 22)}
      ${point(245, 145, labels[1], -8, 22)}
      ${point(145, 55, labels[2], -8, -14)}
      <line x1="70" y1="145" x2="245" y2="145" stroke="#0f172a" stroke-width="2.2" />
      <line x1="70" y1="145" x2="145" y2="55" stroke="#0f172a" stroke-width="2.2" />
      <line x1="145" y1="55" x2="245" y2="145" stroke="#0f172a" stroke-width="2.2" stroke-dasharray="5 5" />
      ${caption(prompt)}
    `),
  };
}

function generateIntersectingLines(prompt: string, text: string): Math6GeneratedFigure | undefined {
  if (!/(?:cat duong thang|cat.*tai|di qua diem|cung di qua)/.test(text)) return undefined;
  return {
    kind: 'intersecting_lines',
    confidence: 0.7,
    labels: ['O', 'a', 'b', 'm'],
    description: 'Cac duong thang cat nhau tai cac diem theo mo ta cua de.',
    svg: svgFrame(`
      <line x1="40" y1="112" x2="280" y2="112" stroke="#0f172a" stroke-width="2" />
      <line x1="72" y1="178" x2="236" y2="36" stroke="#0f172a" stroke-width="2" />
      <line x1="92" y1="35" x2="250" y2="178" stroke="#0f172a" stroke-width="2" />
      ${point(154, 112, 'O', 8, -12)}
      ${label(260, 100, 'm')}
      ${label(220, 48, 'a')}
      ${label(236, 166, 'b')}
      ${caption(prompt)}
    `),
  };
}

function genericPointsLinesFigure(): Math6GeneratedFigure {
  return {
    kind: 'generic_points_lines',
    confidence: 0.58,
    labels: ['A', 'B', 'C', 'd'],
    description: 'Hinh minh hoa tong quat cho diem, duong thang, tia va doan thang.',
    svg: svgFrame(`
      <line x1="44" y1="112" x2="278" y2="112" stroke="#0f172a" stroke-width="2.3" marker-end="url(#arrow)" />
      ${point(82, 112, 'A', -8, -14)}
      ${point(156, 112, 'B', -8, -14)}
      ${point(232, 112, 'C', -8, -14)}
      ${label(266, 100, 'd')}
    `),
  };
}

function svgFrame(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 210" role="img" aria-label="Hinh minh hoa Toan 6">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="#0f172a"/></marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L7,3 z" fill="#10b981"/></marker>
  </defs>
  <rect x="8" y="8" width="304" height="194" rx="8" fill="#f8fafc" stroke="#cbd5e1" />
  ${inner}
</svg>`;
}

function point(x: number, y: number, name: string, dx: number, dy: number): string {
  return `<circle cx="${round(x)}" cy="${round(y)}" r="4.5" fill="#0f172a" />${label(x + dx, y + dy, name)}`;
}

function label(x: number, y: number, value: string): string {
  return `<text x="${round(x)}" y="${round(y)}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700" fill="#0f172a">${escapeXml(value)}</text>`;
}

function caption(prompt: string): string {
  const text = prompt.length > 95 ? `${prompt.slice(0, 92)}...` : prompt;
  return `<text x="18" y="196" font-family="Inter, Arial, sans-serif" font-size="9.5" fill="#64748b">${escapeXml(text)}</text>`;
}

function measure(x1: number, y1: number, x2: number, y2: number, text: string): string {
  const mid = (x1 + x2) / 2;
  return `<line x1="${round(x1)}" y1="${round(y1)}" x2="${round(x2)}" y2="${round(y2)}" stroke="#94a3b8" stroke-width="1.3" />
    <line x1="${round(x1)}" y1="${round(y1 - 5)}" x2="${round(x1)}" y2="${round(y1 + 5)}" stroke="#94a3b8" stroke-width="1.3" />
    <line x1="${round(x2)}" y1="${round(y2 - 5)}" x2="${round(x2)}" y2="${round(y2 + 5)}" stroke="#94a3b8" stroke-width="1.3" />
    <text x="${round(mid - 18)}" y="${round(y1 - 4)}" font-family="Inter, Arial, sans-serif" font-size="11" fill="#475569">${escapeXml(text)}</text>`;
}

function findLength(text: string, segment: string): number | undefined {
  const match = text.match(new RegExp(`${segment}\\s*=\\s*(\\d+(?:[,.]\\d+)?)\\s*(?:cm)?`, 'i'));
  if (!match) return undefined;
  return Number(match[1].replace(',', '.'));
}

function polar(cx: number, cy: number, radius: number, degree: number): { x: number; y: number } {
  const radian = (degree * Math.PI) / 180;
  return { x: round(cx + Math.cos(radian) * radius), y: round(cy + Math.sin(radian) * radius) };
}

function normalize(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase();
}

function escapeXml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
