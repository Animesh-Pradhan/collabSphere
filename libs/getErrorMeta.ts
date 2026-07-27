export function getErrorMeta(statusCode?: number) {
    switch (statusCode) {
        case 400:
            return {
                title: "Invalid Request",
                codeMessage: "400 - Bad Request",
            };

        case 401:
            return {
                title: "Authentication Required",
                codeMessage: "401 - Unauthorized",
            };

        case 403:
            return {
                title: "Access Restricted",
                codeMessage: "403 - Forbidden",
            };

        case 404:
            return {
                title: "Page Not Found",
                codeMessage: "404 - Not Found",
            };

        case 500:
        default:
            return {
                title: "Something Went Wrong",
                codeMessage: "500 - Internal Server Error",
            };
    }
}