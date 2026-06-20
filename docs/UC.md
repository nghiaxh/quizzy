# UC (Use Cases) Quizzy

## Tác nhân

| Tác nhân | Mô tả |
|---|---|
| **Học sinh** | Người dùng cuối tạo đề thi, luyện tập và học với thẻ ghi nhớ |

---

## UC-01: Tạo đề thi

**Tác nhân:** Học sinh

**Điều kiện trước:** Ứng dụng đã tải, đang ở trang Exams

**Điều kiện sau:** Đề thi mới xuất hiện trong danh sách

**Luồng chính:**
1. Học sinh bấm "Tạo đề mới"
2. Hệ thống hiện modal với ô nhập tên
3. Học sinh nhập tên và bấm "Tạo"
4. Hệ thống tạo đề thi với nội dung rỗng, thêm vào danh sách
5. Hệ thống đóng modal

**Thay thế:**
- 3a. Học sinh để trống tên, hệ thống đặt mặc định "Đề mới"

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as ExamsPage
    participant Store as Zustand Store
    participant LS as localStorage

    S->>UI: Bấm "Tạo đề mới"
    UI->>S: Hiện modal nhập tên
    S->>UI: Nhập tên, bấm "Tạo"
    UI->>Store: createExam(name)
    Store->>Store: Sinh id, tạo Exam obj
    Store-->>UI: Cập nhật danh sách
    Store->>LS: Lưu (qua middleware)
    UI->>S: Đóng modal, hiện danh sách mới
```

---

## UC-02: Xóa đề thi

**Tác nhân:** Học sinh

**Điều kiện trước:** Có ít nhất một đề thi

**Điều kiện sau:** Đề thi bị xóa khỏi danh sách

**Luồng chính:**
1. Học sinh bấm nút xóa trên thẻ đề thi
2. Hệ thống hiện hộp thoại xác nhận
3. Học sinh xác nhận
4. Hệ thống xóa đề thi

**Thay thế:**
- 3a. Học sinh hủy, không có gì xảy ra

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as ExamCard
    participant Store as Zustand Store

    S->>UI: Bấm xóa
    UI->>S: Hiện xác nhận
    S->>UI: Xác nhận
    UI->>Store: deleteExam(id)
    Store-->>UI: Cập nhật danh sách
```

---

## UC-03: Soạn câu hỏi

**Tác nhân:** Học sinh

**Điều kiện trước:** Đã chọn một đề thi

**Điều kiện sau:** Câu hỏi được cập nhật và lưu

**Luồng chính:**
1. Học sinh đang ở tab Editor
2. Học sinh gõ vào ô soạn thảo
3. Hệ thống phân tích văn bản sau mỗi lần gõ
4. Hệ thống cập nhật bản xem trước
5. Hệ thống tự động lưu vào đề thi

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as Editor
    participant Parser as parser.ts
    participant Store as Zustand Store
    participant LS as localStorage

    S->>UI: Gõ vào textarea
    UI->>Store: setRawText(text)
    Store->>Parser: parseQuestions(text)
    Parser-->>Store: Question[]
    Store-->>UI: Render lại preview
    Store->>LS: Tự lưu vào exam
```

---

## UC-04: Làm bài thi

**Tác nhân:** Học sinh

**Điều kiện trước:** Đề thi có ít nhất một câu hỏi hợp lệ

**Điều kiện sau:** Kết thúc bài thi, hiển thị kết quả

**Luồng chính:**
1. Học sinh bấm tab Quiz
2. Hệ thống xáo trộn câu hỏi (nếu bật), reset đồng hồ
3. Hệ thống hiển thị câu hỏi đầu tiên với các lựa chọn
4. Học sinh chọn đáp án, hệ thống tô sáng lựa chọn
5. Học sinh bấm "Kiểm tra", hệ thống hiện phản hồi đúng/sai
6. Học sinh bấm "Tiếp", hệ thống hiện câu tiếp theo
7. Lặp lại bước 4 tới 6 cho tất cả câu hỏi
8. Ở câu cuối, học sinh bấm "Xem kết quả"
9. Hệ thống hiển thị trang kết quả với điểm, biểu đồ và các nút

**Mở rộng:**
- 5a. Nếu đúng AND bật âm thanh, phát âm thanh
- 5b. Nếu đúng AND bật hiệu ứng, bắn confetti
- 3a. Nếu bật đồng hồ, hệ thống hiện đếm ngược và tự nộp khi hết giờ

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as Quiz
    participant Store as Zustand Store

    S->>UI: Bấm tab Quiz
    UI->>Store: setTab("quiz") -> startQuiz()
    Store-->>UI: questions[], reset state
    loop Với mỗi câu hỏi
        UI->>S: Hiện câu hỏi + lựa chọn
        S->>UI: Chọn đáp án
        S->>UI: Bấm "Kiểm tra"
        UI->>Store: selectAnswer(id, idx, confirm=true)
        alt đúng
            Store->>UI: Tô xanh
            Store->>UI: Phát âm thanh + confetti
        else sai
            Store->>UI: Tô đỏ, hiện đáp án đúng
        end
        S->>UI: Bấm "Tiếp" (hoặc "Xem kết quả")
        UI->>Store: nextQuestion()
        alt câu cuối + đã nộp hết
            Store-->>UI: tab = "result"
        else chưa phải câu cuối
            Store-->>UI: currentIndex++
        end
    end
    Note over S,Store: Hết giờ -> submitAllAndFinish()
```

---

## UC-05: Xem lại đáp án

**Tác nhân:** Học sinh

**Điều kiện trước:** Đã hoàn thành bài thi, đang ở trang kết quả

**Điều kiện sau:** Học sinh xem lại tất cả câu hỏi với chỉ thị đúng/sai

**Luồng chính:**
1. Học sinh bấm "Xem lại" trên trang kết quả
2. Hệ thống hiển thị tất cả câu hỏi trong danh sách cuộn
3. Mỗi câu hỏi hiện: nội dung, các lựa chọn, đánh dấu đáp án đúng và đáp án đã chọn
4. Học sinh có thể tìm theo nội dung hoặc điều hướng theo số
5. Học sinh bấm "Quay lại" để trở về

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as Review / Result
    participant Store as Zustand Store

    S->>UI: Bấm "Xem lại"
    UI->>Store: tab = "review"
    Store-->>UI: questions[], answers[], submitted[]
    UI->>S: Hiện câu hỏi với chỉ thị
    S->>UI: Tìm kiếm / điều hướng
    S->>UI: Bấm "Quay lại"
    UI->>Store: setTab("result")
```

---

## UC-06: Làm lại câu sai

**Tác nhân:** Học sinh

**Điều kiện trước:** Đã hoàn thành bài thi, có ít nhất một câu sai

**Điều kiện sau:** Phiên thi nhỏ chỉ gồm các câu đã sai

**Luồng chính:**
1. Học sinh bấm "Làm lại câu sai" trên trang kết quả
2. Hệ thống lọc các câu trả lời sai
3. Hệ thống bắt đầu bài thi chỉ với các câu đó (tắt đồng hồ, xáo trộn nếu bật)
4. Học sinh trả lời và tiếp tục như UC-04
5. Khi hoàn thành, hệ thống hiển thị kết quả cho phiên làm lại

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as Result
    participant Store as Zustand Store

    S->>UI: Bấm "Làm lại câu sai"
    UI->>Store: redoIncorrect()
    Store->>Store: Lọc câu sai
    Store-->>UI: tab = "quiz", isRedoMode = true
    Note over Store: quizEndTime = null (không đồng hồ)
    S->>UI: Trả lời câu sai
    UI->>Store: submit
    Store-->>UI: tab = "result"
```

---

## UC-07: Học với thẻ ghi nhớ

**Tác nhân:** Học sinh

**Điều kiện trước:** Đề thi có ít nhất một câu hỏi hợp lệ

**Điều kiện sau:** Kết thúc phiên thẻ, hiển thị tổng kết

**Luồng chính:**
1. Học sinh bấm tab Flashcards
2. Hệ thống xáo trộn câu hỏi (nếu bật)
3. Hệ thống hiển thị câu hỏi đầu tiên dưới dạng thẻ
4. Học sinh chạm thẻ, hệ thống hiện đáp án
5. Học sinh đánh giá: "Đã thuộc" hoặc "Chưa thuộc"
6. Học sinh bấm "Tiếp", hệ thống hiện thẻ tiếp theo
7. Lặp lại bước 4 tới 6 cho tất cả thẻ
8. Ở thẻ cuối, học sinh bấm "Xem tổng kết"
9. Hệ thống hiển thị FlashcardResult với biểu đồ

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as Flashcards
    participant Store as Zustand Store

    S->>UI: Bấm tab Flashcards
    UI->>Store: setTab("flashcards") -> startFlashcards()
    Store-->>UI: questions[], reset state
    loop Với mỗi thẻ
        UI->>S: Hiện câu hỏi (ẩn đáp án)
        S->>UI: Chạm thẻ
        UI->>Store: revealCard(id)
        UI->>S: Hiện đáp án
        S->>UI: Đánh giá "Đã thuộc" / "Chưa thuộc"
        UI->>Store: rateCard(id, boolean)
        S->>UI: Bấm "Tiếp"
        UI->>Store: nextFlashcard()
        alt thẻ cuối + đã đánh giá hết
            Store-->>UI: tab = "flashcardResult"
        else
            Store-->>UI: flashcardCurrentIndex++
        end
    end
```

---

## UC-08: Ôn lại câu chưa thuộc

**Tác nhân:** Học sinh

**Điều kiện trước:** Đã hoàn thành phiên thẻ, có ít nhất một thẻ "Chưa thuộc"

**Điều kiện sau:** Phiên thẻ nhỏ chỉ gồm các thẻ chưa thuộc

**Luồng chính:**
1. Học sinh bấm "Ôn lại câu chưa thuộc" trên trang FlashcardResult
2. Hệ thống lọc các thẻ đánh giá "Chưa thuộc"
3. Hệ thống bắt đầu phiên thẻ chỉ với các thẻ đó
4. Học sinh học như UC-07

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as FlashcardResult
    participant Store as Zustand Store

    S->>UI: Bấm "Ôn lại câu chưa thuộc"
    UI->>Store: redoFlashcardMissed()
    Store->>Store: Lọc thẻ rated false
    Store-->>UI: tab = "flashcards"
    S->>UI: Học thẻ chưa thuộc
    UI->>Store: rateCard + nextFlashcard
    Store-->>UI: tab = "flashcardResult" khi xong
```

---

## UC-09: Xuất đề thi

**Tác nhân:** Học sinh

**Điều kiện trước:** Có ít nhất một đề thi

**Điều kiện sau:** File JSON được tải xuống

**Luồng chính:**
1. Học sinh bấm "Xuất" (qua Cài đặt hoặc menu)
2. Hệ thống chuyển đề thi và cài đặt thành JSON
3. Hệ thống kích hoạt tải file qua thẻ `<a>`

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant Store as Zustand Store
    participant DOM as Browser DOM

    S->>Store: exportToFile()
    Store->>Store: JSON.stringify(exams, settings)
    Store->>DOM: Tạo Blob, <a download>
    DOM->>S: Tải file quizzy-export-YYYY-MM-DD.json
```

---

## UC-10: Nhập đề thi

**Tác nhân:** Học sinh

**Điều kiện trước:** Người dùng có file JSON xuất từ Quizzy

**Điều kiện sau:** Đề thi và cài đặt được tải vào ứng dụng

**Luồng chính:**
1. Học sinh bấm "Nhập"
2. Hệ thống mở hộp thoại chọn file
3. Học sinh chọn file `.json`
4. Hệ thống đọc và phân tích file
5. Hệ thống thay thế đề thi và cài đặt hiện tại bằng dữ liệu đã nhập

**Thay thế:**
- 4a. File JSON không hợp lệ, hiển thị thông báo lỗi

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as ExamsPage
    participant Store as Zustand Store

    S->>UI: Bấm "Nhập"
    UI->>S: Hộp thoại chọn file
    S->>UI: Chọn file .json
    UI->>Store: importFromFile(file)
    Store->>Store: JSON.parse(text)
    alt hợp lệ
        Store-->>UI: Cập nhật exams + settings
    else không hợp lệ
        Store-->>UI: Hiện thông báo lỗi
    end
```

---

## UC-11: Thay đổi cài đặt

**Tác nhân:** Học sinh

**Điều kiện trước:** Ứng dụng đang mở

**Điều kiện sau:** Cài đặt được cập nhật và lưu

**Luồng chính:**
1. Học sinh bấm biểu tượng Cài đặt (hình bánh răng)
2. Hệ thống hiện modal Cài đặt
3. Học sinh bật/tắt các tùy chọn: giao diện, xáo trộn, âm thanh, hiệu ứng, đồng hồ, ngôn ngữ
4. Hệ thống cập nhật Zustand store sau mỗi thay đổi
5. Hệ thống lưu vào `localStorage`
6. Học sinh đóng modal

```mermaid
sequenceDiagram
    actor S as Hoc sinh
    participant UI as SettingsModal
    participant Store as Zustand Store
    participant LS as localStorage

    S->>UI: Mở Cài đặt
    UI->>S: Hiện modal cài đặt
    S->>UI: Bật/tắt xáo trộn / âm thanh / đồng hờ / ngôn ngữ
    UI->>Store: Cập nhật setting
    Store->>LS: Lưu
    S->>UI: Đổi giao diện
    UI->>UI: document.documentElement.setAttribute("data-theme", ...)
    UI->>LS: localStorage.setItem("theme", ...)
    S->>UI: Đóng modal
```

---

## Sơ đồ use case

```mermaid
graph TD
    HS(["Học sinh"])

    UC01["UC-01: Tạo đề thi"]
    UC02["UC-02: Xóa đề thi"]
    UC03["UC-03: Soạn câu hỏi"]
    UC04["UC-04: Làm bài thi"]
    UC05["UC-05: Xem lại đáp án"]
    UC06["UC-06: Làm lại câu sai"]
    UC07["UC-07: Học với thẻ ghi nhớ"]
    UC08["UC-08: Ôn lại câu chưa thuộc"]
    UC09["UC-09: Xuất đề thi"]
    UC10["UC-10: Nhập đề thi"]
    UC11["UC-11: Thay đổi cài đặt"]

    HS --> UC01
    HS --> UC02
    HS --> UC03
    HS --> UC04
    HS --> UC05
    HS --> UC06
    HS --> UC07
    HS --> UC08
    HS --> UC09
    HS --> UC10
    HS --> UC11

    UC04 -.->|mở rộng| UC06
    UC07 -.->|mở rộng| UC08
```
