"use client";

import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query";
type AppQueryOptions<TQueryFnData, TError, TData> = Omit<UseQueryOptions<TQueryFnData, TError, TData, QueryKey>, "queryKey" | "queryFn">;

export default function useAppQuery
    <TQueryFnData, TError = Error, TData = TQueryFnData>
    (queryKey: QueryKey, queryFn: () => Promise<TQueryFnData>, options?: AppQueryOptions<TQueryFnData, TError, TData>) {

    return useQuery<TQueryFnData, TError, TData, QueryKey>({ queryKey, queryFn, ...options });
}
