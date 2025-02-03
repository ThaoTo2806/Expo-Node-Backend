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
      product.SoLuong += SoLuong;
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

const createOrder = (db) => async (req, res) => {
  const { NgayDat, DaThanhToan, TinhTrangGiao, MaKH } = req.body;
  const { authorization } = req.headers;

  // Kiểm tra các trường bắt buộc
  if (!NgayDat || DaThanhToan === undefined || !TinhTrangGiao || !MaKH) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Kiểm tra token
  if (!authorization) {
    return res.status(400).json({ message: "Missing authorization token" });
  }

  try {
    // Xác minh token
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy giỏ hàng của người dùng
    const userId = decoded.id;
    const userCart = carts.get(userId) || [];

    if (userCart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Tính toán ngày giao hàng
    const ngayDatDate = new Date(NgayDat);
    const ngayGiaoDate = new Date(ngayDatDate);
    ngayGiaoDate.setDate(ngayDatDate.getDate() + 3);
    const NgayGiao = ngayGiaoDate.toISOString().split("T")[0];

    // Thực hiện truy vấn để tạo đơn hàng
    const orderSql = `INSERT INTO donhang (NgayDat, NgayGiao, DaThanhToan, TinhTrangGiao, MaKH) VALUES (?, ?, ?, ?, ?)`;
    const orderValues = [NgayDat, NgayGiao, DaThanhToan, TinhTrangGiao, MaKH];

    db.query(orderSql, orderValues, (err, orderResult) => {
      if (err) {
        console.error("Error inserting order:", err);
        return res
          .status(500)
          .json({ message: "Error creating order", error: err });
      }

      const newOrderId = orderResult.insertId;
      const detailsSql = `INSERT INTO chitietdonhang (MaDonHang, MaSP, SoLuong, DonGia) VALUES ?`;
      const detailsValues = userCart.map((product) => [
        newOrderId,
        product.MaSP,
        product.SoLuong,
        product.GiaBan,
      ]);

      // Thực hiện truy vấn để tạo chi tiết đơn hàng
      db.query(detailsSql, [detailsValues], (err) => {
        if (err) {
          console.error("Error inserting order details:", err);
          return res
            .status(500)
            .json({ message: "Error creating order details", error: err });
        }

        // Xóa giỏ hàng sau khi tạo đơn hàng thành công
        carts.delete(userId);

        // Trả về thông tin đơn hàng đã tạo
        res.status(201).json({
          message: "Order created successfully",
          order: {
            MaDonHang: newOrderId,
            NgayDat,
            NgayGiao,
            DaThanhToan,
            TinhTrangGiao,
            MaKH,
          },
        });
      });
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCart,
  deleteFromCart,
  createOrder,
};
