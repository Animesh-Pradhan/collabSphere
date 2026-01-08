import { ReactNode } from "react";
import { LuLayoutDashboard, LuFolder, LuUsers, LuSettings } from "react-icons/lu";

export interface SidebarRoute {
    label: string;
    path: string;
    icon: ReactNode;
}

export const SIDEBAR_ROUTES = [
    { label: "Dashboard", path: "/", icon: LuLayoutDashboard },
    { label: "Projects", path: "/projects", icon: LuFolder },
    { label: "Users", path: "/users", icon: LuUsers },
    { label: "Settings", path: "/settings", icon: LuSettings },
];
