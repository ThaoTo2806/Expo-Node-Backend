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

module.exports = {
  getAllProducts,
};
