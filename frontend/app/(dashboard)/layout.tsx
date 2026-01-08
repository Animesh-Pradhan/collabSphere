import AppShell from "@/components/layout/AppShell";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppShell
            sidebar={<Sidebar />}
            navbar={<Navbar />}
        >
            {children}
        </AppShell>
    );
}
