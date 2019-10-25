import VersionControl from "../views/VersionControl/VersionControl.jsx";
import SolutionManagement from "../views/SolutionManagement/SolutionManagement.jsx";

import { Folder } from "@material-ui/icons";

const dashboardRoutes = [
  {
    path: "/versionControl",
    sidebarName: "Version Control",
    navbarName: "Version Control",
    icon: Folder,
    component: VersionControl
  },
  {
    path: "/solution",
    sidebarName: "Solution Packager",
    navbarName: "Solution Packager",
    icon: Folder,
    component: SolutionManagement
  },
  { redirect: true, path: "/", to: "/solution", navbarName: "Redirect" }
];

export default dashboardRoutes;
