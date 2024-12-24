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

const updateCart = () => (req, res) => {
  const { authorization } = req.headers;
  const { SoLuong } = req.body; // Dữ liệu số lượng mới
  const { productId } = req.params; // Lấy productId từ URL

  // Kiểm tra nếu thiếu token hoặc dữ liệu cần thiết
  if (!authorization || !productId || SoLuong == null) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết trong yêu cầu",
    });
  }

  try {
    // Xác minh token
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy giỏ hàng của người dùng
    const userId = decoded.id;
    const userCart = carts.get(userId) || [];

    // Tìm sản phẩm cần cập nhật
    const product = userCart.find((item) => item.MaSP === parseInt(productId));

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng",
      });
    }

    // Cập nhật số lượng
    if (SoLuong > 0) {
      product.SoLuong = SoLuong;
    } else {
      // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
      const index = userCart.indexOf(product);
      if (index > -1) {
        userCart.splice(index, 1);
      }
    }

    // Cập nhật giỏ hàng trong bộ nhớ
    carts.set(userId, userCart);

    res.status(200).json({
      success: true,
      message: "Cập nhật số lượng sản phẩm thành công",
      cart: userCart,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    console.error("Lỗi khi cập nhật giỏ hàng: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật giỏ hàng",
    });
  }
};

const deleteFromCart = () => (req, res) => {
  const { authorization } = req.headers; // Lấy token từ header
  const { productId } = req.params; // Lấy mã sản phẩm từ URL

  // Kiểm tra nếu thiếu token hoặc mã sản phẩm
  if (!authorization || !productId) {
    return res.status(400).json({
      success: false,
      message: "Thiếu thông tin cần thiết trong yêu cầu",
    });
  }

  try {
    // Xác minh token
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy giỏ hàng của người dùng
    const userId = decoded.id;
    const userCart = carts.get(userId) || [];

    // Tìm sản phẩm cần xóa
    const productIndex = userCart.findIndex(
      (item) => item.MaSP === parseInt(productId)
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm không tồn tại trong giỏ hàng",
      });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    userCart.splice(productIndex, 1);

    // Cập nhật giỏ hàng trong bộ nhớ
    carts.set(userId, userCart);

    res.status(200).json({
      success: true,
      message: "Sản phẩm đã được xóa khỏi giỏ hàng",
      cart: userCart,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  deleteFromCart,
};
