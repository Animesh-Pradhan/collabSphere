"use client";

import { showToast } from "@/libs/showToaster";
import { ApiError } from "@/types/api";
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
type AppQueryOptions<TQueryFnData, TError, TData> = Omit<UseQueryOptions<TQueryFnData, TError, TData, QueryKey>, "queryKey" | "queryFn">;

let lastToastMessage = "";

export default function useAppQuery
    <TQueryFnData, TError = Error, TData = TQueryFnData>
    (queryKey: QueryKey, queryFn: () => Promise<TQueryFnData>, options?: AppQueryOptions<TQueryFnData, TError, TData>) {

    return useQuery<TQueryFnData, TError, TData, QueryKey>({
        queryKey,
        queryFn,
        throwOnError: (error) => {
            const apiError = error as ApiError;
            if (apiError?.uiType === "TOAST") {
                if (apiError.message !== lastToastMessage) {
                    lastToastMessage = apiError.message;
                    showToast("error", apiError.message);
                }
                return false;
            }

            return apiError?.uiType === "PAGE";
        },

        retry: (count, error: any) => {
            if (error?.statusCode === 429) return false;
            return count < 2;
        },

        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        ...options
    });
}
