import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  Space,
  DatePicker,
  InputNumber,
} from "antd";
import { useNavigate } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { get, postForm } from "../../utils/axios-http/axios-http";
import "./style.scss";

function CreateNew() {
  const [form] = Form.useForm();
  const { Option } = Select;
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const fetchApi = async () => {
    try {
      const categoriesData = await get("category/get-all-category");
      const departuresData = await get("departure/get-all-departure");
      const destinationsData = await get("destination/get-tree");
      const transportationsData = await get(
        "transportation/get-all-transportation"
      );
      setCategories(categoriesData.categories || []);
      setDepartures(departuresData.departures || []);
      setDestinations(destinationsData || []);
      setTransportations(transportationsData.transportations || []);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    }
  };
  console.log(destinations);

  useEffect(() => {
    fetchApi();
  }, []);

  const onFinish = async () => {
    const values = form.getFieldValue();
    const formData = new FormData();

    // Thêm các trường dữ liệu thông thường vào FormData
    formData.append("title", values.title || "");
    formData.append("isFeatured", values.isFeatured || false);
    formData.append("categoryId", values.categoryId || "");
    formData.append("destinationId", values.destinationId || "");
    formData.append("departureId", values.departureId || "");
    formData.append("transportationId", values.transportationId || "");

    // Thêm thông tin lồng nhau vào FormData
    formData.append(
      "information",
      JSON.stringify({
        attractions: values.attractions || "",
        cuisine: values.cuisine || "",
        idealTime: values.idealTime || "",
        vehicle: values.vehicle || "",
        promotion: values.promotion || "",
        suitableObject: values.suitableObject || "",
      })
    );

    // Thêm lịch trình vào FormData (nếu có)
    formData.append("schedule", JSON.stringify(values.schedule || []));

    // Thêm chi tiết tour
    formData.append("tour_detail", JSON.stringify(values.tour_detail || []));

    console.log(fileList);

    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    try {
      const response = await postForm("tours/create", formData);
      if (response) {
        message.success("Tạo mới tour thành công!");
        setLoading(false);
        form.resetFields();
        navigate("/tour");
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error);
      message.error("Tạo mới tour thất bại, vui lòng thử lại!");
    }
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
  const currencyFormatter = (value) => {
    if (!value) return "";
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫`;
  };
  const currencyParser = (value) => {
    return value.replace(/[^\d]/g, "");
  };
  return (
    <div className="creatnew-container">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="creatnew-form"
      >
        {/* Title */}
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập title" }]}
        >
          <Input placeholder="Nhập title" />
        </Form.Item>

        {/* Category ID */}
        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn category" }]}
        >
          <Select placeholder="Chọn category">
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Departure ID */}
        <Form.Item
          label="Điểm khởi hành"
          name="departureId"
          rules={[{ required: true, message: "Vui lòng chọn điểm khởi hành" }]}
        >
          <Select placeholder="Chọn điểm khởi hành">
            {departures.map((departure) => (
              <Option key={departure.id} value={departure.id}>
                {departure.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Destination ID */}
        <Form.Item
          label="Điểm đến"
          name="destinationId"
          rules={[{ required: true, message: "Vui lòng chọn điểm đến" }]}
        >
          <Select placeholder="Chọn điểm đến">
            {renderDestinations(destinations)}
          </Select>
        </Form.Item>

        {/* Transportation ID */}
        <Form.Item
          label="Phương tiện"
          name="transportationId"
          rules={[{ required: true, message: "Vui lòng chọn phương tiện" }]}
        >
          <Select placeholder="Chọn phương tiện">
            {transportations.map((transportation) => (
              <Option key={transportation.id} value={transportation.id}>
                {transportation.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Information */}
        <div className="form-list-title">Thông tin: </div>
        <Form.Item name="information">
          <div className="form-information">
            <div className="if-input">
              <p>Điểm tham quan: </p>
              <Form.Item name="attractions">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
            <div className="if-input">
              <p>Ẩm thực: </p>
              <Form.Item name="cuisine">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
            <div className="if-input">
              <p>Thời gian thích hợp: </p>
              <Form.Item name="idealTime">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
            <div className="if-input">
              <p>Đối tượng thích hợp: </p>
              <Form.Item name="suitableObject">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
            <div className="if-input">
              <p>Phương tiện: </p>
              <Form.Item name="vehicle">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
            <div className="if-input">
              <p>Ưu đãi: </p>
              <Form.Item name="promotion">
                <Input className="input" placeholder="Nhập thông tin" />
              </Form.Item>
            </div>
          </div>
        </Form.Item>

        {/* Schedule */}
        <div className="form-list-title">Lịch trình: </div>
        <div className="form-list">
          <Form.List
            name="schedule"
            initialValue={[{ day: "", title: "", information: "" }]}
            rules={[
              {
                validator: async (_, schedule) => {
                  if (!schedule || schedule.length < 1) {
                    return Promise.reject(new Error("Chưa có lịch trình"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, fieldKey, name, fieldNames, index }) => (
                  <div key={key}>
                    <Form.Item
                      label="Ngày"
                      name={[name, "day"]}
                      rules={[
                        { required: true, message: "Vui lòng nhập ngày" },
                      ]}
                    >
                      <InputNumber placeholder="Nhập" min={1} />
                    </Form.Item>

                    <Form.Item
                      label="Tiêu đề"
                      name={[name, "title"]}
                      rules={[
                        { required: true, message: "Vui lòng nhập title" },
                      ]}
                    >
                      <Input placeholder="Nhập title" />
                    </Form.Item>

                    <Form.Item
                      label="Thông tin"
                      name={[name, "information"]}
                      rules={[
                        { required: true, message: "Vui lòng nhập thông tin" },
                      ]}
                    >
                      <Input placeholder="Nhập thông tin" />
                    </Form.Item>

                    <Space>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<UploadOutlined />}
                      >
                        Thêm lịch trình
                      </Button>
                      {fields.length > 1 && (
                        <Button type="link" onClick={() => remove(name)} danger>
                          Xóa
                        </Button>
                      )}
                    </Space>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </div>

        {/* Tour Detail */}
        <div className="form-list-title">Chi tiết tour: </div>
        <div className="form-list">
          <Form.List
            name="tour_detail"
            label="Thông tin chi tiết từng tour"
            initialValue={[
              {
                adultPrice: "",
                childrenPrice: "",
                childPrice: "",
                babyPrice: "",
                singleRoomSupplementPrice: "",
                stock: "",
                discount: "",
                dayStart: "",
                dayReturn: "",
              },
            ]}
            rules={[
              {
                validator: async (_, tourDetail) => {
                  if (!tourDetail || tourDetail.length < 1) {
                    return Promise.reject(new Error("Chưa có thông tin tour"));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, fieldKey, name, fieldNames, index }) => (
                  <div key={key}>
                    <Form.Item
                      label="Giá người lớn"
                      name={[name, "adultPrice"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập giá người lớn",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100000000}
                        step={1000}
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        style={{ marginRight: 10, width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Giá trẻ em"
                      name={[name, "childrenPrice"]}
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập giá trẻ em",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100000000}
                        step={1000}
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        style={{ marginRight: 10, width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Giá trẻ nhỏ"
                      name={[name, "childPrice"]}
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập giá trẻ nhỏ",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100000000}
                        step={1000}
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        style={{ marginRight: 10, width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Giá trẻ sơ sinh"
                      name={[name, "babyPrice"]}
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập giá trẻ sơ sinh",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100000000}
                        step={1000}
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        style={{ marginRight: 10, width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Phụ thu phòng đơn"
                      name={[name, "singleRoomSupplementPrice"]}
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập giá phụ thu phòng đơn",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100000000}
                        step={1000}
                        formatter={currencyFormatter}
                        parser={currencyParser}
                        style={{ marginRight: 10, width: 300 }}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Giảm giá"
                      name={[name, "discount"]}
                      rules={[
                        {
                          required: false,
                          message: "Vui lòng nhập phần trăm giảm giá",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập phần trăm giảm giá" />
                    </Form.Item>

                    <Form.Item
                      label="Stock"
                      name={[name, "stock"]}
                      rules={[
                        { required: true, message: "Vui lòng nhập số lượng" },
                      ]}
                    >
                      <Input placeholder="Nhập số lượng" />
                    </Form.Item>

                    {/* Ngày đi */}
                    <Form.Item
                      label="Ngày đi"
                      name={[name, "dayStart"]}
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày đi" },
                      ]}
                    >
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        placeholder="Chọn ngày đi"
                      />
                    </Form.Item>

                    {/* Ngày về */}
                    <Form.Item
                      label="Ngày về"
                      name={[name, "dayReturn"]}
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày về" },
                      ]}
                    >
                      <DatePicker
                        showTime
                        format="YYYY-MM-DD HH:mm"
                        placeholder="Chọn ngày về"
                      />
                    </Form.Item>

                    <Space>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<UploadOutlined />}
                      >
                        Thêm tour
                      </Button>
                      {fields.length > 1 && (
                        <Button type="link" onClick={() => remove(name)} danger>
                          Xóa
                        </Button>
                      )}
                    </Space>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </div>

        {/* Images */}
        <Form.Item
          label=""
          name={[name, "image"]}
          rules={[{ required: true, message: "Vui lòng tải lên ảnh" }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            maxCount={9}
            beforeUpload={() => false}
          >
            <div>
              <UploadOutlined />
              <div>Chọn ảnh</div>
            </div>
          </Upload>
        </Form.Item>

        <Button loading={loading} type="primary" htmlType="submit">
          Tạo Tour
        </Button>
      </Form>
    </div>
  );
}

export default CreateNew;
