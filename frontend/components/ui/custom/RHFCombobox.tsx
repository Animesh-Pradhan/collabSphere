"use client";

import { Controller, type Control } from "react-hook-form";
import UICombobox from "./UICombobox";

type RHFComboboxProps = {
    name: string;
    control: Control<any>;
    data: { label: string; value: string }[];
    placeholder?: string;
};

export default function RHFCombobox({
    name,
    control,
    data,
    placeholder,
}: RHFComboboxProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <UICombobox
                    data={data}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    invalid={!!fieldState.error}
                    placeholder={placeholder}
                />
            )}
        />
    );
}