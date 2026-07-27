"use client";

import { getErrorMeta } from "@/libs/getErrorMeta";
import ErrorLayout from "./ErrorLayout";

export default function ServerErrorPage({ reset, error }: { reset: () => void, error: Error & { statusCode?: number }; }) {
    const statusCode = error?.statusCode ?? 500;
    const { title, codeMessage } = getErrorMeta(statusCode);

    return (
        <ErrorLayout
            code={codeMessage}
            title={title}
            description={error.message}
            action={{ label: "Retry", onClick: reset }}
        />
    );
}