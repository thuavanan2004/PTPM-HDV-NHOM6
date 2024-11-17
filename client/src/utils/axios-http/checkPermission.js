import {
  useSelector
} from "react-redux";
import {
  useMemo
} from "react";

const checkPermission = (permissionName) => {
  const permissions = useSelector((state) => state.admin.permissions);
  // const hasPermission = useMemo(() => {

  // }, [permissions, permissionName]);

  // return hasPermission;
  return permissions.includes(permissionName);
};

export default checkPermission;