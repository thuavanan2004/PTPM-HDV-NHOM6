import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { get } from "../../utils/axios-http/axios-http";
import { Spin, message } from "antd";
import { useDispatch } from "react-redux";
import { setPermissions, setAdminInfo } from "../../slice/adminSlice";
import axios from "axios";

const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const baseUrl = import.meta.env.VITE_APP_URL_BE;
  const baseUrl = "http://localhost:5000/api/admin";

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Kiểm tra token
        const token = localStorage.getItem("token");
        const verifyResponse = await axios.post(
          `${baseUrl}/auth/verify-token`,
          { token: token }
        );

        const adminId = verifyResponse.data.id;
        const fullName = verifyResponse.data.fullName;
        const avatar = verifyResponse.data.avatar;

        const roleResponse = await get(`roles/detail/${adminId}`);
        const roleName = roleResponse.name;
        const roleId = roleResponse.id;

        const permissionsResponse = await get(
          `roles/${roleResponse.id}/permissions`
        );
        const permissions = await permissionsResponse.permissions.map(
          (item) => item.name
        );

        dispatch(
          setAdminInfo({ id: adminId, fullName, roleId, roleName, avatar })
        );
        dispatch(setPermissions(permissions));

        if (permissionsResponse.permissions.length > 0) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          message.error("Không có quyền truy cập!");
        }
      } catch (error) {
        console.log("Lỗi khi xác thực token hoặc lấy quyền:", error);
        setIsAuthorized(false);
        message.error("Lỗi khi xác thực token!");
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
