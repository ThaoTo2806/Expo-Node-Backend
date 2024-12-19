// Hàm xử lý logic API GET /api/sanpham
const getAllProducts = (db) => (req, res) => {
  const query = "SELECT * FROM sanpham";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi khi truy vấn cơ sở dữ liệu: ", err);

      // Gửi phản hồi về cho client với mã lỗi 500 (Internal Server Error)
      return res.status(500).json({
        success: false, // Trạng thái thất bại
        message: "Lỗi khi truy vấn cơ sở dữ liệu", // Thông báo lỗi
      });
    }

    // Nếu truy vấn thành công, trả kết quả về cho client dưới dạng JSON
    res.status(200).json({
      success: true,
      data: results, // Dữ liệu trả về
    });
  });
};

//Hàm xử lú logic API GET /api/sanpham/:MaSP
const getProductDetail = (db) => async (req, res) => {
  const { MaSP } = req.params;

  if (!MaSP) {
    return res.status(400).json({
      success: false,
      message: "Thiếu MaSP trong yêu cầu",
    });
  }

  try {
    const [results] = await db.promise().query(
      `
      SELECT sanpham.MaSP, loai.TenLoai, sanpham.TenSP, sanpham.Anh, 
             sanpham.GiaBan, sanpham.SLTon, sanpham.MoTa
      FROM sanpham
      JOIN loai ON sanpham.MaLoai = loai.MaLoai
      WHERE sanpham.MaSP = ?
    `,
      [MaSP]
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm với MaSP đã cung cấp",
      });
    }

    res.status(200).json({
      success: true,
      data: results[0],
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
  getAllProducts,
  getProductDetail: getProductDetail,
};
