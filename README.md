# Cuộc thi Anh – Trung – Kids mùa 3 · 99 ngày, 7 chặng

Tách từ kho `Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu` ngày 21/11/2026 (bản web mùa 3 dựng 20/11, nâng lên 99 ngày).

## Link
| | Link |
|---|---|
| Trang giới thiệu 7 chặng | https://ces-training.github.io/anh-trung-kids-cuoc-thi-7-chang/ |
| Link từng chặng (gửi ba mẹ) | `…/chang-1/` → `…/chang-7/` |
| Trang quản trị (nhiều tài khoản) | https://ces-training.github.io/anh-trung-kids-cuoc-thi-7-chang/cuoc-thi-mua-3/quan-tri/ |
| Chế độ giáo viên | thêm `?gv=1` vào link chặng |
| Sheet dữ liệu | https://docs.google.com/spreadsheets/d/1Icr3Kq4J77v4VMmu-CEbCFWQtSxnufAvZ5FEQGsjXH8/edit |

## Lịch 7 chặng (sửa ở `cuoc-thi-mua-3/chang.js`, `KHAI_MAC_99`)
- 99 ngày web lớp offline chia 7 chặng: chặng 1–6 mỗi chặng 14 ngày, chặng 7 có 15 ngày (ngày 85–99).
- Trong chặng: 6 buổi → **Zoom** → 6 buổi → **Tổng kết chặng** → 2 buổi cuối (chặng 7: 3 buổi).
- Chặng 1 mở từ khai mạc 30/11/2026 (học thử 3 buổi đầu trước đó); chặng N mở ngày khai mạc + 14 × (N − 1).
- Ba mẹ đăng ký khoá nào (Little Seed / Canopy) thì chỉ thấy khoá đó.
- Xếp hạng: mỗi chặng một giải, thêm tab Tổng 99 ngày.

## Cấu trúc
- `cuoc-thi-mua-3/` – web cuộc thi (khung), `bai-ls/`, `bai-sd/` – bộ chạy bài 99 ngày (sinh từ kho gốc, đừng sửa tay), `quan-tri/` – trang quản trị.
- `apps-script/` – máy chủ (Code.gs, QuanTri.gs) và `HUONG-DAN.md` cách bật.
- `little-seed/`, `seedling/`, `xem-truoc/`, `chuong-trinh/ve48/`, `lop-zoom/vendor/` – chỉ có tranh, giọng, thư viện mà bài dùng.

## Lấy bài mới từ web lớp offline (khi web Little Seed / Seedling gốc vừa sửa)
```
git clone --depth 1 https://github.com/Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu /tmp/nguon
git switch -c cap-nhat-bai-<ngày>
python3 cuoc-thi-mua-3/cong-cu/lay_bai_tu_web_offline.py /tmp/nguon --thu   # xem trước sẽ đổi gì
python3 cuoc-thi-mua-3/cong-cu/lay_bai_tu_web_offline.py /tmp/nguon         # chép thật
```
Kiểm tra xong thì commit, đẩy thẳng lên `main` (không cần Pull Request từ 24/11/2026). Kho web lớp offline chỉ đọc, không sửa.

## Quy tắc sửa
Xem `CLAUDE.md`. Từ 24/11/2026 chị Duyên yêu cầu trong chat, Claude sửa, chạy thử rồi đẩy thẳng lên `main`; mỗi yêu cầu một commit để hoàn tác được. Quyền quản trị, mã, giá, ngày, dữ liệu học sửa ở Sheet và trang quản trị.
