import React, { useEffect, useState } from "react";
import { get, post, patch } from "../../utils/axios-http/axios-http"; // Make sure deleteMethod is not used here
import { Space, Table, Modal, message, Button, Form, Input, Tag } from "antd";

function Departure() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [departureId, setDepartureId] = useState(null);
  const [form] = Form.useForm();

  const handleOk = async () => {
    setLoading(true);
    try {
      await patch(`departure/update`, {
        title,
        information,
        departureId,
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
      const departures = await get("departure/get-all-departure");
      setDepartures(departures.departures);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching departures:", error);
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
      title: "Mô tả",
      dataIndex: "information",
      key: "information",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Tag
          color={status === true ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, status)}
        >
          {status === true ? "Hoạt động" : "Không hoạt động"}
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
      render: (_, departure) => (
        <Space size="middle">
          <a onClick={() => handleEdit(departure)}>Sửa</a>
          <a onClick={() => handleDelete(departure)}>Xóa</a>
        </Space>
      ),
    },
  ];

  const data = departures.map((departure) => {
    return {
      id: departure.id,
      title: departure.title,
      information: departure.information,
      status: departure.status,
      createdBy: departure.createdBy,
      updatedBy: departure.updatedBy,
    };
  });
  console.log(departures);

  const handleChangeStatus = async (departureId, status) => {
    setLoading(true);
    try {
      const option = { status: !status };
      await patch(`departure/change-status/${departureId}`, option);
      message.success("Cập nhật trạng thái thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
    setLoading(false);
  };

  const handleEdit = (departure) => {
    setTitle(departure.title);
    setInformation(departure.information);
    setDepartureId(departure.id);
    form.setFieldsValue({
      title: departure.title,
      information: departure.information,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (departure) => {
    setLoading(true);
    try {
      await patch(`departure/delete/${departure.id}`, {});
      setLoading(false);
      message.success("Xóa điểm khởi hành thành công");
      fetchApi();
    } catch (error) {
      setLoading(false);
      message.error("Xóa điểm khởi hành thất bại");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldValue();
      await post("departure/create", values);
      message.success("Tạo mới điểm khởi hành thành công");
      fetchApi();
    } catch (error) {
      message.error("Tạo mới điểm khởi hành thất bại");
    }
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
              label="Mô tả"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
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
          title="Thêm mới điểm khởi hành"
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
              <Input placeholder="Nhập tên điểm khởi hành" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input placeholder="Nhập mô tả điểm khởi hành" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Departure;
