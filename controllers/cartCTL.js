const jwt = require("jsonwebtoken");

// Lưu trữ giỏ hàng trong bộ nhớ
const carts = new Map(); // Map với key là MaKH và value là danh sách sản phẩm

const addToCart = () => (req, res) => {
  const { authorization } = req.headers; // Lấy token từ header
  const { MaSP, TenSP, GiaBan, Anh, SoLuong } = req.body; // Dữ liệu sản phẩm cần thêm vào giỏ hàng

  // Kiểm tra nếu thiếu token hoặc dữ liệu sản phẩm
  if (!authorization || !MaSP || !TenSP || !GiaBan || !Anh || !SoLuong) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết trong yêu cầu",
    });
  }

  try {
    // Xác minh token
    const token = authorization.split(" ")[1]; // Loại bỏ "Bearer " khỏi chuỗi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy giỏ hàng của người dùng từ bộ nhớ
    const userId = decoded.id;
    const userCart = carts.get(userId) || [];

    // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
    const existingProduct = userCart.find((item) => item.MaSP === MaSP);
    if (existingProduct) {
      // Nếu tồn tại, cập nhật số lượng
      existingProduct.SoLuong += SoLuong;
    } else {
      // Nếu chưa tồn tại, thêm sản phẩm mới
      userCart.push({ MaSP, TenSP, GiaBan, Anh, SoLuong });
    }

    // Cập nhật giỏ hàng trong bộ nhớ
    carts.set(userId, userCart);

    res.status(200).json({
      success: true,
      message: "Sản phẩm đã được thêm vào giỏ hàng",
      cart: userCart,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi thêm sản phẩm vào giỏ hàng",
    });
  }
};

const getCart = () => (req, res) => {
  const { authorization } = req.headers;

  // Kiểm tra nếu thiếu token
  if (!authorization) {
    return res.status(400).json({
      success: false,
      message: "Thiếu token trong yêu cầu",
    });
  }

  try {
    // Xác minh token
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy giỏ hàng của người dùng
    const userId = decoded.id;
    const userCart = carts.get(userId) || [];

    // Tính số lượng sản phẩm có mã khác nhau
    const distinctProductCount = userCart.length;

    // Tính tổng tiền
    const totalAmount = userCart.reduce(
      (sum, product) => sum + product.SoLuong * product.GiaBan,
      0
    );

    // Trả về giỏ hàng cùng với số lượng sản phẩm và tổng tiền
    res.status(200).json({
      success: true,
      cart: userCart,
      distinctProductCount,
      totalAmount,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    console.error("Lỗi khi lấy giỏ hàng: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy giỏ hàng",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
};
