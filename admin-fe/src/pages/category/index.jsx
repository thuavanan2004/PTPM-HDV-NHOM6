import React, { useEffect, useState } from "react";
import { get, post, patch } from "../../utils/axios-http/axios-http";
import {
  Space,
  Table,
  Modal,
  message,
  Button,
  Form,
  Input,
  Tag,
  Popconfirm,
} from "antd";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [form] = Form.useForm();

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_CATEGORY");
  const canUpdate = permissions.includes("UPDATE_CATEGORY");
  const canDelete = permissions.includes("DELETE_CATEGORY");

  const handleOk = async () => {
    setLoading(true);
    try {
      await patch(`category/update`, {
        title,
        description,
        categoryId,
      });
      message.success("Cập nhật thông tin thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại");
    }
    setIsModalEditOpen(false);
    setLoading(false);
  };

  const fetchApi = async () => {
    try {
      const categories = await get("category/get-all-category");
      setCategories(categories.categories);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleChangeStatus = async (categoryId, status) => {
    setLoading(true);
    try {
      const option = { status: !status };
      await patch(`category/change-status/${categoryId}`, option);
      message.success("Cập nhật trạng thái danh mục thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái danh mục thất bại");
    }
    setLoading(false);
  };

  const handleEdit = (category) => {
    setTitle(category.title);
    setDescription(category.description);
    setCategoryId(category.id);
    form.setFieldsValue({
      title: category.title,
      description: category.description,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (category) => {
    setLoading(true);
    try {
      await patch(`category/delete/${category.id}`, {});
      setLoading(false);
      message.success("Xóa danh mục thành công");
      fetchApi();
    } catch (error) {
      setLoading(false);
      message.error("Xóa danh mục thất bại");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldValue();
      await post("category/create", values);
      message.success("Tạo mới danh mục thành công");
      fetchApi();
    } catch (error) {
      message.error("Tạo mới danh mục thất bại");
    }
    setLoading(false);
    setIsModalCreateOpen(false);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: "Tên",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={status == true ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, status)}
          className="button-change-status"
        >
          {status == true ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Cập nhật bởi",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, category) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(category)}
              default
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tour này chứ ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(category)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const data = categories.map((category) => ({
    id: category.id,
    title: category.title,
    description: category.description,
    status: category.status,
    createdBy: category.createdBy,
    updatedBy: category.updatedBy,
  }));

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button
            type="primary"
            onClick={() => {
              setIsModalCreateOpen(true);
            }}
          >
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
        {/* Edit Modal */}
        <Modal
          title="Cập nhật thông tin"
          open={isModalEditOpen}
          onOk={handleOk}
          onCancel={() => {
            setIsModalEditOpen(false);
          }}
          loading={loading}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOk}
            initialValues={{ title, description }}
          >
            <Form.Item
              label="Tên"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
        {/* Create Modal */}
        <Modal
          title="Thêm mới quyền"
          open={isModalCreateOpen}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalCreateOpen(false);
          }}
          loading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Tên"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input placeholder="Nhập mô tả danh mục" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Category;
