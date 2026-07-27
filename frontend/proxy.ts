import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
    "/auth/login",
    "/auth/register",
    "/auth/invite",
    "/auth/forgot-password",
    "/favicon.ico",
];

const VAULT_COOKIE_NAME = process.env.VAULT_COOKIE_NAME || "vaultToken";

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname === "/favicon.ico"
    ) {
        return NextResponse.next();
    }

    const vaultToken = req.cookies.get(VAULT_COOKIE_NAME)?.value;

    if (!vaultToken) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|static|favicon.ico).*)"],
};