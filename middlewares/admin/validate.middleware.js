export const validateTour = (req, res, next) => {
  const { title, price, discount, stock } = req.body;
  const errors = [];

  if (!title || title.trim() === "") {
    errors.push("Tiêu đề không được để trống.");
  } else if (title.length < 5) {
    errors.push("Tiêu đề phải chứa ít nhất 5 ký tự.");
  }

  if (price === undefined || isNaN(price) || Number(price) < 0) {
    errors.push("Giá phải là một số lớn hơn hoặc bằng 0.");
  }

  if (discount !== undefined && discount !== "") {
    if (isNaN(discount) || Number(discount) < 0 || Number(discount) > 100) {
      errors.push("Phần trăm giảm giá phải từ 0 đến 100.");
    }
  }

  if (stock === undefined || stock === "" || isNaN(stock) || Number(stock) < 0) {
    errors.push("Số lượng (stock) phải là số lớn hơn hoặc bằng 0.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ code: "error", message: errors.join(" ") });
  }

  next();
};
