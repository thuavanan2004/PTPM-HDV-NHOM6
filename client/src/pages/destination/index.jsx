import React, { useEffect, useState } from "react";
import {
  get,
  post,
  patch,
  postForm,
  patchForm,
} from "../../utils/axios-http/axios-http";
import {
  Space,
  Table,
  Modal,
  message,
  Button,
  Form,
  Input,
  Tag,
  Upload,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
const { Option } = Select;

function Destination() {
  const [destinations, setDestinations] = useState([]);
  const [destinationsTree, setDestinationsTree] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [information, setInformation] = useState("");
  const [image, setImage] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [form] = Form.useForm();

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = form.getFieldValue();
      const formData = new FormData();

      formData.append("title", values.title || "");
      formData.append("information", values.information || "");
      formData.append("parentId", values.parentId || "");
      formData.append("image", values.image.file);
      formData.append("destinationId", destinationId);

      await patchForm(`destination/update`, formData);
      message.success("Cập nhật thông tin thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại");
    }
    setIsModalEditOpen(false);
    setLoading(false);
  };

  const renderDestinationValue = (destinationsTree) => {
    let destinations = [];
    destinationsTree.map((item) => {
      destinations.push(item);
      if (item.children && item.children.length > 0) {
        destinations = [
          ...destinations,
          ...renderDestinationValue(item.children),
        ];
      }
    });
    return destinations;
  };

  const renderDestinations = (items, level = 0) => {
    return items.map((destination) => (
      <>
        <Option key={destination.id} value={destination.id}>
          {`${"---".repeat(level)} ${destination.title}`}
        </Option>
        {destination.children && destination.children.length > 0 && (
          <>{renderDestinations(destination.children, level + 1)}</>
        )}
      </>
    ));
  };

  const fetchApi = async () => {
    try {
      const destinationTree = await get("destination/get-tree");
      setDestinationsTree(destinationTree);
      let destinations = renderDestinationValue(destinationTree);
      setDestinations(destinations);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching destinations:", error);
    }
  };

  const fetchFilteredDestinations = async (parentId) => {
    try {
      const filteredData = await get(`destination/get-by-parent/${parentId}`);
      setFilteredDestinations(filteredData);
    } catch (error) {
      message.error("Lỗi khi lấy dữ liệu con");
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
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img src={image} alt="destination" style={{ width: 50, height: 50 }} />
      ),
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
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId) => (parentId ? "Có" : "Không"),
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
      render: (_, destination) => (
        <Space size="middle">
          <a onClick={() => handleEdit(destination)}>Sửa</a>
          <a onClick={() => handleDelete(destination)}>Xóa</a>
        </Space>
      ),
    },
  ];

  const data = (
    filteredDestinations.length > 0 ? filteredDestinations : destinations
  ).map((destination) => {
    return {
      id: destination.id,
      title: destination.title,
      information: destination.information,
      image: destination.image,
      parentId: destination.parentId,
      status: destination.status,
      createdBy: destination.createdBy,
      updatedBy: destination.updatedBy,
    };
  });

  const handleChangeStatus = async (destinationId, status) => {
    setLoading(true);
    try {
      const option = { status: !status };
      await patch(`destination/change-status/${destinationId}`, option);
      message.success("Cập nhật trạng thái địa điểm thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái địa điểm thất bại");
    }
    setLoading(false);
  };

  const handleEdit = (destination) => {
    setTitle(destination.title);
    setInformation(destination.information);
    setImage(destination.image);
    setParentId(destination.parentId);
    setDestinationId(destination.id);
    form.setFieldsValue({
      title: destination.title,
      information: destination.information,
      image: destination.image,
      parentId: destination.parentId,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (destination) => {
    setLoading(true);
    try {
      await patch(`destination/delete/${destination.id}`, {});
      setLoading(false);
      message.success("Xóa địa điểm thành công");
      fetchApi();
    } catch (error) {
      setLoading(false);
      message.error("Xóa địa điểm thất bại");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldValue();
      const formData = new FormData();

      formData.append("title", values.title || "");
      formData.append("information", values.information || "");
      formData.append("parentId", values.parentId || "");
      formData.append("image", values.image.file);

      await postForm("destination/create", formData);
      message.success("Tạo mới địa điểm thành công");
      fetchApi();
    } catch (error) {
      message.error("Tạo mới địa điểm thất bại");
    }
    setLoading(false);
    setIsModalCreateOpen(false);
  };

  return (
    <>
      <div className="roles-container">
        <Select
          style={{ width: 200, marginBottom: 20 }}
          placeholder="Chọn danh mục cha"
          onChange={(value) => {
            setParentId(value);
            fetchFilteredDestinations(value);
          }}
        >
          {renderDestinations(destinationsTree)}
        </Select>
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
          style={{ marginTop: "30px" }}
          pagination={{ pageSize: 8 }}
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
            initialValues={{
              title,
              information,
              image,
              parentId,
            }}
          >
            <Form.Item
              label="Tên"
              name="title"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Thông tin"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập thông tin" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Hình ảnh" name="image" valuePropName="file">
              <Upload
                name="image"
                listType="picture"
                beforeUpload={() => false}
                onChange={(info) => {
                  setImage(info.fileList[0]?.originFileObj);
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="Danh mục cha" name="parentId">
              <Select
                defaultValue={parentId}
                style={{ width: "100%" }}
                placeholder="Chọn danh mục cha"
              >
                {renderDestinations(destinationsTree)}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Create Modal */}
        <Modal
          title="Thêm mới địa điểm"
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
              <Input />
            </Form.Item>
            <Form.Item
              label="Thông tin"
              name="information"
              rules={[{ required: true, message: "Vui lòng nhập thông tin" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Hình ảnh" name="image" valuePropName="file">
              <Upload
                name="image"
                listType="picture"
                beforeUpload={() => false}
                onChange={(info) => {
                  setImage(info.fileList[0]?.originFileObj);
                }}
              >
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="Danh mục cha" name="parentId">
              <Select style={{ width: "100%" }} placeholder="Chọn danh mục cha">
                {renderDestinations(destinationsTree)}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Destination;
