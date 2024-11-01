const User = require("../../models/users.model");
const bcrypt = require("bcrypt");
const jwtHelpers = require("../../helpers/jwt.helper");
const RefreshToken = require("../../models/refreshToken.model");
const jwt = require('jsonwebtoken');


// [POST] /api/auth/register
module.exports.register = async (req, res) => {
  try {
    const existEmail = await User.findOne({
      where: {
        email: req.body.email,
      }
    })
    if (existEmail) {
      return res.status(409).json({
        message: 'Email đã tồn tại'
      });
    }
    if (!req.body.password) {
      res.status(400).json({
        message: "Mật khẩu chưa được gửi lên!"
      });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const record = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: hashedPassword,
      address: req.body.address ? req.body.address : "",
      phoneNumber: req.body.phoneNumber ? req.body.phoneNumber : ""
    })

    res.json({
      status: 201,
      message: "Tạo tài khoản thành công!",
    })
  } catch (error) {
    console.error("Lỗi đăng ký tài khoản người dùng:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error
    });
  }
}

// [POST] /api/auth/login
module.exports.login = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({
      where: {
        email: email,
        deleted: false
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    })
    if (!user) {
      return res.status(404).json({
        message: 'Email không tồn tại'
      });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
      res.status(401).json("Mật khẩu không chính xác!");
      return;
    }

    const accessToken = jwtHelpers.generateAccessToken(user.id);
    const refreshToken = jwtHelpers.generateRefreshToken(user.id);

    const existingToken = await RefreshToken.findOne({
      where: {
        userId: user.id
      }
    });

    if (existingToken) {
      existingToken.token = refreshToken;
      await existingToken.save();
    } else {
      await RefreshToken.create({
        userId: user.id,
        token: refreshToken
      });
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "strict",
    });

    const {
      password,
      ...newUser
    } = user.dataValues;

    res.json({
      status: 200,
      user: newUser,
      accessToken: accessToken
    })
  } catch (error) {
    res.status(500).json({
      message: "Đăng nhập không thành công!"
    })
  }
};

// [POST] /api/auth/refresh-token 
module.exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    res.status(401).json({
      message: "Bạn chưa được xác thực!"
    });
    return;
  }

  try {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        res.status(403).json("User not authorized");
        return;
      }
      if (typeof decoded === "string" || decoded === undefined) {
        throw new Error("Invalid decoded data");
      }

      const storedToken = await RefreshToken.findOne({
        where: {
          userId: decoded.userId,
          token: token
        }
      });

      if (!storedToken) {
        res.status(403).json({
          message: "Token không hợp lệ!"
        })
      }
      const newAccessToken = jwtHelpers.generateAccessToken(storedToken.dataValues.userId);
      const newRefreshToken = jwtHelpers.generateRefreshToken(storedToken.dataValues.userId);

      storedToken.token = newRefreshToken;
      await storedToken.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        path: "/",
        secure: false,
        sameSite: "strict",
      })

      res.status(200).json({
        accessToken: newAccessToken
      });
    });
  } catch (error) {
    console.error("Error refreshing access token:", error);
    res.status(403).json({
      message: "Refresh token không hợp lệ"
    });
  }
}

// [GET] /api/auth/logout
module.exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(403).json("Token not required");
    return;
  }
  await RefreshToken.destroy({
    where: {
      token: refreshToken,
    }
  });
  res.clearCookie("refreshToken");
  res.status(200).json("Logout success");
}