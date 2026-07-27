import { IconType } from "react-icons";
import { AiOutlineAudit } from "react-icons/ai";
import { BsPersonWorkspace } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";
import { FcInvite } from "react-icons/fc";
import { IoChatbubbleEllipsesOutline, IoChatbubblesSharp } from "react-icons/io5";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdAddTask, MdGroups, MdOutlineSecurity } from "react-icons/md";

export interface SidebarRoute {
    label: string;
    path?: string;
    icon?: IconType;
    children?: SidebarRoute[];
}

export const SIDEBAR_ROUTES: SidebarRoute[] = [
    { label: "Dashboard", path: "/dashboard", icon: LuLayoutDashboard },
    {
        label: "Chats",
        path: "/chats",
        icon: IoChatbubblesSharp,
        children: [
            { label: "Direct Messages", path: "/chats?tab=dm", icon: IoChatbubbleEllipsesOutline },
            { label: "Groups", path: "/chats?tab=groups", icon: MdGroups },
        ]
    },
    // { label: "Workspaces", path: "/workspaces", icon: BsPersonWorkspace },
    {
        label: "Members",
        icon: MdGroups,
        children: [
            { label: "All Members", path: "/members", icon: MdGroups },
            { label: "Invitations", path: "/members/invitations", icon: FcInvite },
            { label: "Audit Logs", path: "/members/audit-logs", icon: AiOutlineAudit },
            { label: "Security", path: "/members/security", icon: MdOutlineSecurity },
        ],
    },
    { label: "My Tasks", path: "/my-tasks", icon: MdAddTask },
    { label: "Calendar", path: "/calendar", icon: FaCalendarAlt },
];

export const MEMBERS_ROUTE = [
    { label: "All Members", path: "/members", icon: MdGroups },
    { label: "Invitations", path: "/members/invitations", icon: FcInvite },
    { label: "Audit Logs", path: "/members/audit-logs", icon: AiOutlineAudit },
    { label: "Security", path: "/members/security", icon: MdOutlineSecurity },
];