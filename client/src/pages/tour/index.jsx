import React, { useEffect, useState, useCallback } from "react";
import {
  message,
  Space,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Input,
} from "antd";
import { get, patch } from "../../utils/axios-http/axios-http";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import checkPermission from "../../utils/axios-http/checkPermission";
import { useSelector } from "react-redux";

import moment from "moment";

const { Option } = Select;
const { Search } = Input;

function Tour() {
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [typeButtonOne, setTypeButtonOne] = useState("");
  const [typeButtonTwo, setTypeButtonTwo] = useState("");
  const [filters, setFilters] = useState({
    destinationTo: "",
    departureFrom: "",
    fromDate: "",
    transTypeId: "",
    categoryId: "",
    status: "",
    isFeatured: "",
    sortOrder: "",
    title: "",
  });
  // const [canCreate, setCanCreate] = useState(false);
  // const [canView, setCanView] = useState(false);
  // const [canUpdate, setCanEdit] = useState(false);
  // const [canDelete, setCanDelete] = useState(false);

  const navigate = useNavigate();

  // const permissions = useSelector((state) => state.admin.permissions);

  // useEffect(() => {
  //   if (permissions.length > 0) {
  //     setCanCreate(checkPermission("CREATE_TOUR"));
  //     setCanView(checkPermission("READ_TOUR"));
  //     setCanEdit(checkPermission("UPDATE_TOUR"));
  //     setCanDelete(checkPermission("DELETE_TOUR"));
  //   }
  // }, [permissions]);

  const fetchDataTour = async () => {
    try {
      const [
        response,
        categoriesData,
        departuresData,
        destinationsData,
        transportationsData,
      ] = await Promise.all([
        get("tours/get-all-tour", filters),
        get("category/get-all-category"),
        get("departure/get-all-departure"),
        get("destination/get-tree"),
        get("transportation/get-all-transportation"),
      ]);

      setCategories(categoriesData.categories || []);
      setDepartures(departuresData.departures || []);
      setDestinations(destinationsData || []);
      setTransportations(transportationsData.transportations || []);
      setTour(response);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTour();
  }, [filters]);

  const handleStatusChange = async (tourId, status) => {
    setLoading(true);
    try {
      await patch(`tours/status/${tourId}`, { status: !status });
      message.success("Cập nhật trạng thái tour thành công!");
      fetchDataTour();
    } catch (error) {
      message.error("Cập nhật trạng thái tour thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedChange = async (tourId, isFeatured) => {
    setLoading(true);
    try {
      await patch(`tours/featured/${tourId}`, { isFeatured: !isFeatured });
      message.success("Cập nhật tour nổi bật thành công!");
      fetchDataTour();
    } catch (error) {
      message.error("Cập nhật tour nổi bật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringTours = async () => {
    setTypeButtonOne("");
    setTypeButtonTwo("primary");
    setLoading(true);
    try {
      const response = await get("tours/expired-soon", filters);
      setTour(response);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour sắp hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiredTours = async () => {
    setTypeButtonOne("primary");
    setTypeButtonTwo("");
    setLoading(true);
    try {
      const response = await get("tours/expired", filters);
      setTour(response);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour đã hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeButtonOne("");
    setTypeButtonTwo("");
    setFilters({
      destinationTo: "",
      departureFrom: "",
      fromDate: "",
      transTypeId: "",
      categoryId: "",
      status: "",
      isFeatured: "",
      sortOrder: "",
      title: "",
    });
    fetchDataTour();
  };

  const removeTour = async (tourID) => {
    try {
      await patch(`tours/remove/${tourID}`);
      message.success("Xóa tour thành công");
      setTour((prevTours) => prevTours.filter((item) => item.id !== tourID));
    } catch (error) {
      message.error("Xóa tour thất bại");
    }
  };

  const renderDestinations = (items, level = 0) => {
    return items.map((destination) => (
      <React.Fragment key={destination.id}>
        <Option value={destination.id}>
          {`${"--".repeat(level)} ${destination.title}`}
        </Option>
        {destination.children &&
          destination.children.length > 0 &&
          renderDestinations(destination.children, level + 1)}
      </React.Fragment>
    ));
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Tên tour",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ảnh",
      dataIndex: "source",
      key: "source",
      render: (source) => (
        <img src={source} alt="tour" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "Mã tour",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (status, record) => (
        <Tag
          color={status ? "green" : "red"}
          onClick={() => handleStatusChange(record.id, status)}
        >
          {status ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured, record) => (
        <Tag
          color={isFeatured ? "green" : "red"}
          onClick={() => handleFeaturedChange(record.id, isFeatured)}
        >
          {isFeatured ? "Nổi bật" : "Không nổi bật"}
        </Tag>
      ),
    },
    {
      title: "Giá",
      dataIndex: "adultPrice",
      key: "adultPrice",
      render: (adultPrice) => adultPrice.toLocaleString(),
    },
    {
      title: "Ngày khởi hành",
      dataIndex: "dayStart",
      key: "dayStart",
      render: (dayStart) => moment(dayStart).format("DD-MM-YYYY"),
    },
    {
      title: "Ngày trở lại",
      dataIndex: "dayReturn",
      key: "dayReturn",
      render: (dayReturn) => moment(dayReturn).format("DD-MM-YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => navigate(`/tour-detail/${record.id}`)}>
            Xem chi tiết
          </Button>
          <Button onClick={() => navigate(`/edit-tour/${record.id}`)}>
            Sửa
          </Button>
          <Button onClick={() => removeTour(record.id)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="tour-container">
      <div style={{ marginBottom: 20 }}>
        <Button
          onClick={() => navigate("/create-new")}
          style={{ background: "blue", color: "white" }}
        >
          Tạo mới
        </Button>

        <Button
          onClick={fetchExpiringTours}
          type={typeButtonTwo ? "primary" : ""}
          style={{ marginRight: 10, marginLeft: "20px" }}
        >
          Tour sắp hết hạn
        </Button>
        <Button
          onClick={fetchExpiredTours}
          type={typeButtonOne ? "primary" : ""}
          style={{ marginRight: 10, marginLeft: "10px" }}
        >
          Tour hết hạn
        </Button>
        <Button
          onClick={clearFilters}
          style={{ marginRight: 10, marginLeft: "10px" }}
        >
          Quay lại Quản lý Tour
        </Button>
        <Search
          placeholder="Nhập tour muốn tìm kiếm"
          onSearch={(value) => setFilters({ ...filters, title: value })}
          style={{ width: 200, marginRight: 10, marginLeft: "10px" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Chọn điểm đến"
          onChange={(value) => setFilters({ ...filters, destinationTo: value })}
        >
          <Option value="">Tất cả</Option>
          {renderDestinations(destinations)}
        </Select>

        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Chọn điểm khởi hành"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, departureFrom: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {departures.map((departure) => (
            <Option key={departure.id} value={departure.id}>
              {departure.title}
            </Option>
          ))}
        </Select>

        <DatePicker
          placeholder="Ngày đi"
          style={{ marginRight: 10 }}
          onChange={(date, dateString) =>
            setFilters((prev) => ({ ...prev, fromDate: dateString }))
          }
        />

        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Loại phương tiện"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, transTypeId: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {transportations.map((transport) => (
            <Option key={transport.id} value={transport.id}>
              {transport.title}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 200 }}
          placeholder="Danh mục"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, categoryId: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.title}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Trạng thái"
          onChange={(value) => setFilters({ ...filters, status: value })}
        >
          <Option value="">Tất cả</Option>
          <Option value="1">Hoạt động</Option>
          <Option value="0">Không hoạt động</Option>
        </Select>

        {/* Add Select for Featured */}
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Nổi bật"
          onChange={(value) => setFilters({ ...filters, isFeatured: value })}
        >
          <Option value="">Tất cả</Option>
          <Option value="1">Nổi bật</Option>
          <Option value="0">Không nổi bật</Option>
        </Select>

        {/* Add Select for Price */}
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Giá"
          onChange={(value) => setFilters({ ...filters, sortOrder: value })}
        >
          <Option value="">Tất cả</Option>
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tour}
        loading={loading}
        className="dashboard-table"
        pagination={{ pageSize: 4 }}
      />
    </div>
  );
}

export default Tour;