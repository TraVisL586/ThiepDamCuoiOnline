// ============================================================
// HƯỚNG DẪN CÀI ĐẶT GOOGLE APPS SCRIPT ĐỂ NHẬN RSVP
// ============================================================
//
// Bước 1: Tạo Google Sheet
//   - Vào https://sheets.google.com → tạo bảng tính mới
//   - Đặt tên: "RSVP Đám cưới Giang & Chung"
//   - Ở hàng đầu tiên (A1:F1), nhập các tiêu đề cột:
//     A1: Thời gian | B1: Họ tên | C1: Tham dự | D1: Quan hệ | E1: Số khách | F1: Lời nhắn
//
// Bước 2: Tạo Apps Script
//   - Trong Google Sheet, vào menu: Tiện ích mở rộng → Apps Script
//   - Xóa hết code mặc định, rồi DÁN toàn bộ code bên dưới vào
//   - Nhấn Ctrl+S để lưu
//
// Bước 3: Triển khai Web App
//   - Nhấn nút "Triển khai" (Deploy) → "Triển khai mới" (New deployment)
//   - Chọn loại: "Ứng dụng web" (Web app)
//   - Mô tả: "RSVP Wedding"
//   - Thực thi với tư cách: "Tôi" (Me)
//   - Ai có quyền truy cập: "Bất kỳ ai" (Anyone)
//   - Nhấn "Triển khai" (Deploy)
//   - Sao chép URL Web App được tạo ra
//
// Bước 4: Dán URL vào script.js
//   - Mở file script.js
//   - Tìm dòng: const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
//   - Thay 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL' bằng URL bạn vừa sao chép
//
// ============================================================
// CODE GOOGLE APPS SCRIPT - Sao chép phần dưới đây
// ============================================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    var name       = e.parameter.name;
    var attendance = e.parameter.attendance;
    var relation   = e.parameter.relation;
    var guests     = e.parameter.guests;
    var message    = e.parameter.message;
    
    // Map relation values to Vietnamese labels
    var relationMap = {
      'family-groom':    'Gia đình nhà trai',
      'family-bride':    'Gia đình nhà gái',
      'friend-groom':    'Bạn bè chú rể',
      'friend-bride':    'Bạn bè cô dâu',
      'colleague-groom': 'Đồng nghiệp chú rể',
      'colleague-bride': 'Đồng nghiệp cô dâu',
      'other':           'Khác'
    };
    
    var relationLabel = relationMap[relation] || relation;
    
    // Append a new row
    sheet.appendRow([
      new Date(),        // Thời gian
      name,              // Họ tên
      attendance,        // Tham dự (Có / Không)
      relationLabel,     // Quan hệ
      guests,            // Số khách đi cùng
      message            // Lời nhắn
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success', message: 'RSVP API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}
