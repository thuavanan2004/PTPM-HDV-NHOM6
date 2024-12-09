import React, { useState, useEffect } from "react";
import "./style.scss";
import { Table, Button, message, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { deleteMethod, get, post } from "../../utils/axios-http/axios-http";
import { setPermissions as updateReduxPermissions } from "../../slice/adminSlice";

function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [newPermissions, setNewPermissions] = useState({
    added: [],
    removed: [],
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminId, setAdminId] = useState();
  const dispatch = useDispatch();
  const recordAdmin = useSelector((state) => state.admin);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const [permissionResponse, roleResponse] = await Promise.all([
        get("roles/permissions"),
        get("roles/get-all"),
      ]);

      permissionResponse.permissions.forEach((permission) => {
        permission.roleIds = [];
      });

      await Promise.all(
        roleResponse.roles.map(async (role) => {
          const record = await get(`roles/${role.id}/permissions`);
          permissionResponse.permissions.forEach((item1) => {
            const matchingItem = record.permissions.find(
              (item2) => item2.id === item1.id
            );
            if (matchingItem) {
              item1.roleIds.push(role.id);
            }
          });
        })
      );

      setRoles(roleResponse.roles);
      setPermissions(permissionResponse.permissions);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách phân quyền");
      console.error("Lỗi lấy danh sách roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCheckboxChange = (permissionId, roleId) => {
    setPermissions((prevPermissions) =>
      prevPermissions.map((permission) => {
        if (permission.id === permissionId) {
          const updatedRoleIds = permission.roleIds.includes(roleId)
            ? permission.roleIds.filter((id) => id !== roleId)
            : [...permission.roleIds, roleId];
          return { ...permission, roleIds: updatedRoleIds };
        }
        return permission;
      })
    );

    setNewPermissions((prevState) => {
      const isAdded = prevState.added.some(
        (item) => item.permissionId === permissionId && item.roleId === roleId
      );
      const isRemoved = prevState.removed.some(
        (item) => item.permissionId === permissionId && item.roleId === roleId
      );

      let addedPermissions = [...prevState.added];
      let removedPermissions = [...prevState.removed];
      const isCurrentlyChecked = permissions.some(
        (permission) =>
          permission.roleIds.includes(roleId) && permission.id === permissionId
      );

      if (!isCurrentlyChecked) {
        if (!isAdded && !isRemoved) {
          addedPermissions.push({ permissionId, roleId });
        }
        removedPermissions = removedPermissions.filter(
          (item) => item.permissionId !== permissionId || item.roleId !== roleId
        );
      } else {
        if (!isRemoved && !isAdded) {
          removedPermissions.push({ permissionId, roleId });
        }
        addedPermissions = addedPermissions.filter(
          (item) => item.permissionId !== permissionId || item.roleId !== roleId
        );
      }

      return { added: addedPermissions, removed: removedPermissions };
    });
  };

  const handleClick = async () => {
    setLoading(true);
    const optionAdd = [];
    const optionRemove = [];

    newPermissions.added.forEach((item) => {
      const existRoleId = optionAdd.find((o) => o.roleId === item.roleId);
      if (existRoleId) {
        existRoleId.permissionIds.push(item.permissionId);
      } else {
        optionAdd.push({
          roleId: item.roleId,
          permissionIds: [item.permissionId],
        });
      }
    });

    newPermissions.removed.forEach((item) => {
      const existRoleId = optionRemove.find((o) => o.roleId === item.roleId);
      if (existRoleId) {
        existRoleId.permissionIds.push(item.permissionId);
      } else {
        optionRemove.push({
          roleId: item.roleId,
          permissionIds: [item.permissionId],
        });
      }
    });

    if (optionAdd.length === 0 && optionRemove.length === 0) {
      message.info("Chưa có cập nhật phân quyền nào.");
      setLoading(false);
      return;
    }

    try {
      await Promise.all(
        optionAdd.map(async (item) => {
          await post(`roles/${item.roleId}/permissions`, {
            permissionIds: item.permissionIds,
          });
        })
      );
      await Promise.all(
        optionRemove.map(async (item) => {
          await deleteMethod(`roles/${item.roleId}/permissions`, {
            permissionIds: item.permissionIds,
          });
        })
      );
      message.success("Cập nhật phân quyền thành công!");
      fetchPermissions();
      setNewPermissions({
        added: [],
        removed: [],
      });
      const adminId = recordAdmin.admin.roleId;

      const permissionUpdateNow = permissions
        .filter((permission) => permission.roleIds.includes(adminId))
        .map((permission) => permission.name);

      dispatch(updateReduxPermissions(permissionUpdateNow));
    } catch (error) {
      message.error("Lỗi khi cập nhật phân quyền");
      console.error(error);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: "Phân quyền",
      dataIndex: "permissions",
      key: "permissions",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    ...roles.map((role) => ({
      title: role.name,
      dataIndex: role.name,
      key: role.id,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={record.roleIds.includes(role.id)}
          onChange={() => handleCheckboxChange(record.key, role.id)}
        />
      ),
    })),
  ];

  const data = permissions.map((item) => ({
    key: item.id,
    permissions: item.name,
    description: item.description,
    roleIds: item.roleIds || [],
  }));

  return (
    <>
      <Spin spinning={loading}>
        <div className="layout-container">
          <Button type="primary" onClick={handleClick}>
            Cập nhật phân quyền
          </Button>
          <Table
            className="table-container"
            columns={columns}
            dataSource={data}
            pagination={false}
          />
        </div>
      </Spin>
    </>
  );
}

export default Permissions;
