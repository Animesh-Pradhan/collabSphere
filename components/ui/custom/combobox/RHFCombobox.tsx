"use client";

import { Controller, type Control } from "react-hook-form";
import UICombobox from "./UICombobox";
import { Field, Text } from "@chakra-ui/react";

type RHFComboboxProps = {
    name: string;
    control: Control<any>;
    data: { label: string; value: string }[];
    placeholder?: string;
    multiple?: boolean;
    label?: string;
    required?: boolean;
};

export default function RHFCombobox({
    name,
    control,
    data,
    placeholder,
    multiple = false,
    label,
    required = false
}: RHFComboboxProps) {

    return (
        <Controller
            name={name}
            control={control}
            rules={required ? { required: `${label ?? "This field"} is required` } : undefined}
            render={({ field, fieldState }) => (
                <Field.Root gap={1} invalid={!!fieldState.error}>
                    {label && (<Field.Label>{label}{required && (<Text as="span" color="red.500" ml={1}>*</Text>)}</Field.Label>)}
                    <UICombobox
                        // key={field.value}
                        data={data}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        invalid={!!fieldState.error}
                        placeholder={placeholder}
                        multiple={multiple}
                    />
                    <Field.ErrorText>{fieldState.error?.message}</Field.ErrorText>
                </Field.Root>

            )
            }
        />
    );
}