// src/components/Account/ModalCreateAccount.js
import React, { useState, useEffect } from "react";
import "./create.scss";
import { Modal, message } from "antd";
import { postForm } from "../../utils/axios-http/axios-http";

const ModalCreateAccount = ({ onClose, fetchAccounts, open, roles }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [newAvatar, setNewAvatar] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleNewAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("roleId", role);
    console.log(newAvatar);

    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }

    try {
      await postForm("account/create", formData);
      message.success("Tạo tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      message.error("Có lỗi xảy ra khi tạo tài khoản mới");
    } finally {
      setLoading(false);
      onClose();
      setName("");
      setEmail("");
      setRole("");
      setNewAvatar(null);
    }
  };

  return (
    <Modal
      title="Tạo mới tài khoản"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <form className="formUpdateAccount">
        <div className="item">
          <label>Ảnh đại diện: </label>
          {avatar && (
            <img
              src={avatar}
              alt="Img Preview"
              style={{
                width: 100,
                height: 100,
                marginBottom: 10,
                marginLeft: "29px",
              }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleNewAvatarChange}
            style={{ marginLeft: "33px" }}
          />
        </div>
        <div className="item">
          <label>Tên: </label>
          <input
            value={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
            style={{ marginLeft: "60px" }}
          />
        </div>
        <div className="item">
          <label>Mật khẩu: </label>
          <input
            value={password}
            type="text"
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginLeft: "23px" }}
          />
        </div>
        <div className="item">
          <label>Email: </label>
          <input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginLeft: "48px" }}
          />
        </div>
        <div className="item">
          <label>Quyền</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {roles && roles.length > 0 ? (
              roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Không có quyền nào
              </option>
            )}
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default ModalCreateAccount;
