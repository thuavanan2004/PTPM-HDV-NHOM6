import React, { useEffect, useState } from "react";
import './style.scss'
import { Table, Space, Switch, message, Button } from "antd";
import { deleteMethod, get, patch } from "../../utils/axios-http/axios-http";
import EditAccount from "./edit";
import CreateAccount from "./create";

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [roleId, setRoleId] = useState(null);

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
        <img src={avatar} alt="avatar" style={{ width: 100 }} />
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
        <Switch
          checked={status}
          onChange={() => handleStatusChange(record)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Không hoạt động"
        />
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
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleEdit(record)}>Edit</a>
          <a onClick={() => handleDelete(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  const handleStatusChange = async (record) => {
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
      <div className="account-container">
        <Button type="primary" onClick={handleCreate}>
          Thêm mới
        </Button>
        <Table
          columns={columns}
          dataSource={accounts}
          loading={loading}
          rowKey="id"
          className="dashboard-table"
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
