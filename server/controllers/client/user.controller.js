const User = require("../../models/users.model")
const bcrypt = require("bcrypt");

// [GET] /api/user/profile
module.exports.profile = async (req, res) => {
  try {
    const userId = res.locals.userId;

    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      res.status(404).json({
        message: "Nguời dùng không tồn tại!"
      });
      return;
    }
    const {
      password,
      ...userProfile
    } = user.dataValues;

    res.status(200).json({
      user: userProfile
    });
  } catch (error) {
    res.json(500).json({
      message: "Đã xảy ra lỗi khi lấy thông tin người dùng!"
    })
  }
}

// [PATCH] /api/user/change-password
module.exports.changePassword = async (req, res) => {
  try {
    const userId = res.locals.userId;
    const {
      oldPassword,
      newPassword,
      confirmNewPassword
    } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      res.status(400).json("Vui lòng gửi đủ thông tin!")
      return;
    }

    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      res.status(404).json({
        message: "Nguời dùng không tồn tại!"
      });
      return;
    }
    const password = user.dataValues.password;
    const validPassword = await bcrypt.compare(oldPassword, password);

    if (!validPassword) {
      res.status(401).json("Mật khẩu cũ không đúng!")
      return;
    }
    if (newPassword !== confirmNewPassword) {
      res.status(401).json("Xác nhận mật khẩu không khớp!")
      return;
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json("Đổi mật khẩu thành công!")
  } catch (error) {
    res.status(500).json("Đã xảy ra lỗi khi thay đổi mật khẩu!")
  }
}

// [PATCH] /api/user/update
module.exports.update = async (req, res) => {
  const userId = res.locals.userId;
  const {
    fullName,
    phoneNumber,
    address
  } = req.body;

  if (!fullName && !phoneNumber && !address) {
    return res.status(400).json("Vui lòng cung cấp thông tin cần cập nhật!");
  }

  try {
    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }

    if (fullName) user.fullName = fullName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    // Lưu thay đổi vào cơ sở dữ liệu
    await user.save();

    return res.status(200).json("Cập nhật thông tin thành công!");
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json("Đã xảy ra lỗi khi cập nhật thông tin!");
  }
}


// [PATCH] /api/user/delete
module.exports.delete = async (req, res) => {
  const userId = res.locals.userId;

  try {
    const user = await User.findOne({
      where: {
        id: userId,
        deleted: false
      }
    });

    if (!user) {
      return res.status(404).json({
        message: "Người dùng không tồn tại!"
      });
    }

    user.deleted = true;
    await user.save();

    return res.status(200).json("Xóa tài khoản thành công!");
  } catch (error) {
    console.error("Error updating user info:", error);
    return res.status(500).json("Đã xảy ra lỗi khi xóa tài khoản!");
  }
}