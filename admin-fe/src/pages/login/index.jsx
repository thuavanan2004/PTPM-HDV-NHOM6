import React from "react";
import "./style.scss";
import { Button, Form, Input, message } from "antd";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async () => {
    try {
      const values = form.getFieldValue();
      const response = await login(values);
      if (response) {
        message.success("Đăng nhập thành công!");
        navigate("/dashboard");
      } else {
        message.error(response?.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Đăng nhập thất bại! Hãy thử lại sau.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Form form={form} className="form-login" onFinish={onFinish}>
          <h2>LOGIN</h2>
          <p>Email: </p>
          <Form.Item
            className="form-input"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email của bạn!" },
            ]}
          >
            <Input className="input" placeholder="Nhập email của bạn !" />
          </Form.Item>

          <p>Password: </p>
          <Form.Item
            className="form-input"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
            ]}
          >
            <Input.Password
              className="input"
              placeholder="Nhập mật khẩu của bạn !"
            />
          </Form.Item>

          <Form.Item>
            <Button className="button" type="primary" htmlType="submit">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
