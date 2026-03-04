export interface ApiSuccess<T> {
    success: true;
    message: string;
    data: T;
    timestamp: string;
    path: string;
}

export interface ApiErrorResponse {
    success: false;
    message: string;
    statusCode: number;
    errorCode?: string;
    timestamp: string;
    path: string;
    errors?: unknown;
}

/**
 * Frontend error object (what we throw)
 */
export interface ApiError extends Error {
    statusCode: number;
    errorCode?: string;
    errors?: unknown;
    path?: string;
}
