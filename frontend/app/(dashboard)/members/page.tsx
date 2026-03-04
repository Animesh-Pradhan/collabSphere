import dynamic from "next/dynamic";

const MembersPage = dynamic(() => import("@/features/user/members/components/MembersPage"));

export default function Members() {
    return <MembersPage />
}