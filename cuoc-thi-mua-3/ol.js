/* =====================================================================
   CUỘC THI MÙA 3 · BÀI LỚP OFFLINE · 99 ngày, 7 chặng (chị chốt 21/11/2026; khung 21 ngày cũ chốt 20/11)
   - Little Seed: 18 ngày đầu của web Little Seed lớp offline (bai-ls/, chép từ ../little-seed/).
   - Canopy: 18 ngày đầu của web Seedling 48 buổi (bai-sd/, chép từ ../seedling/).
   - Ngày 7, 14, 21 vẫn là buổi Zoom. Buổi tự học k (1–18) = ngày web lớp offline k.
   - Bài chạy trong khung (iframe); bài báo về từng bước xong (sao) và cả ngày xong qua postMessage (nhung.js trong bai-ls/, bai-sd/).
     Web mùa 3 ghi s.ol = {bước: sao}, cộng sao, mở màn chúc mừng, nhiệm vụ clip, Góc khám phá như mùa 2.
   Dữ liệu tên bài, các bước: bai-offline.js (sinh bằng cong-cu/dung_bai_offline.py).
   ===================================================================== */
const OL_PTS = 4;                                   // sao mỗi bước xong (như mùa 2)
const OL_SRC = { seed: 'ls', canopy: 'sd' };
/* MÙA 3 · 99 NGÀY: chủ đề từng phần của chặng (phần 1: buổi 1–6, phần 2: buổi 7–12, phần 3: buổi cuối) sinh từ tên unit của bài */
function olUnitTen(d) { return String((d && d.unitname) || '').split(' – ')[0].trim(); }
function olChuDe(ds) { const u = []; ds.forEach(d => { const t = olUnitTen(d); if (t && t !== 'Ôn cả khóa' && u.indexOf(t) < 0) u.push(t); }); return u; }
function olPhan(g) { const L = ((window.M3_OL || {})[OL_SRC[g]] || []).slice(CHANG_A, CHANG_B); return [L.slice(0, 6), L.slice(6, 12), L.slice(12)]; }
const OL_STAGE = {}, OL_ZOOM = {};
['seed', 'canopy'].forEach(g => {
  const P3 = olPhan(g);
  OL_STAGE[g] = P3.map(ds => { const u = olChuDe(ds); return { topic: u.join(' · ') || 'Ôn tập', desc: 'Con học: ' + ds.map(d => String(d.t || '').split(' – ')[0]).join(' · ') + '.' }; });
  const z1 = olChuDe(P3[0]).join(', '), z2 = olChuDe(P3[0].concat(P3[1])).join(', ');
  OL_ZOOM[g] = [
    { t: 'Lớp học trực tuyến chặng ' + CHANG + (z1 ? ': ' + z1 : ''), about: 'Buổi học trực tuyến cùng cô giáo sau 6 buổi đầu của chặng ' + CHANG + ': con ôn các câu đã học' + (z1 ? ' (' + z1 + ')' : '') + ', nói cùng các bạn bằng tiếng Anh và tiếng Trung.' },
    { t: 'Buổi tổng kết chặng ' + CHANG, about: 'Buổi tổng kết sau 12 buổi của chặng ' + CHANG + ': con trình bày điều đã học' + (z2 ? ' (' + z2 + ')' : '') + ', cô nhận xét, vinh danh các bạn chăm chỉ nhất chặng, rồi con học tiếp những buổi cuối của chặng.' }];
});
/* Tên dạng bài (theo web lớp offline) cho dòng nhỏ dưới tiêu đề */
const OL_STEP = { nen: 'Thẻ nền', the: 'Thẻ từ', truyen: 'Nghe truyện', bb: 'Big book', vek: 'Vè', ve: 'Vè', noi: 'Nói theo', cham: 'Chạm đúng tranh',
  chon: 'Chọn tranh', goi: 'Gọi lại', pdn: 'Phiên dịch nhí', hoi: 'Trả lời câu hỏi', loi: 'Lời lớp học', meo: 'Mẹo âm', de: 'Dạng đề', game: 'Vận động' };

function olDays(g) {
  const src = OL_SRC[g], L = ((window.M3_OL || {})[src] || []).slice(CHANG_A, CHANG_B), Z = OL_ZOOM[g], out = [];
  let k = 0;
  for (let i = 0; i < CHANG_TOTAL; i++) {
    if (i % 7 === 6) {
      const r = (i - 6) / 7, ds = r ? L.slice(0, 12) : L.slice(0, 6);
      out.push({ zoom: true, tk: r === 1, t: Z[r].t, about: Z[r].about,
        prep: [r ? 'Các bài con đã học trong chặng này:' : 'Các bài con đã học trước buổi Zoom:'].concat(ds.map(d => String(d.t || '').split(' – ')[0])) });
      continue;
    }
    const D = L[k++];
    out.push(D ? { t: D.t, ol: Object.assign({ src }, D), r: Math.floor(i / 7) + 1 } : { t: 'Ôn tập', r: Math.floor(i / 7) + 1 });
  }
  return out;
}
function olState(g, i) { const s = st(g, i); s.ol = s.ol || {}; return s; }
function olDayPoints(s, d) { if (!s) return 0; return Object.keys(s.ol || {}).length * OL_PTS + (s.done ? PTS.done : 0); }   // mỗi bước xong 4 sao + 10 sao xong buổi

/* Góc khám phá: Canopy mùa 3 học cùng chủ đề với Little Seed (chào hỏi · tên tuổi · gia đình) nên dùng chung kho của Little Seed,
   đổi "mở từ ngày" (ngày chung 1–20) sang ngày trong chặng. */
(function () {
  const X = window.XEM_THEM; if (!X || !X.seed) return;
  X.canopy = X.seed.map((R, r) => { const o = {};
    Object.keys(R).forEach(k => { o[k] = Array.isArray(R[k]) ? R[k].map(it => { if (!Array.isArray(it)) return it; const a = it.slice(); a[2] = Math.max(1, (+a[2] || 1) - r * 7); return a; }) : R[k]; });
    return o; });
})();

/* Hướng dẫn quay clip "2 cách" như web cũ (25/11/2026): câu, pinyin, giọng mẫu lấy từ bài (huong-dan-nop-bai.js, sinh bằng
   cong-cu/tao_huong_dan_nop_bai.js); 2 kịch bản quay dựng ở đây, lời ba mẹ chỉ bằng tiếng Việt. Lời thoại mùa 2 thuộc bài cũ nên không dùng. */
function nopBaiCach(say) {
  const x = say.map(p => ({ en: p[0], zh: p[1], py: p[2] || '', ae: p[3] || '', az: p[4] || '' })), c1 = x[0], c2 = x[1];
  const B = vi => ({ w: 'bm', vi }), D = vi => ({ w: 'do', vi });
  const C = (c, chi, act) => Object.assign({ w: 'con' }, chi !== 'zh' ? { en: c.en, ae: c.ae } : {}, chi !== 'en' ? { zh: c.zh, py: c.py, az: c.az } : {}, act ? { act } : {});
  return {
    a: { t: 'Hỏi – đáp nhanh', prep: ['Ba hoặc mẹ ngồi cạnh con, một người cầm máy quay (hoặc dựng máy)'],
      s: [B('Hôm nay con học nói câu gì? Con nói bằng tiếng Anh cho ba mẹ nghe nhé!'), C(c1, 'en'), B('Bây giờ nói bằng tiếng Trung nào!'), C(c1, 'zh'),
        ...(c2 ? [B('Còn câu này con nói thế nào?'), C(c2)] : []), B('Giỏi quá! Đập tay nào! 🙌')],
      tip: 'Ba mẹ bấm 🔊 cho con nghe mẫu một lần trước khi quay. Con mới nói được 1 từ, nói một thứ tiếng hay chỉ làm động tác cũng là hoàn thành.' },
    b: { t: 'Đóng vai: Con làm cô giáo nhỏ', prep: ['Xếp vài thú bông làm "học trò" (hoặc ba mẹ ngồi làm học trò)', 'Con đứng trước "lớp", máy quay để ngang tầm con'],
      s: [D('Con chào "cả lớp" rồi nói: "Hôm nay cô dạy các bạn câu này!"'), C(c1, '', 'chỉ tay vào "lớp"'), D('Ba mẹ (học trò) nói lại theo con, con gật đầu khen "Good!"'),
        ...(c2 ? [C(c2)] : []), D('Cả nhà vỗ tay cho cô giáo nhỏ')],
      tip: 'Bé rất thích được làm người dạy. Có thể diễn 2 lần: lần đầu tiếng Anh, lần sau tiếng Trung.' } };
}
const NOP_BAI_CACHE = {};
window.CLIP_GUIDE = { get(g, i) {
  const d = typeof GROUPS !== 'undefined' && GROUPS[g] && GROUPS[g].days[i], N = window.NOP_BAI;
  if (!d || !d.ol || d.zoom || !N || !N[d.ol.src] || !N[d.ol.src][d.ol.n]) return null;
  const k = d.ol.src + d.ol.n; if (!NOP_BAI_CACHE[k]) { const h = N[d.ol.src][d.ol.n]; NOP_BAI_CACHE[k] = Object.assign({ topic: h.topic, say: h.say }, nopBaiCach(h.say)); }
  return NOP_BAI_CACHE[k]; } };
function olSay(g, i) {
  const d = GROUPS[g] && GROUPS[g].days[i]; if (!d || !d.ol) return null;
  const m = /^(.+?)\s+–\s+(.*[\u3400-\u9fff].*)$/.exec(d.t || ''); return m ? [m[1].trim(), m[2].trim()] : null;
}

/* ---------- MÀN HỌC MỘT BUỔI ---------- */
let OLCUR = null;
function olSrc(g, i) {
  const D = GROUPS[g].days[i].ol, k = (KID && (KID.id || KID.name)) || 'may';
  const kk = String(k).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]/g, '').slice(0, 40) || 'may';
  return `bai-${D.src}/index.html?n=${D.n}&k=${encodeURIComponent((TEACHER ? 'gv-' : DEMO ? 'thu-' : '') + kk)}&ten=${encodeURIComponent((KID && !TEACHER && KID.name) || '')}`;
}
function viewOlDay(g, i) {
  const G = GROUPS[g], day = G.days[i], s = olState(g, i);
  document.body.classList.remove('hub'); document.body.classList.add('in-step');
  OLCUR = { g, i };
  app.innerHTML = `<div class="ol-wrap">
    <div class="ol-bar"><a class="btn y ol-back" href="#/g/${g}">← Bản đồ</a>
      <div class="ol-tt"><small>${G.icon} ${esc(G.name)} · Chặng ${CHANG} · Buổi ${learnNo(i)}/${CHANG_LEARN} · Ngày ${ngay99(i)}/99</small><b>${titleHTML(day.t)}</b></div>
      <span class="ol-pts" id="olPts">⭐ ${dayPoints(g, i)}</span>
      <button class="btn ol-x ${s.done && !s.clipSent ? 'nhac' : ''}" id="olX" type="button">📤 Nộp bài</button></div>
    <iframe class="ol-frame" id="olFrame" src="${esc(olSrc(g, i))}" allow="autoplay; microphone; camera; fullscreen" title="Bài học ${esc(day.t)}"></iframe></div>`;
  document.getElementById('olX').onclick = () => { sfx.pop(); extrasPanel(g, i); };
  window.scrollTo({ top: 0 });
}
function olUpd(g, i) {
  const el = document.getElementById('olPts'); if (el) el.textContent = '⭐ ' + dayPoints(g, i);
  const x = document.getElementById('olX'), s = st(g, i); if (x) x.classList.toggle('nhac', !!s.done && !s.clipSent);   // nút Nộp bài luôn hiện; xong buổi mà chưa nộp thì nhấp nháy nhắc
}
window.addEventListener('message', e => {
  const m = e.data; if (!m || !m.m3 || e.origin !== location.origin || !OLCUR) return;
  const { g, i } = OLCUR, day = GROUPS[g] && GROUPS[g].days[i];
  if (!day || !day.ol || +m.n !== day.ol.n || !/^#\/g\//.test(location.hash)) return;
  if (m.t === 'ra') {
    const mm = /^#\/ngay\/(\d+)/.exec(m.to || ''), j = mm ? GROUPS[g].days.findIndex(d => d.ol && d.ol.n === +mm[1]) : -1;
    location.hash = j >= 0 && j !== i && isUnlocked(g, j) ? `#/g/${g}/${j + 1}` : `#/g/${g}`;
    return;
  }
  if (!['buoc', 'xong', 'san-sang'].includes(m.t)) return;
  const s = olState(g, i), before = dayPoints(g, i), tong = +m.tong || 0; let ch = false;
  if (tong && s.olN !== tong) { s.olN = tong; ch = true; }   // số bước thật của buổi (web lớp có thể thêm bước khi chạy)
  Object.keys(m.steps || {}).forEach(k => { if (!/^\d+$/.test(k) || +k >= (tong || 20)) return;
    const v = Math.max(+s.ol[k] || 0, +m.steps[k] || 1); if (v !== s.ol[k]) { s.ol[k] = v; ch = true; } });
  if (ch) addPoints(g, i, before, document.getElementById('olPts'));
  const all = !!s.olN && Object.keys(s.ol).length >= s.olN;
  if (m.t === 'xong' || (all && !s.done)) olCompleteDay(g, i);
  olUpd(g, i);
});
/* Xong buổi: cộng sao ngày, màn chúc mừng như mùa 2 (nhiệm vụ clip, Góc khám phá) */
function olCompleteDay(g, i) {
  const s = olState(g, i);
  let fresh = false; if (!s.done) { const before = dayPoints(g, i); s.done = true; fresh = true; addPoints(g, i, before, null); }
  const RW = fresh ? rewardExtras(g, i) : { html: '', lines: [] };
  lsStop();
  document.querySelectorAll('.ls-cele').forEach(e => e.remove());
  const ov = document.createElement('div'); ov.className = 'ls-cele';
  ov.innerHTML = `<div class="ls-cele-box" role="dialog" aria-label="Hoàn thành buổi ${lessonNo(i)}">
    <img class="ls-cele-img" src="../xem-truoc/tai-nguyen/trang/ls_man_khen.webp" alt="">
    <div class="ls-cele-stars">${LS_SVG.star}${LS_SVG.star}${LS_SVG.star}</div>
    <h3>Con học xong buổi ${lessonNo(i)} rồi!</h3>
    <p>Con được <b>${dayPoints(g, i)} sao</b>.</p>${RW.html}${khenParent(g, i)}
    <a class="ls-cele-go" href="#/g/${g}"><span aria-hidden="true">🗺️</span><b>Về bản đồ</b></a>
    <div class="ls-cele-more">${missionHTML(g, i)}${xtTeaser(g, Math.floor(i / PER), '🧭 Con muốn xem thêm? Góc khám phá')}</div></div>`;
  document.body.appendChild(ov); missionWire(ov, g, i);
  ov.querySelectorAll('.xt-tc, .xt-th a, .ls-cele-go').forEach(a => a.addEventListener('click', () => ov.remove()));
  confetti(44); sfx.win(); olUpd(g, i);
  (async () => { await lsHD('Tuyệt vời! Con đã học xong hôm nay rồi!'); if (!document.body.contains(ov)) return;
    for (const t of RW.lines) { await lsWait(250); if (!document.body.contains(ov)) return; await khenLS(t); }
    await lsWait(300); if (document.body.contains(ov)) lsHD('Hẹn gặp con ngày mai nhé!'); })();
}
