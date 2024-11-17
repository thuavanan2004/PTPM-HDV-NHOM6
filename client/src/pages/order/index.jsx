import React, { useEffect, useState } from "react";
import './style.scss';
import { Table, Tag } from 'antd';
import { get } from '../../utils/axios-http/axios-http';

function Order() {
  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const response = await get('orders/get-all');
      setOrderData(response?.orders);
      setLoading(false)
    }
    fetchOrder();
  }, []);

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: 'Mã đơn hàng',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'confirmed' ? 'green' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
  ];
  return (
    <div className="order-container">
      <Table
        dataSource={orderData}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="dashboard-table"
      />
    </div>
  )
}

export default Order;
