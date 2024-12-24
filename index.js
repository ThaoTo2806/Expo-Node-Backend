const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const productController = require("./controllers/productCTL");
const userController = require("./controllers/userCTL");
const cartController = require("./controllers/cartCTL");

const app = express();
const port = process.env.PORT || 5000;
const host = "192.168.1.8";

// Middleware để parse JSON
app.use(express.json());

// Kết nối database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Lỗi kết nối đến cơ sở dữ liệu: ", err);
    return;
  }
  console.log("Kết nối đến cơ sở dữ liệu thành công");
});

app.get("/api/sanpham", productController.getAllProducts(db));
app.get("/api/sanpham/:MaSP", productController.getProductDetail(db));
app.post("/api/khachhang/dangnhap", userController.getUserByCredentials(db));
app.post("/api/giohang", cartController.addToCart()); // Thêm sản phẩm vào giỏ hàng
app.get("/api/giohang", cartController.getCart()); // Lấy giỏ hàng
app.put("/api/giohang/:productId", cartController.updateCart());

app.listen(port, host, () => {
  console.log(`Server đang chạy tại http://${host}:${port}`);
});
