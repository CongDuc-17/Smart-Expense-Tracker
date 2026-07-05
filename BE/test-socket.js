const { io } = require("socket.io-client");

// Lấy token từ terminal log của bạn 
// Thay chuỗi token dài loằng ngoằng dưới đây bằng access_token của bạn
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXF0bXFwYjkwMDAxN2tlY2J1MWJzMTRvIiwiaWF0IjoxNzgyNzA4MTQ4LCJleHAiOjE3ODI3MDkwNDh9.qDxOQ6Er9GQXDkyBo6dtitvDQbHk7eaa0ZstugvUZuA";

console.log("Đang thử kết nối Socket.io tới server...");

const socket = io("http://localhost:3000", {
  auth: {
    token: token
  }
});

socket.on("connect", () => {
  console.log("✅ Đã kết nối THÀNH CÔNG với Server! Socket ID:", socket.id);
  console.log("Bạn có thể kiểm tra log ở cửa sổ chạy BE (npm run dev) xem có hiện 'Socket connected...' không nhé!");

  // Thoát sau 5 giây để test xong
  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on("connect_error", (err) => {
  console.log("❌ Lỗi kết nối:", err.message);
  process.exit(1);
});
