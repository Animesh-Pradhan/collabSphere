import dynamic from "next/dynamic";

const AppShell = dynamic(() => import('@/components/layout/AppShell'))
const Sidebar = dynamic(() => import('@/components/layout/Sidebar'))
const Navbar = dynamic(() => import('@/components/layout/Navbar'))

export default function DashboardLayout({ children }: {
    children: React.ReactNode;
}) {
    return (
        <AppShell sidebar={<Sidebar />} navbar={<Navbar />}>
            {children}
        </AppShell>
    );
}
