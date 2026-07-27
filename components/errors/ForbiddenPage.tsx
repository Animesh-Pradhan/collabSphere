"use client";

import { getErrorMeta } from "@/libs/getErrorMeta";
import ErrorLayout from "./ErrorLayout";
import { useRouter } from "next/navigation";

export default function ForbiddenPage({ error }: { error: Error & { statusCode?: number }; }) {
    const router = useRouter();
    const { title, codeMessage } = getErrorMeta(error?.statusCode);
    return (
        <ErrorLayout
            title={title}
            code={codeMessage}
            description={error.message}
            action={{ label: "Go to Dashboard", onClick: () => router.push("/auth/login") }}
        />
    );
}