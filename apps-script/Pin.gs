/**
 * PIN HỌC VIÊN · Cuộc thi Anh – Trung – Kids mùa 3 (chị Duyên chốt 26/11/2026)
 * Tệp thứ ba trong CÙNG dự án Apps Script với Code.gs và QuanTri.gs (dùng chung ss_, json_, qtSlug_, qtCap_, changNay_…).
 *
 * - Học viên không tự tạo tài khoản. Chưa có PIN: chỉ học thử buổi 1 của chặng 1.
 * - Mỗi bé, mỗi chặng một PIN 8 số do CES cấp trên Bảng điều khiển (cuoc-thi-mua-3/bang-dieu-khien/).
 * - Ba mẹ gọi hotline CES để lấy PIN; nhập PIN ở link chặng đó là con học tiếp, giữ tiến độ.
 *
 * Dữ liệu ở tab gid=0 của Sheet mùa 3 (trước là "Trang tính1", máy chủ tự đổi tên thành "PIN học viên"):
 *   A PIN | B Mã HV | C Tên con | D Khoá | E Chặng | F Trạng thái (Đang dùng / Đã khoá) | G Cấp lúc | H Người cấp
 *   I Dùng lần đầu | J Dùng gần nhất | K Số lần vào | L Mã tiến độ | M Mã gia đình | N Ghi chú
 * Không ghi tên ba mẹ, số điện thoại vào tab này.
 *
 * Web học hỏi:  ?action=pin&pin=<8 số>&chang=<1–7>&vid=<mã máy>  → {ok:true, hv, ten, khoa, id, chang} hoặc {ok:false, why}
 *   why: sai · da-khoa · khac-chang (kèm chang đúng) · nhieu (nhập sai quá nhiều lần, đợi 1 giờ)
 * Bảng điều khiển gửi {action:'qt', fn:'pinTai' | 'pinCap' | 'pinKhoa' | 'pinSuaHv', token, …}.
 */
const PIN_TAB_ID = 0;
const PIN_TEN = 'PIN học viên';
const PIN_HEAD = ['PIN', 'Mã HV', 'Tên con', 'Khoá', 'Chặng', 'Trạng thái', 'Cấp lúc', 'Người cấp', 'Dùng lần đầu', 'Dùng gần nhất', 'Số lần vào', 'Mã tiến độ', 'Mã gia đình', 'Ghi chú'];
const PIN_DANG_DUNG = 'Đang dùng', PIN_DA_KHOA = 'Đã khoá';
const PIN_DAI = 8;

function pinSheet_(ss) {
  let sh = ss.getSheets().filter(s => s.getSheetId() === PIN_TAB_ID)[0] || ss.getSheetByName(PIN_TEN);
  if (!sh) sh = ss.insertSheet(PIN_TEN);
  if (sh.getName() !== PIN_TEN && !ss.getSheetByName(PIN_TEN)) sh.setName(PIN_TEN);
  const h = sh.getRange(1, 1, 1, PIN_HEAD.length).getValues()[0];
  if (h.join('|') !== PIN_HEAD.join('|')) {
    sh.getRange(1, 1, 1, PIN_HEAD.length).setValues([PIN_HEAD]).setFontWeight('bold').setBackground('#E6F4EA');
    sh.setFrozenRows(1);
    sh.getRange(1, 1, sh.getMaxRows(), 2).setNumberFormat('@');
    sh.getRange(1, 12, sh.getMaxRows(), 2).setNumberFormat('@');
    if (sh.getMaxRows() > 1) sh.getRange(2, 6, sh.getMaxRows() - 1, 1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList([PIN_DANG_DUNG, PIN_DA_KHOA], true).build());
  }
  return sh;
}
function pinMs_(v) { if (v instanceof Date) return v.getTime(); if (v === '' || v == null) return 0; const t = new Date(v).getTime(); return isNaN(t) ? 0 : t; }
function pinKhoaChuan_(k) { k = String(k || '').toLowerCase(); return k.indexOf('canopy') >= 0 || k.indexOf('seedling') >= 0 ? 'Canopy' : 'Little Seed'; }
function pinDoc_(ss) {
  const sh = pinSheet_(ss), n = sh.getLastRow();
  const v = n > 1 ? sh.getRange(2, 1, n - 1, PIN_HEAD.length).getValues() : [];
  const ds = [];
  v.forEach((r, i) => {
    const pin = String(r[0] || '').replace(/\D/g, ''); if (!pin) return;
    ds.push({ row: i + 2, pin: pin, hv: String(r[1] || '').trim(), ten: String(r[2] || '').trim(), khoa: pinKhoaChuan_(r[3]),
      chang: Math.floor(+r[4]) || 0, tt: String(r[5] || '').trim() === PIN_DA_KHOA ? PIN_DA_KHOA : PIN_DANG_DUNG,
      cap: pinMs_(r[6]), nguoi: String(r[7] || ''), dau: pinMs_(r[8]), cuoi: pinMs_(r[9]), lan: +r[10] || 0,
      id: String(r[11] || '').trim(), gd: String(r[12] || '').trim(), ghi: String(r[13] || '') });
  });
  return { sh: sh, ds: ds };
}
/* Bảng tra nhanh cho web học, giữ 30 giây (khoá / cấp PIN mới thì xoá ngay) */
function pinBang_() {
  const c = CacheService.getScriptCache(), hit = c.get('pin-bang-v1');
  if (hit) { try { return JSON.parse(hit); } catch (e) { } }
  const o = {};
  pinDoc_(ss_()).ds.forEach(x => { o[x.pin] = [x.row, x.hv, x.ten, x.khoa, x.chang, x.tt, x.cuoi, x.id]; });
  try { c.put('pin-bang-v1', JSON.stringify(o), 30); } catch (e) { }
  return o;
}
function pinXoaDem_() { try { CacheService.getScriptCache().remove('pin-bang-v1'); } catch (e) { } }

/* ---------- web học: kiểm tra PIN ---------- */
function pinKiemTra_(p) {
  const pin = String(p.pin || '').replace(/\D/g, '').slice(0, 12);
  const chang = Math.max(0, Math.min(7, Math.floor(+p.chang) || 0));
  const vid = String(p.vid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'x';
  const c = CacheService.getScriptCache(), kSai = 'pin_sai_' + vid;
  const nSai = +(c.get(kSai) || 0), nAll = +(c.get('pin_sai_all') || 0);
  if (nSai >= 10 || nAll >= 300) return { ok: false, why: 'nhieu' };
  const sai = () => { c.put(kSai, String(nSai + 1), 3600); c.put('pin_sai_all', String(nAll + 1), 600); return { ok: false, why: 'sai' }; };
  if (pin.length !== PIN_DAI) return sai();
  const r = pinBang_()[pin];
  if (!r) return sai();
  const x = { row: r[0], hv: r[1], ten: r[2], khoa: r[3], chang: r[4], tt: r[5], cuoi: r[6], id: r[7] };
  if (x.tt === PIN_DA_KHOA) return { ok: false, why: 'da-khoa', chang: x.chang };
  if (chang && x.chang !== chang) return { ok: false, why: 'khac-chang', chang: x.chang };
  if (Date.now() - (x.cuoi || 0) > 30 * 60000) pinGhiDung_(pin, x.row);
  return { ok: true, hv: x.hv, ten: x.ten, khoa: x.khoa === 'Canopy' ? 'canopy' : 'seed', id: x.id, chang: x.chang };
}
/* Ghi "Dùng lần đầu", "Dùng gần nhất", "Số lần vào" (tối đa 1 lần / 30 phút / PIN để Sheet đỡ tải) */
function pinGhiDung_(pin, row) {
  const lock = LockService.getScriptLock(); if (!lock.tryLock(5000)) return;
  try {
    const sh = pinSheet_(ss_());
    if (row > sh.getLastRow() || String(sh.getRange(row, 1).getValue()).replace(/\D/g, '') !== pin) return;
    const v = sh.getRange(row, 9, 1, 3).getValues()[0], now = new Date();
    sh.getRange(row, 9, 1, 3).setValues([[v[0] || now, now, (+v[2] || 0) + 1]]);
    pinXoaDem_();
  } catch (e) { } finally { lock.releaseLock(); }
}

/* ---------- Bảng điều khiển ---------- */
function pinQuanTri_(s, fn, d) {
  if (fn === 'pinTai') return pinTai_(s);
  if (qtCap_(s.me.vaiTro) === 'ctv') return { ok: false, err: 'Tài khoản CTV chỉ xem, không cấp hoặc khoá PIN.' };
  if (fn === 'pinCap') return pinCap_(s, d.p || {});
  if (fn === 'pinKhoa') return pinKhoa_(s, String(d.pin || ''), !!d.khoa);
  if (fn === 'pinSuaHv') return pinSuaHv_(s, String(d.hv || ''), d.p || {});
  return { ok: false, err: 'Không rõ yêu cầu.' };
}
function pinNgauNhien_(dung) {
  for (let k = 0; k < 50; k++) {
    let p = String(1 + Math.floor(Math.random() * 9));
    while (p.length < PIN_DAI) p += Math.floor(Math.random() * 10);
    if (!dung[p] && !/(\d)\1\1\1/.test(p)) return p;
  }
  throw new Error('Không tạo được PIN, thử lại.');
}
function pinHvMoi_(ds) {
  let m = 0; ds.forEach(x => { const k = +String(x.hv).replace(/\D/g, ''); if (k > m) m = k; });
  return 'HV' + String(m + 1).padStart(3, '0');
}
/* Học viên tạo từ một gia đình đã học trước (đăng nhập bằng số điện thoại): dùng lại mã tiến độ cũ để giữ sao và bài đã học */
function pinMaTienDo_(ss, gd, ten) {
  if (gd) {
    try {
      const sh = ss.getSheetByName('Gia đình');
      if (sh && sh.getLastRow() > 1) {
        const r = sh.getRange(2, 1, sh.getLastRow() - 1, 8).getValues().find(x => String(x[0]).trim() === gd);
        const so = r && normPhone_(r[6]);
        if (so) {
          const td = ss.getSheetByName('TienDo'), co = {};
          if (td && td.getLastRow() > 1) td.getRange(2, 1, td.getLastRow() - 1, 1).getValues().forEach(x => co[String(x[0])] = 1);
          const ten0 = [ten].concat(String(r[7] || '').split(',')).map(t => String(t).trim()).filter(Boolean);
          for (let i = 0; i < ten0.length; i++) { const id = hashAcct_(so + '|' + qtSlug_(ten0[i])); if (co[id]) return id; }
        }
      }
    } catch (e) { }
  }
  return 'hv' + Utilities.getUuid().replace(/-/g, '').slice(0, 14);
}
function pinCap_(s, p) {
  const ten = String(p.ten || '').trim().slice(0, 40), khoa = pinKhoaChuan_(p.khoa);
  const ds = [].concat(p.chang || []).map(x => Math.floor(+x)).filter(x => x >= 1 && x <= 7);
  const gd = /^GD[A-Z0-9]{4,8}$/.test(String(p.gd || '').trim().toUpperCase()) ? String(p.gd).trim().toUpperCase() : '';
  const ghi = String(p.ghi || '').slice(0, 200), capLai = !!p.capLai;
  if (!ds.length) return { ok: false, err: 'Chọn ít nhất một chặng.' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ss = s.ss || ss_(), b = pinDoc_(ss), sh = b.sh;
    let hv = String(p.hv || '').trim().toUpperCase(), cu = hv ? b.ds.filter(x => x.hv === hv) : [];
    if (hv && !cu.length) return { ok: false, err: 'Không thấy học viên ' + hv + '.' };
    if (!hv && !ten) return { ok: false, err: 'Nhập tên của con.' };
    const goc = cu[0] || null;
    if (!hv) hv = pinHvMoi_(b.ds);
    const id = goc ? (goc.id || pinMaTienDo_(ss, gd || goc.gd, goc.ten)) : pinMaTienDo_(ss, gd, ten);
    const tenHv = goc ? goc.ten : ten, khoaHv = goc ? goc.khoa : khoa, gdHv = goc ? (goc.gd || gd) : gd;
    const dung = {}; b.ds.forEach(x => dung[x.pin] = 1);
    const out = [], now = new Date();
    ds.forEach(ch => {
      const dang = cu.filter(x => x.chang === ch && x.tt === PIN_DANG_DUNG);
      if (dang.length && !capLai) { out.push({ pin: dang[0].pin, chang: ch, cu: true }); return; }
      dang.forEach(x => { sh.getRange(x.row, 6).setValue(PIN_DA_KHOA); sh.getRange(x.row, 14).setValue((x.ghi ? x.ghi + ' · ' : '') + 'Cấp lại bởi ' + s.me.ten + ' ' + Utilities.formatDate(now, QT_TZ, 'dd/MM HH:mm')); });
      const pin = pinNgauNhien_(dung); dung[pin] = 1;
      sh.appendRow(['', '', tenHv, khoaHv, ch, PIN_DANG_DUNG, now, s.me.ten, '', '', 0, '', '', ghi]);
      const r = sh.getLastRow();
      sh.getRange(r, 1, 1, 2).setNumberFormat('@').setValues([[pin, hv]]);
      sh.getRange(r, 12, 1, 2).setNumberFormat('@').setValues([[id, gdHv]]);
      out.push({ pin: pin, chang: ch, cu: false });
    });
    pinXoaDem_();
    return { ok: true, hv: hv, ten: tenHv, khoa: khoaHv, pins: out };
  } finally { lock.releaseLock(); }
}
function pinKhoa_(s, pin, khoa) {
  pin = pin.replace(/\D/g, '');
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = pinDoc_(s.ss || ss_()), x = b.ds.find(r => r.pin === pin);
    if (!x) return { ok: false, err: 'Không thấy PIN này.' };
    const now = Utilities.formatDate(new Date(), QT_TZ, 'dd/MM HH:mm');
    b.sh.getRange(x.row, 6).setValue(khoa ? PIN_DA_KHOA : PIN_DANG_DUNG);
    b.sh.getRange(x.row, 14).setValue((x.ghi ? x.ghi + ' · ' : '') + (khoa ? 'Khoá' : 'Mở lại') + ' bởi ' + s.me.ten + ' ' + now);
    pinXoaDem_();
    return { ok: true };
  } finally { lock.releaseLock(); }
}
function pinSuaHv_(s, hv, p) {
  hv = hv.trim().toUpperCase();
  const ten = String(p.ten || '').trim().slice(0, 40), khoa = p.khoa ? pinKhoaChuan_(p.khoa) : '';
  if (!ten && !khoa) return { ok: false, err: 'Không có gì để sửa.' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = pinDoc_(s.ss || ss_()), rows = b.ds.filter(x => x.hv === hv);
    if (!rows.length) return { ok: false, err: 'Không thấy học viên ' + hv + '.' };
    rows.forEach(x => { if (ten) b.sh.getRange(x.row, 3).setValue(ten); if (khoa) b.sh.getRange(x.row, 4).setValue(khoa); });
    pinXoaDem_();
    return { ok: true };
  } finally { lock.releaseLock(); }
}
/* Toàn bộ số liệu cho Bảng điều khiển: PIN, học viên, tiến độ từng chặng, phễu học thử */
function pinTai_(s) {
  const ss = s.ss || ss_(), b = pinDoc_(ss);
  const hv = {};
  b.ds.forEach(x => {
    const h = hv[x.hv] || (hv[x.hv] = { hv: x.hv, ten: x.ten, khoa: x.khoa, id: x.id, gd: x.gd, pins: [], cuoi: 0 });
    h.pins.push({ pin: x.pin, chang: x.chang, tt: x.tt, cap: x.cap, nguoi: x.nguoi, dau: x.dau, cuoi: x.cuoi, lan: x.lan, ghi: x.ghi });
    h.cuoi = Math.max(h.cuoi, x.cuoi); if (!h.id && x.id) h.id = x.id;
  });
  const ids = {}; Object.keys(hv).forEach(k => { if (hv[k].id) ids[hv[k].id] = hv[k]; });
  /* tiến độ: tab Diem (mỗi buổi một dòng: kid | name | group | day | round | points | updated) */
  const dsh = ss.getSheetByName('Diem');
  if (dsh && dsh.getLastRow() > 1) dsh.getRange(2, 1, dsh.getLastRow() - 1, 7).getValues().forEach(r => {
    const h = ids[String(r[0])]; if (!h) return;
    const ch = Math.floor(+r[4]) || 0, pt = +r[5] || 0, t = pinMs_(r[6]);
    h.td = h.td || {}; const o = h.td[ch] || (h.td[ch] = { sao: 0, buoi: 0 });
    o.sao += pt; if (pt > 0) o.buoi++; h.hoc = Math.max(h.hoc || 0, t);
  });
  const td = ss.getSheetByName('TienDo');
  if (td && td.getLastRow() > 1) td.getRange(2, 1, td.getLastRow() - 1, 5).getValues().forEach(r => {
    const h = ids[String(r[0])]; if (h) h.hoc = Math.max(h.hoc || 0, pinMs_(r[4]));
  });
  /* phễu học thử: tab "Truy cập học thử" (mỗi máy một mã người xem) */
  const ph = { mo: {}, hoc: {}, xong1: {}, khoa: {}, bam_pin: {}, hotline: {}, pin_ok: {} }, ngay = {};
  const tc = ss.getSheetByName('Truy cập học thử'), tu = new Date(KHAI_MAC_99 + 'T00:00:00+07:00').getTime() - 30 * 864e5;
  if (tc && tc.getLastRow() > 1) tc.getRange(2, 1, tc.getLastRow() - 1, 4).getValues().forEach(r => {
    const t = pinMs_(r[0]), vid = String(r[2] || ''), ev = String(r[3] || ''); if (!vid || t < tu) return;
    if (ph[ev]) ph[ev][vid] = 1;
    if (ev === 'mo' || ev === 'vao') { const k = Utilities.formatDate(new Date(t), QT_TZ, 'yyyy-MM-dd'); (ngay[k] = ngay[k] || {})[vid] = 1; }
  });
  const pheu = {}; Object.keys(ph).forEach(k => pheu[k] = Object.keys(ph[k]).length);
  const theoNgay = Object.keys(ngay).sort().slice(-14).map(k => [k, Object.keys(ngay[k]).length]);
  return { ok: true, me: qtNguoi_(s.me), changNay: changNay_(), khaiMac: KHAI_MAC_99, now: Date.now(),
    hv: Object.keys(hv).map(k => { const h = hv[k]; delete h.id; return h; }), pheu: pheu, theoNgay: theoNgay };
}
