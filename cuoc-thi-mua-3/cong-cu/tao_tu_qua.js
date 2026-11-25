/* Sinh qua-tu.js: thẻ từ (tranh, chữ, giọng) theo ngày web 1–99 của 2 khoá, lấy từ bài lớp offline đã chép vào bai-ls/, bai-sd/.
   Dùng cho trò Đố từ (thú cưng), Luyện chiêu và Rồng trùm (quái vật) trong Phòng đổi quà. Chạy: node cong-cu/tao_tu_qua.js */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
function load(f) { global.window = {}; delete require.cache[require.resolve(f)]; require(f); return window.SD; }
const fix = p => String(p || '').replace(/^\.\.\/\.\.\//, '../');   // đường dẫn tính từ bai-ls/ → tính từ cuoc-thi-mua-3/
function build(SD) {
  const out = {};
  Object.keys(SD.days).forEach(k => {
    const seen = {}, list = [];
    (SD.days[k].steps || []).forEach(s => (s.cards || []).forEach(c => {
      if (!c.en || !c.img || !c.a_en || seen[c.en]) return; seen[c.en] = 1;
      list.push([c.en, c.zh || '', c.py || '', fix(c.img), fix(c.a_en), fix(c.a_zh)]);
    }));
    if (list.length) out[k] = list;
  });
  return out;
}
const T = { seed: build(load(path.join(root, 'bai-ls/little-seed-data.js'))), canopy: build(load(path.join(root, 'bai-sd/seedling-data.js'))) };
const js = '/* Thẻ từ theo ngày web cho Phòng đổi quà – sinh bằng cong-cu/tao_tu_qua.js từ bài lớp offline. Đừng sửa tay.\n   [en, zh, pinyin, tranh, giọng Anh, giọng Trung] */\nwindow.M3_TU=' + JSON.stringify(T) + ';\n';
fs.writeFileSync(path.join(root, 'qua-tu.js'), js);
console.log('qua-tu.js', js.length, 'bytes', Object.keys(T.seed).length, Object.keys(T.canopy).length);
