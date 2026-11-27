# Quy tắc cho Claude và mọi người sửa kho này (chị Duyên chốt 21/11/2026, sửa 24/11/2026)

1. **Không cần Pull Request nữa (từ 24/11/2026).** Mọi thay đổi chị Duyên yêu cầu trong chat (bài học, khung web, tranh, giọng, lịch chặng, máy chủ) Claude sửa và đẩy thẳng lên `main`.
   - Trước khi đẩy: chạy thử trang đã sửa, chụp màn hình tự kiểm tra.
   - Mỗi yêu cầu một commit riêng, lời commit ghi rõ đổi gì, để hoàn tác được (`git revert`).
   - Sau khi đẩy: báo chị đã đổi gì, link xem; chị nói "hoàn tác" thì Claude đưa về bản trước.
   - Chỉ làm đúng việc chị yêu cầu. Xoá tệp, xoá hoặc ghi đè hàng loạt thì hỏi chị trước.
2. **Kho web lớp offline `Anh-Trung-Kids-CES/hoc.mot.lan.duoc.hai.ngon.ngu` chỉ để đọc:** không sửa, không đẩy, không mở PR vào đó.
3. Quyền quản trị (tài khoản đội, vai trò) và dữ liệu (đọc, tổng hợp, xuất báo cáo từ Sheet, mở khoá gia đình, đổi ngày/giá trong tab Cài đặt của Sheet) làm ngay.
4. Không ai được dán mật khẩu, khoá API vào kho này. Không đưa tên ba mẹ, số Zalo vào kho.
5. **Đồng bộ một chiều từ web gốc (chị Duyên chốt 27/11/2026).** Nội dung bài, tranh, giọng, dữ liệu do web gốc (`ces-training/hoc.mot.lan.duoc.hai.ngon.ngu-lop-offline`, Project "Chương trình Anh - Trung 9 level") quyết định: sửa ở gốc rồi chạy `python3 cong-cu/dong_bo_nhan_ban.py` ở kho gốc để nhân bản này tự theo. Không chép ngược từ kho này về gốc; sửa nội dung bài trực tiếp ở đây sẽ bị lần đồng bộ sau ghi đè. Phần riêng của kho này (đăng nhập, gói, máy chủ, xếp hạng, quản trị, phòng đổi quà) được giữ nguyên.
