const express = require("express");
const mysql = require("mysql2");
require("dotenv").config();

const productController = require("./controllers/productCTL");
const userController = require("./controllers/userCTL");
const cartController = require("./controllers/cartCTL");

const app = express();
const port = process.env.PORT || 5000;
const host = "192.168.1.7";

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

// Tuyến API sản phẩm
app.get("/api/sanpham", (req, res) =>
  productController.getAllProducts(db)(req, res)
);
app.get("/api/sanpham/:MaSP", (req, res) =>
  productController.getProductDetail(db)(req, res)
);

// Tuyến API người dùng
app.post("/api/khachhang/dangnhap", (req, res) =>
  userController.getUserByCredentials(db)(req, res)
);

// Tuyến API giỏ hàng
app.post("/api/giohang", (req, res) => cartController.addToCart(db)(req, res));
app.get("/api/giohang", (req, res) => cartController.getCart(db)(req, res));
app.put("/api/giohang/:productId", (req, res) =>
  cartController.updateCart(db)(req, res)
);
app.delete("/api/giohang/:productId", (req, res) =>
  cartController.deleteFromCart(db)(req, res)
);

app.post("/api/donhang", (req, res) =>
  cartController.createOrder(db)(req, res)
);

app.listen(port, host, () => {
  console.log(`Server đang chạy tại http://${host}:${port}`);
});
