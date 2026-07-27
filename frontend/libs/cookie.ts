type CookieOptions = {
    maxAge?: number; // seconds
    path?: string;
    sameSite?: "lax" | "strict" | "none";
    secure?: boolean;
};

export function setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
) {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
        cookie += `; Max-Age=${options.maxAge}`;
    }

    cookie += `; Path=${options.path ?? "/"}`;
    cookie += `; SameSite=${options.sameSite ?? "Lax"}`;

    if (options.secure) {
        cookie += `; Secure`;
    }

    document.cookie = cookie;
}

export function deleteCookie(name: string) {
    document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; Path=/`;
}
