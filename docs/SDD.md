# SDD (Software Design Document) Quizzy

## 1. Tổng quan kiến trúc

Quizzy là **ứng dụng đơn trang (SPA)** không có backend. Toàn bộ logic chạy trong trình duyệt. Kiến trúc theo **luồng dữ liệu một chiều**: tương tác người dùng, Zustand store, React re render.

```
Browser
  React (View)    Zustand (State)    localStorage (Persist)
  Vite (Build)    PWA SW (Cache)
```

### Các tầng

| Tầng | Công nghệ | Trách nhiệm |
|---|---|---|
| **Giao diện** | React 19 + Framer Motion | Render component, hoạt ảnh, chuyển cảnh |
| **Trạng thái** | Zustand 5 + `persist` middleware | Một store duy nhất, đồng bộ với `localStorage` |
| **Phân tích** | TypeScript thuần (`parser.ts`) | Phân tích văn bản câu hỏi thành dữ liệu có cấu trúc |
| **Đa ngôn ngữ** | Tra cứu theo khóa (`translations.ts`) | Tiếng Việt / English |
| **Xây dựng** | Vite 7 + TypeScript | Dev server, kiểm tra kiểu, đóng gói, sinh PWA |
| **PWA** | `vite-plugin-pwa` (Workbox) | Service worker, cache ngoại tuyến, cài đặt |

---

## 2. Cây component

```
App
  SettingsModal
  TabBar (Exams | Editor | Quiz)
  AnimatePresence (chuyển trang)
    ExamsPage
      NewExamModal
      ExamCard -> ExamDetailModal
    Editor (textarea + preview, cuộn đồng bộ)
    Quiz (thanh tiến trình, đồng hồ, thẻ câu hỏi, prev/check/next)
    Result (biểu đồ vòng tròn, confetti, các nút)
    Review (danh sách câu hỏi với chỉ thị đúng/sai)
```

### Trách nhiệm các component

| Component | Props từ store | State nội bộ | Hành vi chính |
|---|---|---|---|
| `App` | `tab`, `questions`, `activeExamId` | `showSettings`, `theme` | Định tuyến tab, khung bố cục |
| `ExamsPage` | `exams` | Search term, modal state | CRUD, tìm kiếm |
| `Editor` | `rawText`, `questions` | | Textarea + preview, cuộn đồng bộ |
| `Quiz` | `questions`, `currentIndex`, `answers`... | | Hiển thị câu hỏi, phản hồi, đồng hồ |
| `Result` | `questions`, `answers`, `submitted` | | Tính điểm, biểu đồ, confetti |
| `Review` | `questions`, `answers`, `submitted` | Search term, goto | Xem lại câu hỏi dạng cuộn |
| `SettingsModal` | `shuffleQuestions`, `soundEnabled`... | | Giao diện, công tắc, ngôn ngữ |

---

## 3. Mô hình dữ liệu

### 3.1 Hình dạng trạng thái (Zustand Store)

```typescript
interface QuizStore {
  // Điều hướng
  tab: Tab;

  // Quản lý đề thi
  exams: Exam[];
  activeExamId: string | null;

  // Soạn thảo
  rawText: string;
  questions: Question[];
  originalQuestions: Question[];

  // Trạng thái bài thi
  currentIndex: number;
  answers: Record<number, number>;
  submitted: Record<number, boolean>;
  quizEndTime: number | null;
  isRedoMode: boolean;

  // Cài đặt (được lưu)
  shuffleQuestions: boolean;
  soundEnabled: boolean;
  effectsEnabled: boolean;
  timerEnabled: boolean;
  timerMinutes: number;
  language: Language;
}
```

### 3.2 Mô hình câu hỏi (nguồn chân lý runtime)

```typescript
interface Question {
  id: number;          // đánh số tuần tự từ 0
  text: string;        // nội dung (có thể chứa \n)
  options: string[];   // 2 tới 4 lựa chọn
  correctIndex: number; // chỉ số của đáp án đúng trong options[]
}
```

### 3.3 Lưu trữ

`partialize` trong middleware `persist` của Zustand chọn các trường được lưu:

```typescript
partialize: (s) => ({
  exams: s.exams,
  shuffleQuestions: s.shuffleQuestions,
  soundEnabled: s.soundEnabled,
  effectsEnabled: s.effectsEnabled,
  timerEnabled: s.timerEnabled,
  timerMinutes: s.timerMinutes,
  language: s.language,
})
```

Các trạng thái còn lại (tab, currentIndex, answers...) là tạm thời, mất khi tải lại trang.

### 3.4 Định dạng xuất

```typescript
{
  version: "0.5.0",
  exportedAt: 1234567890,
  exams: Exam[],
  settings: {
    shuffleQuestions: boolean,
    soundEnabled: boolean,
    effectsEnabled: boolean,
    timerEnabled: boolean,
    timerMinutes: number
  }
}
```

---

## 4. Luồng dữ liệu

### 4.1 Luồng bài thi

```
Người dùng chọn đề thi
  ExamsPage.click -> selectExam(id)
    parseQuestions(rawText) -> questions[] + originalQuestions[]
    setTab("editor")

Người dùng sửa câu hỏi (tùy chọn)
  Editor.onChange -> setRawText(text)
    parseQuestions(text) -> questions[]
    tự động lưu vào đề thi

Người dùng bấm tab Quiz
  setTab("quiz") -> startQuiz()
    xáo trộn? -> shuffleArray(questions[])
    reset answers, submitted, currentIndex
    đồng hồ? -> set quizEndTime

Người dùng trả lời
  selectAnswer(qId, optIdx, confirm=false)  // chọn trực quan
  bấm Check -> selectAnswer(qId, optIdx, confirm=true)
    nếu đúng: phát âm thanh + bắn confetti
    đánh dấu submitted[questionId] = true

Câu cuối + đã nộp hết -> nextQuestion() -> setTab("result")
Hết giờ -> submitAllAndFinish() -> setTab("result")

Trang kết quả
  score() = lọc submitted & correct -> length
  biểu đồ vòng tròn SVG, nhận xét, confetti nếu >= 80%
```

### 4.2 Xuất nhập

```
Xuất -> exportToFile()
  JSON.stringify({ exams, settings })
  Blob -> <a download> -> URL.createObjectURL

Nhập -> importFromFile(file)
  file.text() -> JSON.parse
  set({ exams, shuffleQuestions, ... })
```

---

## 5. Chi tiết quản lý trạng thái

### 5.1 Các phương thức chính

| Phương thức | Kích hoạt | Tác dụng |
|---|---|---|
| `createExam(name, rawText?)` | Nút Tạo đề mới | Thêm exam vào danh sách |
| `selectExam(id)` | Bấm thẻ đề thi | Phân tích văn bản, chuyển sang editor |
| `setRawText(text)` | Gõ phím trong Editor | Phân tích lại, cập nhật, tự lưu |
| `startQuiz()` | Bấm tab Quiz | Xáo trộn (nếu bật), reset, đặt đồng hồ |
| `selectAnswer(id, idx, confirm)` | Chọn + Kiểm tra | Hai pha: chọn rồi xác nhận. Phát âm thanh/confetti |
| `submitAllAndFinish()` | Hết giờ | Điền câu chưa trả lời, sang kết quả |
| `redoIncorrect()` | Nút trên Result | Lọc câu sai, bắt đầu bài thi nhỏ (không đồng hồ) |

### 5.2 Chọn đáp án hai pha

```
Pha 1: Người dùng bấm lựa chọn -> selectAnswer(id, idx, confirm=false)
  lưu answer vào answers[id] (tô sáng trực quan)
  nút đổi thành "Kiểm tra"

Pha 2: Người dùng bấm "Kiểm tra" -> selectAnswer(id, idx, confirm=true)
  khóa nộp bài, hiện phản hồi (xanh/đỏ)
  phát âm thanh + confetti nếu đúng
  đánh dấu submitted[id] = true
  "Kiểm tra" thành "Tiếp"
```

---

## 6. Thiết kế bộ phân tích

### 6.1 Định dạng

```
1. Nội dung câu hỏi (có thể nhiều dòng)
*A. Đáp án đúng
B. Đáp án sai
C. Đáp án sai
D. Đáp án sai

2. Câu hỏi tiếp theo
A. Lựa chọn 1
*B. Lựa chọn 2
```

### 6.2 Giải thuật

```
Đầu vào: chuỗi văn bản thô
1. Tách bằng /\n{2,}/ (một hoặc nhiều dòng trống)
2. Với mỗi khối không rỗng:
   a. Dòng đầu phải khớp /^\d+\.\s+(.+)/
   b. Các dòng sau khớp /^(\*?)([A-D])\.\s+(.+)/
   c. Dòng không khớp định dạng lựa chọn:
      trước lựa chọn đầu: nối vào nội dung câu hỏi
      sau một lựa chọn: nối vào nội dung lựa chọn đó (nhiều dòng)
   d. Yêu cầu >= 2 lựa chọn và đúng một đáp án đúng (đánh dấu *)
3. Bỏ khối không hợp lệ
4. Gán id tuần tự từ 0
Đầu ra: Question[]
```

---

## 7. Thiết kế đa ngôn ngữ

```typescript
const en = { "key": "English string" };
const vi = { "key": "Vietnamese string" };
const translations = { en, vi };

function t(lang: Language, key: string): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}
```

- Kiểu `Language`: `"en" | "vi"`
- Lưu trong Zustand persisted state
- Dùng qua hook `useTranslation()`

---

## 8. PWA

- **Plugin**: `vite-plugin-pwa` với Workbox
- **Service Worker**: Sinh ở build time, precache toàn bộ static assets
- **Ngoại tuyến**: Hoạt động đầy đủ sau lần tải đầu
- **Cài đặt**: Dùng `beforeinstallprompt` của trình duyệt
- **CI**: GitHub Actions build và deploy lên GitHub Pages khi push lên `main`

---

## 9. Xây dựng và kiểm thử

```bash
npm run dev            # Vite dev server, cong localhost:5173
npm run build          # tsc + vite build (kiểm tra kiểu trước)
npm test               # vitest (watch mode)
npm run test:run       # vitest một lần
npm run test:coverage  # vitest kèm báo cáo coverage
```

- File test đặt cùng thư mục với file nguồn
- Không có linting; `tsc` là cổng kiểm tra duy nhất

---

## 10. Hệ thống giao diện

- DaisyUI dùng thuộc tính `data-theme` trên thẻ `<html>`
- Lưu trong `localStorage` key `theme`
- Chuyển Sáng/Tối trong modal Cài đặt
- Mặc định: `"light"`
