const jwt = require("jsonwebtoken"); // Import thư viện jsonwebtoken

const getUserByCredentials = (db) => async (req, res) => {
  const { username, password } = req.body;

  // Kiểm tra nếu thiếu thông tin đầu vào
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Thiếu username hoặc password trong yêu cầu",
    });
  }

  try {
    // Thực thi truy vấn cơ sở dữ liệu
    const [results] = await db.promise().query(
      `
        SELECT MaKH, TaiKhoan, HoTen, Email, DiaChi
        FROM khachhang
        WHERE TaiKhoan = ? AND MatKhau = ?
      `,
      [username, password]
    );

    // Kiểm tra nếu không tìm thấy khách hàng
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Không tìm thấy khách hàng với tài khoản và mật khẩu đã cung cấp",
      });
    }

    // Tạo accessToken (ví dụ: JWT)
    const user = results[0];
    const accessToken = jwt.sign(
      {
        id: user.MaKH,
        username: user.TaiKhoan,
        email: user.Email,
      },
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "30s" } // Token hết hạn sau 30s
    );

    // Trả về accessToken và thông tin khách hàng
    res.status(200).json({
      success: true,
      accessToken,
      data: user,
    });
  } catch (err) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu: ", err);
    res.status(500).json({
      success: false,
      message: "Lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

module.exports = {
  getUserByCredentials,
};
