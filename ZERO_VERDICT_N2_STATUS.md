# Bản án số không — Nhật ký xuất bản và kiểm kê N2

Ngày cập nhật: 2026-11-03 (JST).

## Đã hoàn thành

- Tiểu thuyết trinh thám pháp lý, tâm lý hư cấu **64 chương / 8 phần**, bắt đầu với lời thú tội về 12 người còn sống và có hồi kết hai năm sau.
- **1.160/1.160 mục mã nguồn Mimikara N2** có mặt trong câu truyện tiếng Việt dưới dạng `⟦ID|nghĩa Việt dùng trong ngữ cảnh⟧`, được kiểm đếm tự động từ văn bản.
- Ước tính **80.304 từ tiếng Việt**, 12 đoạn văn/chương và có tình tiết xuyên suốt; không tính danh sách phân chương là văn bản.
- Trình đọc mới có **chương liền mạch, không chia thành các trang chỉ một đoạn**, trang giấy cổ, tranh mở chương, bìa + mục lục ở cùng cột, chế độ tập trung đọc, từ điển N2 ở bên phải; hỗ trợ mobile và desktop, điều chỉnh cỡ chữ, furigana, nghe phát âm và đánh dấu đã đọc/đã nhớ.
- Trong cốt truyện: hệ thống ZERO **không nhìn trước tương lai**; vòng phản hồi dự báo–can thiệp có thể khiến lời dự báo tự được xác nhận. Đây là thế giới pháp lý hư cấu, không mô tả luật thực tế của bất kỳ nước nào.

## Chưa hoàn tất hiệu đính

- Đã đối chiếu với bộ từ 1.160 mục đang lưu trên Japan Study, **chưa** so từng hàng bằng người với tài liệu PDF nguyên gốc.
- Các cụm tiếng Việt và sắc thái nghĩa của toàn bộ 1.160 mục cần được rà lại để bảo đảm đúng phạm vi nghĩa của từng từ Nhật; độ phủ ID tự động **không phải** xác nhận tiếng Nhật chính xác 100%.
- Chưa qua biên tập văn chương / biên tập pháp lý độc lập. Những thuật ngữ luật trong truyện thuộc hệ thống giả tưởng.
- Người đọc nhìn thấy từ không có nghĩa đã học thuộc; chỉ trạng thái đánh dấu thủ công được tính là đã nhớ.

## Các tài liệu kiểm chứng

- [Sổ đối chiếu 1.160 mục](zero-verdict-audit.json): mã từ, chương và số lần xuất hiện.
- [Bài kiểm tra dữ liệu](tools/check-zero-verdict.mjs): đủ 64 chương × 12 đoạn, 80.304 từ, đủ 1.160 nguồn và kết thúc.
- [Bài kiểm tra giao diện](tools/check-zero-verdict-visual.mjs): desktop/màn hình rộng và mobile, 12 đoạn hiển thị liên tục, không cắt văn bản, tra từ, furigana, chế độ tập trung.

## Đường dẫn

- [Trình đọc](zero-verdict-book.html)
- Japan Study → Sách → N2 → Từ vựng → Bản án số không.

## Phục hồi độ dài và thiết kế, phiên bản V10 — 03/11/2026

- 64 chương nguyên bản **không bị cắt bỏ**; đã bổ sung bốn cảnh/đoạn mới cho mỗi chương trong tám tệp `zero-verdict-expanded-{1..8}.js`, nâng từ 42.461 lên **80.304 từ**, 768 đoạn văn.
- Mỗi chương **được đọc liên tục** với tranh mở đầu. Không còn lật 8 trang mà mỗi trang chỉ có một đoạn, tránh hiểu nhầm tiểu thuyết ngắn.
- Cột trái hợp nhất bìa và mục lục gấp/mở; giữa là văn bản giấy cổ; phải là tra từ N2. Tùy chọn tập trung đọc ẩn hai cột phụ.
- Độ phủ mã từ vựng là **kiểm đếm tự động**, chưa phải xác nhận 1.160 nghĩa Nhật đều chính xác. Các phần bổ sung cần một vòng biên tập văn chương, mạch truyện và sắc thái nghĩa từ.
