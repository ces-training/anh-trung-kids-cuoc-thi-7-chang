#!/usr/bin/env node
/* Sinh cuoc-thi-mua-3/huong-dan-nop-bai.js: "Hướng dẫn quay clip · 2 cách" (như web cũ) cho từng buổi của web cuộc thi mùa 3 (25/11/2026).
   Chạy ở thư mục gốc kho:  node cuoc-thi-mua-3/cong-cu/tao_huong_dan_nop_bai.js
   lay_bai_tu_web_offline.py tự chạy lại tệp này sau khi lấy bài mới.

   - Câu con nói, pinyin và giọng mẫu lấy NGUYÊN từ dữ liệu bài (bai-ls/little-seed-data.js, bai-sd/seedling-data.js),
     không thêm chữ Trung mới. Lời ba mẹ chỉ bằng tiếng Việt.
   - Mỗi buổi 2 cách (dựng trong ol.js): Cách 1 Hỏi – đáp nhanh, Cách 2 Đóng vai cô giáo nhỏ. */
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '..');
const NGUON = { ls: 'bai-ls/little-seed-data.js', sd: 'bai-sd/seedling-data.js' };

function load(f) { const w = {}; new Function('window', fs.readFileSync(path.join(DIR, f), 'utf8'))(w); return w.SD; }
/* đường dẫn trong dữ liệu tính từ bai-xx/index.html (../../…) → tính từ cuoc-thi-mua-3/index.html (../…) */
function aPath(a) { if (!a || typeof a !== 'string') return ''; const p = a.replace(/^\.\.\/\.\.\//, '../');
  return fs.existsSync(path.join(DIR, p)) ? p : ''; }
const HZ = /[㐀-鿿]/;
const sach = s => String(s || '').replace(/\s+/g, ' ').trim();
const khoa = s => sach(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/* gom mọi cặp câu Anh – Trung có trong một buổi (thẻ, truyện, nói, vè…), nhớ bước chứa câu */
const BUOC_NOI = new Set(['truyen', 'noi', 'pdn', 'bb', 've', 'vek']);   // câu con nói thành câu, ưu tiên hơn thẻ từ
function capCau(d) {
  const out = new Map(); let thuTu = 0;
  const them = (en, zh, py, ae, az, loai) => { en = sach(en); zh = sach(zh); if (!en || !zh || !HZ.test(zh) || HZ.test(en) || en.includes('…')) return;
    const k = khoa(en); if (!k) return;
    const x = { en: en[0].toUpperCase() + en.slice(1), zh, py: sach(py), ae: aPath(ae), az: aPath(az), noi: BUOC_NOI.has(loai), i: thuTu++ };
    const cu = out.get(k); if (!cu || diemRieng(x) > diemRieng(cu)) out.set(k, cu ? Object.assign(x, { i: cu.i }) : x); };
  const walk = (o, loai) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(x => walk(x, loai));
    if (typeof o.en === 'string' && typeof o.zh === 'string') them(o.en, o.zh, o.py, o.a_en, o.a_zh, loai);
    /* bước "nói": câu Anh và câu Trung nằm ở hai lượt liền nhau */
    if (Array.isArray(o.turns)) for (let i = 0; i + 1 < o.turns.length; i++) {
      const a = ((o.turns[i].say || [])[0]) || {}, b = ((o.turns[i + 1].say || [])[0]) || {};
      if (a.l === 'en' && b.l === 'zh') them(a.t, b.t, b.py, a.a, b.a, loai); }
    for (const k in o) if (k !== 'turns') walk(o[k], loai); };
  (d.steps || []).forEach(st => walk(st, st.type));
  return [...out.values()];
}
function diemRieng(x) { const w = x.en.split(' ').length;
  return (/[!?.]$/.test(x.en) ? 20 : 0) + (w >= 2 && w <= 8 ? 10 : 0) - (w > 10 ? 15 : 0) + (x.noi ? 5 : 0) + (x.py ? 2 : 0) + (x.ae ? 1 : 0) + (x.az ? 1 : 0); }
/* chọn 1–2 câu: câu trùng tên bài trước, rồi câu con nói trọn câu, vừa độ dài */
function chon(d, ds) {
  const m = /^(.+?)\s+–\s+(.*[\u3400-\u9fff].*)$/.exec(d.t || ''), tk = m ? khoa(m[1]) : '';
  const xs = ds.map(x => ({ x, s: (tk && khoa(x.en) === tk ? 100 : 0) + diemRieng(x) })).sort((a, b) => b.s - a.s || a.x.i - b.x.i).map(o => o.x);
  if (!xs.length && m) return [{ en: sach(m[1]), zh: sach(m[2]), py: '', ae: '', az: '' }];
  return xs.slice(0, 2);
}
/* tên chủ đề: bỏ "Phần N:" đầu và "· tuần …" cuối */
const chuDe = d => sach(d.goal || d.t).replace(/^Phần\s*\d+\s*:\s*/i, '').replace(/\s*·\s*tuần.*$/i, '');
/* chỉ lưu chủ đề và câu (kèm pinyin, giọng mẫu); 2 kịch bản quay dựng lúc chạy trong ol.js (nopBaiCach) cho tệp nhẹ */
function huongDan(d) {
  const say = chon(d, capCau(d)); if (!say.length) return null;
  return { topic: chuDe(d), say: say.map(x => { const p = [x.en, x.zh, x.py, x.ae, x.az]; while (p.length && !p[p.length - 1]) p.pop(); return p; }) };
}

const out = {};
let n = 0, thieu = [];
for (const [src, f] of Object.entries(NGUON)) {
  const SD = load(f); out[src] = {};
  for (const [k, d] of Object.entries(SD.days || {})) { const h = huongDan(d); if (h) { out[src][k] = h; n++; } else thieu.push(src + '-' + k); }
}
const file = path.join(DIR, 'huong-dan-nop-bai.js');
fs.writeFileSync(file, '/* Sinh tự động bằng cong-cu/tao_huong_dan_nop_bai.js từ dữ liệu bài (bai-ls, bai-sd). Đừng sửa tay. */\n'
  + 'window.NOP_BAI=' + JSON.stringify(out) + ';\n');
console.log('huong-dan-nop-bai.js:', n, 'buổi có hướng dẫn quay clip' + (thieu.length ? '; không tìm được câu: ' + thieu.join(', ') : ''));
