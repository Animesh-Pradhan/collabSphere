"use client";

import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export default function useAppMutation<TData, TVariables, TError = unknown>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: UseMutationOptions<TData, TError, TVariables>
) {
    return useMutation<TData, TError, TVariables>({ mutationFn, ...options });
}
