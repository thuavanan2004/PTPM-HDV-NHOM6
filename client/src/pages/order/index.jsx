import React, { useEffect, useState } from "react";
import "./style.scss";
import { Table, Tag } from "antd";
import { get } from "../../utils/axios-http/axios-http";
import OrderDetail from "./detail";

function Order() {
  const [orderData, setOrderData] = useState();
  const [orderDetail, setOrderDetail] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await get("orders/get-all");
      setOrderData(response?.orders);
      setLoading(false);
    };
    fetchOrder();
  }, []);

  const handleRowClick = async (record) => {
    setIsModalOpen(true);
    const orderDetail = await get(`orders/order-item/${record.id}`);
    setOrderDetail(orderDetail);
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "confirmed" ? "green" : "orange";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
  ];
  return (
    <div className="layout-container">
      {isModalOpen && (
        <OrderDetail
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          orderDetail={orderDetail}
        />
      )}
      <Table
        dataSource={orderData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        className="table-container"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
    </div>
  );
}

export default Order;
