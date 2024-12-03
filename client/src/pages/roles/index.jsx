import React, { useEffect, useState } from "react";
import "./style.scss";
import { Space, Table, Modal, message, Button } from "antd";
import { get } from "../../utils/axios-http/axios-http";
import { patch } from "../../utils/axios-http/axios-http";
import { post } from "../../utils/axios-http/axios-http";
import { deleteMethod } from "../../utils/axios-http/axios-http";

function Role() {
  const [listRoles, setListRoles] = useState({ roles: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roleId, setRoleId] = useState("");

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = async () => {
    setLoading(true);
    try {
      await patch(`roles/update/${roleId}`, {
        name,
        description,
      });
      message.success("Cập nhật thông tin thành công");
      fetchRoles();
    } catch (error) {
      message.error("Cập nhật thông tin thành công");
    }
    setIsModalOpen(false);
    setLoading(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const roles = await get("roles/get-all");
      setListRoles(roles);
    } catch (error) {
      console.error("Lỗi lấy danh sách roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Sửa bởi",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, role) => (
        <Space size="middle">
          <a onClick={() => handleEdit(role)}>Sửa</a>
          <a onClick={() => handleDelete(role)}>Xóa</a>
        </Space>
      ),
    },
  ];
  const data = listRoles.roles.map((role) => {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdBy: role.createdBy,
      updatedBy: role.updatedBy,
    };
  });

  const handleEdit = (role) => {
    setName(role.name);
    setDescription(role.description);
    setRoleId(role.id);
    showModal();
  };
  const handleDelete = async (role) => {
    setLoading(true);
    try {
      await deleteMethod(`roles/delete/${role.id}`);
      setLoading(false);
      message.success("Xóa quyền thành công");
      fetchRoles();
    } catch (error) {
      setLoading(false);
      message.error("Xóa quyền không thành công");
    }
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await post("roles/create", {
        name: name,
        description: description,
      });
      message.success("Thêm mới quyền thành công");
      fetchRoles();
    } catch (error) {
      message.error("Thêm mới quyền thất bại");
    }
    setLoading(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="roles-container">
        <Button type="primary" onClick={handleClick}>
          {" "}
          Thêm mới{" "}
        </Button>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          className="dashboard-table"
        />
        <Modal
          title="Cập nhật thông tin"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          loading={loading}
        >
          <form className="formUpdateRole">
            <div className="role-item">
              <span>Tên</span>
              <input
                value={name}
                type="name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="role-item">
              <span>Mô tả</span>
              <input
                value={description}
                type="description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </Modal>
        <Modal
          title="Thêm mới quyền"
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        >
          <form className="formUpdateRole">
            <div className="role-item" style={{ marginBottom: "20px" }}>
              <span>Tên: </span>
              <input
                style={{ marginLeft: "35px", width: "370px", height: "25px" }}
                value={name}
                type="name"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="role-item">
              <span>Mô tả: </span>
              <input
                style={{ marginLeft: "20px", width: "370px", height: "25px" }}
                value={description}
                type="description"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

export default Role;
