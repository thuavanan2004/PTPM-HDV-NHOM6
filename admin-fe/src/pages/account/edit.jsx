import React, { useState } from "react";
import "./edit.scss";
import { Modal, message } from "antd";
import { patchForm } from "../../utils/axios-http/axios-http";

function EditAccount({ open, onClose, account, roles, roleId, fetchAccounts }) {
  const [name, setName] = useState(account.fullName || "");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(account.email || "");
  const [role, setRole] = useState(roleId || "");
  const [avatar, setAvatar] = useState(account.avatar || "");
  const [newAvatar, setNewAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", name);
    formData.append("password", password);
    formData.append("email", email);
    formData.append("roleId", role);
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }

    try {
      await patchForm(`account/update/${account.id}`, formData);
      message.success("Cập nhật thông tin thành công");
      fetchAccounts();
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    }
    setLoading(false);
  };

  const handleAvatarChange = (e) => {
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

  return (
    <Modal
      title="Cập nhật thông tin"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <form className="formUpdateAccount">
        <div className="item">
          <label>Ảnh đại diện: </label>
          {avatar && (
            <img
              src={avatar}
              alt="Avatar Preview"
              style={{
                width: 100,
                height: 100,
                marginBottom: 10,
                marginLeft: "29px",
              }}
            />
          )}
          <input
            style={{ marginLeft: "33px" }}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
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
          <label>Quyền: </label>
          <select value={roleId} onChange={(e) => setRole(e.target.value)}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}

export default EditAccount;
