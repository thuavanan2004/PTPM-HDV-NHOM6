import React, { useState, useEffect } from "react";
import { Modal, Card, Row, Col, Tag, Divider } from "antd";
import { get } from "../../utils/axios-http/axios-http";

function OrderDetail({ open, onClose, orderDetail }) {
  const [tourData, setTourData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTour = async () => {
      const tour = await get(
        `tour_detail/${orderDetail.orderItem.tourDetailId}/getTour`
      );

      setTourData(tour);
      setLoading(false);
    };

    if (orderDetail?.orderItem?.tourDetailId) {
      fetchTour();
    }
  }, [orderDetail]);

  const handleOk = async () => {
    // Logic khi bấm OK
  };

  const order = orderDetail?.order;
  const transaction = orderDetail?.transaction;
  const orderItem = orderDetail?.orderItem;

  return (
    <Modal
      title="Chi tiết đơn hàng"
      open={open}
      loading={loading}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      width={800} // Tùy chỉnh kích thước modal nếu cần
    >
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Thông tin người đặt hàng">
            <Row gutter={16}>
              <Col span={8}>
                <strong>Họ và tên:</strong> {order?.fullName}
              </Col>
              <Col span={8}>
                <strong>Email:</strong> {order?.email}
              </Col>
              <Col span={8}>
                <strong>Số điện thoại:</strong> {order?.phoneNumber}
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <strong>Địa chỉ:</strong> {order?.address}
              </Col>
              <Col span={8}>
                <strong>Trạng thái:</strong>
                <Tag color={order?.status === "pending" ? "orange" : "green"}>
                  {order?.status.toUpperCase()}
                </Tag>
              </Col>
              <Col span={8}>
                <strong>Ngày đặt:</strong>{" "}
                {order?.createdAt
                  ? new Date(order?.createdAt).toLocaleString()
                  : "Chưa có ngày"}
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thông tin đơn thanh toán">
            <Row gutter={16}>
              <Col span={8}>
                <strong>Mã giao dịch:</strong> {transaction?.code}
              </Col>
              <Col span={8}>
                <strong>Phương thức thanh toán:</strong>{" "}
                {transaction?.paymentMethod}
              </Col>
              <Col span={8}>
                <strong>Số tiền:</strong> {transaction?.amount.toLocaleString()}{" "}
                VND
              </Col>
              <Col span={8}>
                <strong>Trạng thái thanh toán:</strong>
                <Tag
                  color={transaction?.status === "pending" ? "orange" : "green"}
                >
                  {transaction?.status.toUpperCase()}
                </Tag>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Thông tin">
        <Row gutter={16}>
          {/* Tour Information */}
          <Col span={12}>
            <Card title="Thông tin tour">
              <Row>
                <Col span={24}>
                  <strong>Tên tour:</strong> {tourData?.tour.title}
                </Col>
                <Col span={24}>
                  <strong>Mã tour:</strong> {tourData?.tour.code}
                </Col>
                <Col span={24}>
                  <strong>Trạng thái:</strong>
                  <Tag color={tourData?.tour.status ? "green" : "red"}>
                    {tourData?.tour.status
                      ? "Đang hoạt động"
                      : "Ngừng hoạt động"}
                  </Tag>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Image */}
          <Col span={12}>
            <Card title="Hình ảnh tour">
              <img
                src={tourData?.image.source}
                alt="Tour Image"
                style={{ width: "100%", height: "auto" }}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          {/* Order Information */}
          <Col span={12}>
            <Card title="Thông tin đơn hàng">
              <Row>
                <Col span={24}>
                  <strong>Mã đơn hàng:</strong> {orderItem?.orderId}
                </Col>
                <Col span={12}>
                  <strong>Số lượng người lớn:</strong>{" "}
                  {orderItem?.adultQuantity}
                </Col>
                <Col span={12}>
                  <strong>Giá người lớn:</strong>{" "}
                  {orderItem?.adultPrice.toLocaleString()} VND
                </Col>
                <Col span={12}>
                  <strong>Số lượng trẻ em:</strong>{" "}
                  {orderItem?.childrenQuantity}
                </Col>
                <Col span={12}>
                  <strong>Giá trẻ em:</strong>{" "}
                  {orderItem?.childrenPrice.toLocaleString()} VND
                </Col>
                <Col span={24}>
                  <strong>Ghi chú:</strong> {orderItem?.note}
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
}

export default OrderDetail;
