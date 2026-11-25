/* =====================================================================
   GÓC VINH DANH – MÙA 3 (#/vinh-danh/<chặng>)
   - Cô thả video vào thư mục Drive "Video vinh danh – Cuộc thi mùa 3" → thư mục con "Chặng 1" … "Chặng 7"
     (link ở tab "Cài đặt quản trị", dòng "Thư mục video vinh danh"). Máy chủ (?action=vinhdanh) nhớ danh sách 5 phút.
   - Tên tệp: "Bông – đọc truyện Unit 2.mp4"; thêm mã con trong ngoặc vuông để con thấy huy hiệu "Video của con".
   - Ai mở web cũng xem được (cả khi chưa đăng nhập). Video phát bằng trình phát của Drive.
   - Nút 🌟 Vinh danh ở thanh bên có chấm đỏ khi có video mới (7 ngày) mà máy này chưa xem.
   ===================================================================== */
const VD3 = { data: null, at: 0, busy: null };
const VD3_KEY = 'm3-vd-xem';
function vd3Seen(){ try{ return JSON.parse(localStorage.getItem(VD3_KEY)||'[]'); }catch(e){ return []; } }
function vd3MarkSeen(id){ try{ const s=vd3Seen(); if(!s.includes(id)){ s.push(id); localStorage.setItem(VD3_KEY, JSON.stringify(s.slice(-400))); } }catch(e){} }
function vd3IsNew(x){ return Date.now()-x.t < 7*864e5 && !vd3Seen().includes(x.id); }
function vd3ChangNow(){ let k=1; for(let i=1;i<=CHANG_SO;i++) if(changDaMo(i)) k=i; return k; }
function vd3Date(t){ const d=new Date(t); return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2); }

async function vd3Load(force){
  if(typeof SCORE_API==='undefined' || !SCORE_API) return null;
  if(!force && VD3.data && Date.now()-VD3.at < 120000) return VD3.data;
  if(VD3.busy) return VD3.busy;
  const kid=(typeof kidId==='function' && KID && !KID.temp) ? kidId() : '';
  VD3.busy=(async()=>{
    try{
      const q=new URLSearchParams({action:'vinhdanh', kid:kid, t:Date.now()});
      const j=await (await fetch(SCORE_API+'?'+q.toString())).json();
      if(j && j.ok && j.chang){ VD3.data=j.chang; VD3.at=Date.now(); }
    }catch(e){}
    VD3.busy=null; vd3Dot(); return VD3.data;
  })();
  return VD3.busy;
}
/* chấm đỏ trên nút Vinh danh */
function vd3Dot(){
  const b=document.getElementById('sdVinh'); if(!b) return;
  let n=0; if(VD3.data) Object.values(VD3.data).forEach(l=>l.forEach(x=>{ if(vd3IsNew(x)) n++; }));
  let dot=b.querySelector('.vd3-dot');
  if(!n){ if(dot) dot.remove(); return; }
  if(!dot){ dot=document.createElement('span'); dot.className='vd3-dot'; b.appendChild(dot); }
  dot.textContent=n>9?'9+':n;
}

function viewVinhDanh(r){
  const now=vd3ChangNow();
  r=(r>=1 && r<=CHANG_SO) ? r|0 : now;
  const tabs=[1,2,3,4,5,6,7].map(k=>{
    const lab=`Chặng ${k}<small>${changNgay(k).slice(0,5)}</small>`;
    return k>now ? `<span class="xh-tab off">${lab}</span>` : `<a class="xh-tab ${k===r?'on':''}" href="#/vinh-danh/${k}">${lab}</a>`;
  }).join('');
  app.innerHTML=`<div class="xh vd3">
    <section class="xh-hero vd3-hero" style="background-image:url('../xem-truoc/tai-nguyen/trang/ls_man_khen.webp')">
      <div class="xh-ht"><small>🌟 GÓC VINH DANH</small><h2>Chặng ${r}</h2>
        <span class="xh-clock">Video các bạn làm bài thật giỏi</span></div>
    </section>
    <nav class="xh-tabs">${tabs}</nav>
    <section class="xh-card" id="vd3Card"><div class="loading">${art('🎬','big spin')}<p>Đang tải video…</p></div></section>
    <p class="xh-foot">Mỗi chặng, cô chọn những video con làm bài thật giỏi để đăng ở đây. Con chăm học, gửi bài đều, biết đâu lần tới là video của con! 🌟</p>
  </div>`;
  vd3Fill(r);
}
async function vd3Fill(r){
  const at=location.hash, card=()=>document.getElementById('vd3Card');
  const d=await vd3Load(true);
  if(location.hash!==at || !card()) return;
  if(!d){
    card().innerHTML=`<div class="empty">${art('📡','big')}<h3>Chưa tải được video</h3><p>Ba mẹ kiểm tra kết nối mạng rồi thử lại nhé.</p><button class="btn y" onclick="route()">Thử lại</button></div>`;
    return;
  }
  const list=d[r]||[];
  if(!list.length){
    card().innerHTML=`<div class="empty">${art('🎥','big')}<h3>Chặng ${r} chưa có video</h3><p>Cô sẽ đăng video các bạn làm bài thật giỏi ở đây. Con học đều và gửi bài cho cô nhé!</p></div>`;
    return;
  }
  const mine=list.filter(x=>x.con).length;
  card().innerHTML=`${mine?`<div class="xh-msg">🎉 Con có <b>${mine}</b> video được vinh danh ở chặng này!</div>`:''}
    <div class="vd3-grid">${list.map((x,i)=>`<button class="vd3-it${i===0?' big':''}${x.con?' me':''}" type="button" data-i="${i}" style="--d:${Math.min(i,12)*.05}s">
      <span class="vd3-th" style="background-image:url('https://drive.google.com/thumbnail?id=${encodeURIComponent(x.id)}&sz=w480')"><i>▶</i>
        ${x.con?'<em class="vd3-tag me">⭐ Video của con</em>':vd3IsNew(x)?'<em class="vd3-tag">Mới</em>':''}</span>
      <span class="vd3-lb">${i===0?'<small>🌟 Video mới nhất</small>':''}<b>${esc(x.ten)}</b><small>${esc(x.viec||'Bài làm thật giỏi')} · ${vd3Date(x.t)}</small>${i===0?'<span class="vd3-go">▶ Xem video</span>':''}</span></button>`).join('')}</div>
    <div class="xh-meta">${list.length} video · <button class="xh-re" type="button" onclick="route()">↻ Tải lại</button></div>`;
  card().querySelectorAll('.vd3-it').forEach(b=>b.onclick=()=>{ try{ sfx.pop(); }catch(e){} vd3Play(list, +b.dataset.i); });
  if(mine){ try{ sfx.win(); confetti(24); }catch(e){} }
}
function vd3Play(list, i){
  document.querySelectorAll('.overlay.vd3-ov').forEach(x=>x.remove());
  const x=list[i]; if(!x) return;
  vd3MarkSeen(x.id); vd3Dot();
  const it=document.querySelector(`.vd3-it[data-i="${i}"] .vd3-tag:not(.me)`); if(it) it.remove();
  const ov=document.createElement('div'); ov.className='overlay vd3-ov';
  ov.innerHTML=`<div class="vd3-box" role="dialog" aria-label="Video vinh danh">
    <div class="vd3-hd"><b>🌟 ${esc(x.ten)}</b><small>${esc(x.viec||'')}</small>
      <button class="vd3-x" type="button" aria-label="Đóng">✕</button></div>
    <div class="vd3-fr"><iframe src="https://drive.google.com/file/d/${encodeURIComponent(x.id)}/preview" allow="autoplay; fullscreen" allowfullscreen title="${esc(x.ten)}"></iframe></div>
    <div class="vd3-nav">${i>0?`<button class="btn y sm" type="button" data-go="${i-1}">← Video trước</button>`:'<span></span>'}
      ${i<list.length-1?`<button class="btn sm" type="button" data-go="${i+1}">Video sau →</button>`:'<span></span>'}</div></div>`;
  document.body.appendChild(ov);
  const close=()=>{ ov.remove(); document.removeEventListener('keydown',key); };
  const key=e=>{ if(e.key==='Escape') close(); };
  document.addEventListener('keydown',key);
  ov.onclick=e=>{ if(e.target===ov) close(); };
  ov.querySelector('.vd3-x').onclick=close;
  ov.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{ close(); vd3Play(list, +b.dataset.go); });
}
/* tải sẵn để hiện chấm đỏ; tải lại mỗi 5 phút khi web đang mở */
setTimeout(()=>vd3Load(), 1500);
setInterval(()=>{ if(document.visibilityState==='visible') vd3Load(true); }, 300000);
