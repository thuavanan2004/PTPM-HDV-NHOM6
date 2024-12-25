import React, { useEffect, useState } from "react";
import "./style.scss";
import { Table, Space, Tag, message, Button, Popconfirm } from "antd";
import { deleteMethod, get, patch } from "../../utils/axios-http/axios-http";
import EditAccount from "./edit";
import CreateAccount from "./create";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [roleId, setRoleId] = useState(null);

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_CATEGORY");
  const canUpdate = permissions.includes("UPDATE_CATEGORY");
  const canDelete = permissions.includes("DELETE_CATEGORY");

  const fetchRoles = async () => {
    try {
      const rolesData = await get("roles/get-all");
      setRoles(rolesData.roles);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách quyền");
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await get("account/get-all-account");
      setAccounts(accounts.accounts);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách tài khoản");
      console.error("Lỗi lấy danh sách accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
  }, []);

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <img src={avatar} alt="avatar" style={{ width: 100, height: 100 }} />
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",

      render: (status, record) => (
        <Tag
          color={status === true ? "green" : "red"}
          onClick={() => handleChangeStatus(record)}
          className="button-change-status"
        >
          {status === true ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Tạo lúc",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => moment(createdAt).format("DD-MM-YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              default
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tour này chứ ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleChangeStatus = async (record) => {
    setLoading(true);
    const status = { status: !record.status };
    console.log(status);

    try {
      await patch(`account/change-status/${record.id}`, status);
      fetchAccounts();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại!");
      console.log("Lỗi Cập nhật trạng thái");
    }
    setLoading(false);
  };

  const handleDelete = async (account) => {
    setLoading(true);
    try {
      await deleteMethod(`account/delete/${account.id}`);
      fetchAccounts();
      message.success("Xóa tài khoản thành công!");
    } catch (error) {
      message.error("Xóa tài khoản thất bại!");
      console.log("Lỗi xóa tài khoản");
    }
    setLoading(false);
  };
  const handleEdit = (account) => {
    const roleSelect = roles.find((role) => role.name === account.role);
    setRoleId(roleSelect.id);
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setIsModalCreateOpen(true);
  };

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        )}
        <Table
          columns={columns}
          dataSource={accounts}
          loading={loading}
          rowKey="id"
          className="table-container"
        />
      </div>

      {isModalOpen && (
        <EditAccount
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          account={selectedAccount}
          roles={roles}
          fetchAccounts={fetchAccounts}
          roleId={roleId}
        />
      )}

      {isModalCreateOpen && (
        <CreateAccount
          open={isModalCreateOpen}
          onClose={() => setIsModalCreateOpen(false)}
          roles={roles}
          fetchAccounts={fetchAccounts}
        />
      )}
    </>
  );
}

export default Account;
