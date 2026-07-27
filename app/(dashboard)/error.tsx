"use client";

import UnauthorizedPage from "@/components/errors/UnAuthorizedPage";
import ForbiddenPage from "@/components/errors/ForbiddenPage";
import ServerErrorPage from "@/components/errors/ServerErrorPage";

export default function Error({ error, reset }: {
    error: Error & { statusCode?: number };
    reset: () => void;
}) {
    if (error?.statusCode === 401) return <UnauthorizedPage error={error} />;
    if (error?.statusCode === 403) return <ForbiddenPage error={error} />;

    return <ServerErrorPage reset={reset} error={error} />;
}