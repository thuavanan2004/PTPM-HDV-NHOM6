import { useRoutes } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import MainLayout from "./layouts/main-layout";
import Dashboard from "./pages/dashboard";
import Tour from "./pages/tour";
import Role from "./pages/roles";
import TourDetail from "./pages/tourDetail";
import CreateNew from "./pages/createNew";
import Category from "./pages/category";
import Destination from "./pages/destination";
import Departure from "./pages/departure";
import Order from "./pages/order";
import Transportation from "./pages/transportation";
import Permissions from "./pages/permissions";
import Account from "./pages/account";
import PrivateRoute from "./components/privateRoute";
import EditTour from "./pages/editTour/";
import checkPermission from "./utils/axios-http/checkPermission";

function App() {
  const routes = useRoutes([
    {
      path: "login",
      element: <Login />,
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          element: <MainLayout />,
          children: [
            {
              path: "/dashboard",
              element: <Dashboard />,
            },
            {
              path: "/tour",
              element: checkPermission("READ_TOUR") ? <Tour /> : <Dashboard />,
            },
            {
              path: "/categories",
              element: checkPermission("READ_CATEGORY") ? (
                <Category />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/departures",
              element: checkPermission("READ_DEPARTURE") ? (
                <Departure />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/destinations",
              element: checkPermission("READ_DESTINATION") ? (
                <Destination />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/transportations",
              element: checkPermission("READ_TRANSPORTATION") ? (
                <Transportation />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/orders",
              element: checkPermission("READ_ORDER") ? (
                <Order />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/roles",
              element: checkPermission("READ_ROLES") ? <Role /> : <Dashboard />,
            },
            {
              path: "/permissions",
              element: checkPermission("READ_PERMISSIONS") ? (
                <Permissions />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/accounts",
              element: checkPermission("READ_ACCOUNT") ? (
                <Account />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/tour-detail/:tourID",
              element: checkPermission("READ_TOUR") ? (
                <TourDetail />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/create-new",
              element: checkPermission("CREATE_TOUR") ? (
                <CreateNew />
              ) : (
                <Dashboard />
              ),
            },
            {
              path: "/edit-tour/:tourId",
              element: checkPermission("UPDATE_TOUR") ? (
                <EditTour />
              ) : (
                <Dashboard />
              ),
            },
          ],
        },
      ],
    },
  ]);
  return <>{routes}</>;
}

export default App;
