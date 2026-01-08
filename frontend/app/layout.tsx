import { Provider } from "@/components/ui/provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Provider defaultTheme="light">{children}</Provider>
            </body>
        </html>
    );
}
