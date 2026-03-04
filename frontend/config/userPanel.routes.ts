import { IconType } from "react-icons";
import { AiOutlineAudit } from "react-icons/ai";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import { FcInvite } from "react-icons/fc";
import { IoChatbubblesSharp } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdAddTask, MdGroups, MdOutlineSecurity } from "react-icons/md";

export interface SidebarRoute {
    label: string;
    path: string;
    icon: IconType;
}

export const SIDEBAR_ROUTES = [
    { label: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
    { label: "Chats", path: "/chats", icon: IoChatbubblesSharp },
    { label: "Workspaces", path: "/workspaces", icon: BsPersonWorkspace },
    { label: "Members", path: "/members", icon: MdGroups },
    { label: "My Tasks", path: "/my-tasks", icon: MdAddTask },
    { label: "Calendar", path: "/calendar", icon: FaCalendarAlt },
];

export const MEMBERS_ROUTE = [
    { label: "All Members", path: "/members", icon: MdGroups },
    { label: "Invitations", path: "/members/invitations", icon: FcInvite },
    { label: "Audit Logs", path: "/members/audit-logs", icon: AiOutlineAudit },
    { label: "Security", path: "/members/security", icon: MdOutlineSecurity },
];