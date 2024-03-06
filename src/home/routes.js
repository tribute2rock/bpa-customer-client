import React from "react";
import metaRoutes from "./meta_routes";

const Home = React.lazy(() => import("./views/"));
const Subcategory = React.lazy(() => import("./views/category/Subcategory"));
const FormList = React.lazy(() => import("./views/forms/formList"));
const Form = React.lazy(() => import("./views/forms/form"));
// const AuthPermission =
const RequestHistory = React.lazy(() => import("./views/request/history"));
const FormVerify = React.lazy(() =>
  import("./views/requestVerification/editFormVerification")
);
const FormEdit = React.lazy(() => import("./views/forms/formEdit"));
const RequestDetails = React.lazy(() => import("./views/request/requestDetails"));

const routes = [
  {
    path: metaRoutes.home,
    exact: true,
    name: "Home",
    component: Home,
  },
  {
    path: metaRoutes.subcategory,
    exact: true,
    name: "Subcategory List",
    component: Subcategory,
  },
  {
    path: metaRoutes.formLists,
    exact: true,
    name: "Form List",
    component: FormList,
  },
  {
    path: metaRoutes.form,
    exact: true,
    name: "Form",
    component: Form,
  },
  {
    path: metaRoutes.requestHistory,
    exact: true,
    name: "Request History",
    component: RequestHistory,
    childToParent: "xyz",
  },
  {
    path: metaRoutes.formEditVerify,
    exact: true,
    name: "Form Verify",
    component: FormVerify,
  },
  {
    path: metaRoutes.formEdit,
    exact: true,
    name: "Form Edit",
    component: FormEdit,
  },
  {
    path: metaRoutes.RequestDetails,
    exact: true,
    name: "Form Details",
    component: RequestDetails,
  },
];

export default routes;
