/* =====================================================================
   CUỘC THI ANH – TRUNG – KIDS MÙA 3 · 99 NGÀY · 7 CHẶNG (chị chốt 21/11/2026)
   - 99 ngày web lớp offline (Little Seed: little-seed/, Canopy: Seedling 48 buổi) chia 7 chặng.
     Chặng 1–6: 14 ngày web; chặng 7: 15 ngày (ngày 85–99).
   - Trong một chặng: 6 ngày → buổi Zoom → 6 ngày → buổi Tổng kết → 2 ngày cuối (chặng 7: 3 ngày).
   - Mỗi chặng một link: …/chang-1/ … …/chang-7/ (mở …/cuoc-thi-mua-3/?chang=N).
   - Chặng 2–7 mở theo lịch: ngày khai mạc + 14 ngày × (N − 1). Cô giáo (?gv=1) mở hết.
   - Tiến độ của các chặng lưu chung một hồ sơ bé, mỗi chặng một ngăn riêng (khoá "seed-<KOFF+i>"),
     điểm gửi máy chủ theo ngày 1–140 (ngăn 20 ô mỗi chặng) và round = số chặng, nên Xếp hạng tính riêng từng chặng.
   ===================================================================== */
const CHANG_SO = 7, CHANG_NGAY = 14, CHANG_KHOANG = 20;
const KHAI_MAC_99 = '2026-11-30';          // thứ Hai khai mạc chặng 1 (giờ Việt Nam). Đổi ngày thì sửa ở đây và XH_START (xep-hang.js)
const CHANG = (function () {
  let n = +new URLSearchParams(location.search).get('chang');
  if (!(n >= 1 && n <= CHANG_SO)) { try { n = +JSON.parse(localStorage.getItem('lle3-chang') || '1'); } catch (e) { n = 1; } }
  if (!(n >= 1 && n <= CHANG_SO)) n = 1;
  try { localStorage.setItem('lle3-chang', JSON.stringify(n)); } catch (e) {}
  return n;
})();
const CHANG_A = (CHANG - 1) * CHANG_NGAY;                          // ngày web đầu chặng (tính từ 0)
const CHANG_B = CHANG === CHANG_SO ? 99 : CHANG * CHANG_NGAY;      // ngày web cuối chặng (tính từ 1)
const CHANG_LEARN = CHANG_B - CHANG_A;                             // 14, chặng 7: 15
const CHANG_TOTAL = CHANG_LEARN + 2;                               // + Zoom (ô 7) + Tổng kết (ô 14)
const KOFF = (CHANG - 1) * CHANG_KHOANG;                           // ngăn tiến độ của chặng trong hồ sơ bé
function pk(g, i) { return g + '-' + (KOFF + i); }
/* ô thứ i trong chặng (0 = buổi 1) → số buổi học trong chặng (1–15); Zoom, Tổng kết không tính */
function learnNo(i) { return i + 1 - (i > 6 ? 1 : 0) - (i > 13 ? 1 : 0); }
/* ngày học trong cả hành trình 99 ngày */
function ngay99(i) { return CHANG_A + learnNo(i); }
function partNo(i) { return Math.floor(i / 7) + 1; }
function changMoLuc(n) { return new Date(KHAI_MAC_99 + 'T00:00:00+07:00').getTime() + (n - 1) * CHANG_NGAY * 864e5; }
function changNgay(n) { const d = new Date(changMoLuc(n) + 7 * 36e5); return ('0' + d.getUTCDate()).slice(-2) + '/' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '/' + d.getUTCFullYear(); }
/* chặng 1 mở sẵn (học thử trước khai mạc như mùa 2); chặng 2–7 mở đúng ngày */
function changDaMo(n) { return n === 1 || Date.now() >= changMoLuc(n); }
function changLink(n) { return '../chang-' + n + '/'; }
