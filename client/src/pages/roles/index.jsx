import React, { useEffect, useState } from "react";
import "./style.scss";
import { Space, Table, Modal, message, Button, Popconfirm, Input } from "antd";
import {
  get,
  patch,
  post,
  deleteMethod,
} from "../../utils/axios-http/axios-http";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Role() {
  const [listRoles, setListRoles] = useState({ roles: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Flag to check if it's edit or create
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roleId, setRoleId] = useState("");

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_ROLES");
  const canUpdate = permissions.includes("UPDATE_ROLES");
  const canDelete = permissions.includes("DELETE_ROLES");

  const showModal = (role = null) => {
    if (role) {
      // Set the role to edit
      setIsEditMode(true);
      setRoleId(role.id);
      setName(role.name);
      setDescription(role.description);
    } else {
      // Prepare for creating a new role
      setIsEditMode(false);
      setName("");
      setDescription("");
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      if (isEditMode) {
        // Update the existing role
        await patch(`roles/update/${roleId}`, {
          name,
          description,
        });
        message.success("Cập nhật thông tin thành công");
      } else {
        // Create a new role
        await post("roles/create", {
          name,
          description,
        });
        message.success("Thêm mới quyền thành công");
      }
      fetchRoles(); // Reload roles after success
    } catch (error) {
      message.error(
        isEditMode ? "Cập nhật thông tin thất bại" : "Thêm mới quyền thất bại"
      );
    }
    setLoading(false);
    setIsModalOpen(false);
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
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(role)} // Open modal in edit mode
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa quyền này chứ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(role)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
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

  const handleDelete = async (role) => {
    setLoading(true);
    try {
      await deleteMethod(`roles/delete/${role.id}`);
      message.success("Xóa quyền thành công");
      fetchRoles();
    } catch (error) {
      message.error("Xóa quyền không thành công");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button type="primary" onClick={() => showModal()}>
            Thêm mới
          </Button>
        )}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          className="table-container"
        />
        <Modal
          title={isEditMode ? "Cập nhật quyền" : "Thêm mới quyền"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loading}
        >
          <form className="formUpdateRole">
            <div className="role-item">
              <span>Tên</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="role-item">
              <span>Mô tả</span>
              <Input.TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
}

export default Role;
