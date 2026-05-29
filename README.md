# Quizzy - Ứng dụng tạo & ôn tập trắc nghiệm

Quizzy là công cụ soạn đề thi trắc nghiệm, hỗ trợ ôn tập trực tiếp trên trình duyệt.

Bạn có thể tạo nhiều đề, chỉnh sửa câu hỏi theo cú pháp đơn giản, làm bài kiểm tra và nhận kết quả chi tiết.

## Các tính năng

- **Quản lý nhiều đề thi** – tạo, xóa, đổi tên, nhân bản.
- **Soạn thảo câu hỏi** với cú pháp rõ ràng, xem trước trực quan.
- **Đồng bộ cuộn** giữa khung soạn & xem trước.
- **Tìm kiếm câu hỏi** – lọc theo nội dung hoặc số thứ tự.
- **Ôn tập** từng câu, kiểm tra ngay, xem đáp án đúng.
- **Kết quả chi tiết** – số câu đúng/sai, phần trăm, hiệu ứng confetti khi điểm cao.
- **Hẹn giờ làm bài** – tùy chọn thời gian giới hạn cho mỗi đề.
- **Xuất / Nhập JSON** – lưu đề thi dưới dạng file JSON, dễ dàng chia sẻ.
- **Giao diện sáng/tối** (light/dark mode).
- **Responsive** – hoạt động tốt trên điện thoại và máy tính.

## Công nghệ

- [React 19](https://react.dev) + TypeScript (strict mode)
- [Zustand 5](https://zustand-demo.pmnd.rs) (quản lý state, persist qua localStorage)
- [Tailwind CSS 4](https://tailwindcss.com) + [DaisyUI 5](https://daisyui.com)
- [canvas-confetti](https://github.com/catdad/canvas-confetti) – hiệu ứng chúc mừng
- [Vite 7](https://vitejs.dev) – build tool
- CI/CD: GitHub Pages deploy tự động qua GitHub Actions

## Phát triển

### Yêu cầu

- Node.js >= 18

### Cài đặt

```bash
git clone https://github.com/nghiaxh/quizzy.git
cd quizzy
npm install
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```
