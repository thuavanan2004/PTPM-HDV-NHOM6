import React, { useEffect, useState } from "react";
import {
  get,
  post,
  patch,
  deleteMethod,
} from "../../utils/axios-http/axios-http";
import { Space, Table, Modal, message, Button, Form, Input, Tag } from "antd";

function Transportation() {
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [transportationId, setTransportationId] = useState(null);
  const [form] = Form.useForm();

  const handleOk = async () => {
    setLoading(true);
    try {
      await patch(`transportation/update`, {
        title,
        information,
        transportationId,
      });
      message.success("Cập nhật thông tin thành công");
      fetchApi();
      form.resetFields();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại");
    }
    setIsModalEditOpen(false);
    setLoading(false);
  };

  const fetchApi = async () => {
    try {
      const transportations = await get(
        "transportation/get-all-transportation"
      );
      setTransportations(transportations.transportations);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching transportations:", error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

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
      title: "Thông tin",
      dataIndex: "information",
      key: "information",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={status == true ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, status)}
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
      render: (_, transportation) => (
        <Space size="middle">
          <a onClick={() => handleEdit(transportation)}>Edit</a>
          <a onClick={() => handleDelete(transportation)}>Delete</a>
        </Space>
      ),
    },
  ];

  const data = transportations.map((transportation) => {
    return {
      id: transportation.id,
      title: transportation.title,
      information: transportation.information,
      status: transportation.status,
      createdBy: transportation.createdBy,
      updatedBy: transportation.updatedBy,
    };
  });

  const handleChangeStatus = async (transportationId, status) => {
    setLoading(true);
    try {
      const option = { status: !status };
      await patch(`transportation/change-status/${transportationId}`, option);
      message.success("Cập nhật trạng thái phương tiện thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái phương tiện thất bại");
    }
    setLoading(false);
  };

  const handleEdit = (transportation) => {
    setTitle(transportation.title);
    setInformation(transportation.information);
    setTransportationId(transportation.id);
    form.setFieldsValue({
      title: transportation.title,
      information: transportation.information,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (transportation) => {
    setLoading(true);
    try {
      await patch(`transportation/delete/${transportation.id}`, {});
      setLoading(false);
      message.success("Xóa phương tiện thành công");
      fetchApi();
    } catch (error) {
      setLoading(false);
      message.error("Xóa phương tiện thất bại");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldValue();

      await post("transportation/create", values);
      message.success("Tạo mới phương tiện thành công");
      fetchApi();
    } catch (error) {
      message.error("Tạo mới phương tiện thất bại");
    }
    form.resetFields();
    setLoading(false);
    setIsModalCreateOpen(false);
  };

  return (
    <>
      <div className="roles-container">
        <Button
          type="primary"
          onClick={() => {
            setIsModalCreateOpen(true);
          }}
        >
          Thêm mới
        </Button>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          className="dashboard-table"
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
            initialValues={{ title, information }}
          >
            <Form.Item
              label="Tên"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Thông tin"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập thông tin" }]}
            >
              <Input
                value={information}
                onChange={(e) => setInformation(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
        {/* Create Modal */}
        <Modal
          title="Thêm mới phương tiện"
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
              <Input placeholder="Nhập tên phương tiện" />
            </Form.Item>
            <Form.Item
              label="Thông tin"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập thông tin" }]}
            >
              <Input placeholder="Nhập thông tin phương tiện" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Transportation;
