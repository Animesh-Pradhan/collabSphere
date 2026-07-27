import dynamic from "next/dynamic";

const AuthShell = dynamic(() => import("@/components/layout/AuthLayout"))


export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <AuthShell>{children}</AuthShell>
}