"use client";

import { useRouter } from "next/navigation";
import ErrorLayout from "./ErrorLayout";
import { getErrorMeta } from "@/libs/getErrorMeta";

export default function NotFoundPage({ error }: { error: Error & { statusCode?: number }; }) {
    const router = useRouter();
    const { title, codeMessage } = getErrorMeta(error?.statusCode);
    return (
        <ErrorLayout
            title={title}
            code={codeMessage}
            description={error.message}
            action={{ label: "Back to Previous Page", onClick: () => router.back() }}
        />
    );
}