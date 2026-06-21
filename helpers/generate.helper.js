import crypto from "crypto";

// Generate Mã đơn hàng
export const generateOrderCode = (number) => {
  const code = `OD${String(number).padStart(8, '0')}`;

  // ${String(n)}: Chuyển đổi giá trị của biến n thành một chuỗi.
  // .padStart(8, '0'): Phương thức padStart được sử dụng để thêm ký tự '0' vào đầu chuỗi sao cho chuỗi có chiều dài là 8. Trong trường hợp này, nếu chuỗi ký tự số có chiều dài ít hơn 8, thì các ký tự '0' sẽ được thêm vào đầu chuỗi để đảm bảo chuỗi có độ dài là 8.
  // Ví dụ:
    // Nếu number = 1, kết quả sẽ là 'OD00000001'.
    // Nếu number = 20, kết quả sẽ là 'OD00000020'.
    // Nếu number = 234, kết quả sẽ là 'OD00000234'.

  return code;
};

// Generate Mã tour
export const generateTourCode = (number) => {
  const code = `TOUR${String(number).padStart(6, '0')}`;
  return code;
};

// Generate token ngẫu nhiên (dùng cho xác thực tài khoản admin)
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Hash password bằng scrypt (Đồng bộ)
export const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

// So sánh password (nhập vào) với hash đã lưu (Đồng bộ)
export const comparePassword = (password, storedPasswordHash) => {
  try {
    const [salt, hash] = storedPasswordHash.split(":");
    if (!salt || !hash) return false;
    const currentHash = crypto.scryptSync(password, salt, 64).toString("hex");
    return currentHash === hash;
  } catch {
    return false;
  }
};

// Hash password bằng scrypt (Bất đồng bộ)
export const hashPasswordAsync = (password) => {
  return new Promise((resolve, reject) => {
    // 1. Tạo salt ngẫu nhiên (bất đồng bộ)
    crypto.randomBytes(16, (err, saltBuffer) => {
      if (err) return reject(err);
      const salt = saltBuffer.toString("hex");
      // 2. Băm mật khẩu (bất đồng bộ - chạy dưới Thread Pool ngầm)
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return reject(err);
        
        // Trả kết quả về qua resolve của Promise
        resolve(`${salt}:${derivedKey.toString("hex")}`);
      });
    });
  });
};

// So sánh password (nhập vào) với hash đã lưu (Bất đồng bộ)
export const comparePasswordAsync = (password, storedPasswordHash) => {
  return new Promise((resolve) => {
    try {
      const [salt, hash] = storedPasswordHash.split(":");
      if (!salt || !hash) return resolve(false);

      // Băm mật khẩu nhập vào bằng salt đã có (chạy dưới Thread Pool ngầm)
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return resolve(false);
        const currentHash = derivedKey.toString("hex");
        resolve(currentHash === hash);
      });
    } catch {
      resolve(false);
    }
  });
};


