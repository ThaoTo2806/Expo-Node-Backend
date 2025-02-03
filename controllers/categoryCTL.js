const getLoaiWithDT = (db) => async (req, res) => {
  const query = "SELECT * FROM Loai WHERE Note LIKE '%DT%'";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu: ", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

const getLoaiWithLAP = (db) => async (req, res) => {
  const query = "SELECT * FROM Loai WHERE Note LIKE '%LAP%'";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu: ", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

const getLoaiWithPK = (db) => async (req, res) => {
  const query = "SELECT * FROM Loai WHERE Note LIKE '%PK%'";

  try {
    const results = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Lỗi khi truy vấn cơ sở dữ liệu: ", error);

    res.status(500).json({
      success: false,
      message: "Lỗi khi truy vấn cơ sở dữ liệu",
    });
  }
};

module.exports = {
  getLoaiWithDT,
  getLoaiWithLAP: getLoaiWithLAP,
  getLoaiWithPK: getLoaiWithPK,
};
