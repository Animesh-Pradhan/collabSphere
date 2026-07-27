"use client";

import { useRouter } from "next/navigation";
import ErrorLayout from "./ErrorLayout";
import { getErrorMeta } from "@/libs/getErrorMeta";

export default function UnauthorizedPage({ error }: { error: Error & { statusCode?: number }; }) {
    const router = useRouter();
    const { title, codeMessage } = getErrorMeta(error?.statusCode);

    return (
        <ErrorLayout
            title={title}
            code={codeMessage}
            description={error.message}
            action={{ label: "Go to Login", onClick: () => router.push("/auth/login") }}
        />
    );
}