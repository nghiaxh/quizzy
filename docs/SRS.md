# SRS (Software Requirements Specification) Quizzy

## 1. Giới thiệu

### 1.1 Mục đích
Quizzy là ứng dụng đơn trang chạy trên trình duyệt, dùng để tạo, chỉnh sửa và luyện tập đề thi trắc nghiệm cùng thẻ ghi nhớ. Toàn bộ xử lý diễn ra phía client, không phụ thuộc vào backend.

### 1.2 Phạm vi
Ứng dụng cung cấp các chức năng: quản lý đề thi (CRUD), soạn câu hỏi dạng văn bản thuần với xem trước trực tiếp, chế độ thi tính giờ, chế độ thẻ ghi nhớ với đánh giá "Đã thuộc / Chưa thuộc", hiển thị kết quả và xem lại. Dữ liệu lưu qua `localStorage`.

### 1.3 Định nghĩa

| Thuật ngữ | Định nghĩa |
|---|---|
| Đề thi | Tập hợp câu hỏi có tên, lưu dưới dạng văn bản thuần |
| Câu hỏi | Mục trắc nghiệm với 2 tới 4 lựa chọn, một đáp án đúng |
| Bài thi | Phiên trả lời câu hỏi tuần tự có phản hồi tức thì |
| Thẻ ghi nhớ | Chế độ lật thẻ tự đánh giá |
| PWA | Ứng dụng web tiến bộ, có thể cài đặt và dùng ngoại tuyến |

---

## 2. Yêu cầu chức năng

### FR1 Quản lý đề thi
- FR1.1 Tạo đề thi mới với tên
- FR1.2 Xóa đề thi (có xác nhận)
- FR1.3 Đổi tên đề thi
- FR1.4 Nhân bản đề thi (thêm hậu tố "(bản sao)")
- FR1.5 Liệt kê đề thi kèm số câu hỏi
- FR1.6 Tìm đề thi theo tên (không phân biệt hoa thường)

### FR2 Soạn thảo câu hỏi
- FR2.1 Cung cấp ô soạn thảo văn bản thuần
- FR2.2 Hiển thị bản xem trước các câu hỏi đã phân tích
- FR2.3 Đồng bộ cuộn giữa ô soạn thảo và bản xem trước
- FR2.4 Tự động lưu vào đề thi khi gõ
- FR2.5 Phân tích câu hỏi ngăn cách bởi dòng trống
- FR2.6 Hỗ trợ 2 tới 4 lựa chọn, tiền tố `*` đánh dấu đáp án đúng
- FR2.7 Hỗ trợ nội dung câu hỏi và lựa chọn nhiều dòng
- FR2.8 Lặng lẽ bỏ khối không hợp lệ, đánh số lại câu hỏi tuần tự
- FR2.9 Tải đề mẫu chỉ với một thao tác

### FR3 Chế độ thi
- FR3.1 Hiển thị một câu hỏi mỗi lần
- FR3.2 Chọn đáp án (bấm lựa chọn) sau đó bấm **Kiểm tra**
- FR3.3 Phản hồi tức thì: xanh cho đúng, đỏ cho sai
- FR3.4 Phát âm thanh khi đúng (nếu bật)
- FR3.5 Bắn confetti khi đúng (nếu bật)
- FR3.6 Điều hướng bằng nút **Trước** và **Tiếp**
- FR3.7 Hiển thị "Xem kết quả" ở câu cuối khi đã nộp hết
- FR3.8 Tùy chọn đếm giờ với số phút cấu hình được
- FR3.9 Tự động nộp khi hết giờ
- FR3.10 Tùy chọn xáo trộn thứ tự câu hỏi
- FR3.11 "Làm lại câu sai": chỉ thi lại các câu trả lời sai

### FR4 Chế độ thẻ ghi nhớ
- FR4.1 Hiển thị một câu hỏi dạng thẻ
- FR4.2 Chạm để lật thẻ xem đáp án
- FR4.3 Đánh giá thẻ: "Đã thuộc" hoặc "Chưa thuộc"
- FR4.4 Điều hướng bằng nút **Trước** và **Tiếp**
- FR4.5 Hiển thị "Xem tổng kết" ở thẻ cuối khi đã đánh giá hết
- FR4.6 "Ôn lại câu chưa thuộc": chỉ học lại các thẻ "Chưa thuộc"

### FR5 Kết quả bài thi
- FR5.1 Hiển thị biểu đồ vòng tròn động với số đúng/sai
- FR5.2 Hiển thị nhận xét dựa trên tỷ lệ đúng
- FR5.3 Bắn confetti lớn nếu tỷ lệ đúng từ 80% trở lên
- FR5.4 Cung cấp nút: Làm lại, Xem lại, Sửa đề, Làm lại câu sai

### FR6 Kết quả thẻ ghi nhớ
- FR6.1 Hiển thị biểu đồ vòng tròn với số "Đã thuộc" và "Chưa thuộc"
- FR6.2 Cung cấp nút: Làm lại tất cả, Ôn lại câu chưa thuộc, Xem lại, Sửa đề

### FR7 Xem lại
- FR7.1 Liệt kê tất cả câu hỏi với chỉ thị đúng/sai cho từng lựa chọn
- FR7.2 Tìm kiếm câu hỏi theo nội dung hoặc điều hướng theo số

### FR8 Cài đặt
- FR8.1 Chuyển đổi giao diện: Sáng / Tối (lưu)
- FR8.2 Bật/tắt xáo trộn (lưu)
- FR8.3 Bật/tắt âm thanh (lưu)
- FR8.4 Bật/tắt hiệu ứng confetti (lưu)
- FR8.5 Bật/tắt đếm giờ và đặt số phút (lưu)
- FR8.6 Chuyển ngôn ngữ: Tiếng Việt / English (lưu)

### FR9 Xuất nhập
- FR9.1 Xuất tất cả đề thi và cài đặt ra file JSON
- FR9.2 Nhập đề thi từ file JSON (thay thế dữ liệu hiện tại)

### FR10 PWA
- FR10.1 Có thể cài đặt như ứng dụng độc lập
- FR10.2 Hỗ trợ ngoại tuyến qua service worker (Workbox)

---

## 3. Yêu cầu phi chức năng

| # | Yêu cầu | Ràng buộc |
|---|---|---|
| NFR1 | **Chỉ trình duyệt** | Không có backend, database, API |
| NFR2 | **Lưu trữ** | Toàn bộ dữ liệu trong `localStorage` key `quizzy-storage` |
| NFR3 | **Hiệu năng** | Phân tích 500+ câu hỏi trong dưới 50 ms |
| NFR4 | **Đa ngôn ngữ** | Tiếng Việt và English, tra cứu theo khóa |
| NFR5 | **An toàn kiểu** | TypeScript strict mode, `noUnusedLocals`, `noUnusedParameters` |
| NFR6 | **Tương thích** | Hoạt động trên di động (từ 320px) và máy tính |
| NFR7 | **Tiếp cận** | Điều hướng bằng bàn phím, thân thiện với trình đọc màn hình |
| NFR8 | **Kiểm thử** | Vitest, file test đặt cùng thư mục với file nguồn |

---

## 4. Ràng buộc công nghệ

- React 19 + TypeScript
- Zustand 5 quản lý trạng thái
- Tailwind CSS 4 + DaisyUI 5 cho giao diện
- Vite 7 cho xây dựng
- `vite-plugin-pwa` cho hỗ trợ ngoại tuyến
- GitHub Pages cho triển khai qua GitHub Actions
