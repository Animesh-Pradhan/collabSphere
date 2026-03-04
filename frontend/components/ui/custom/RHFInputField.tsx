"use client";

import { Field, Input, InputGroup, InputGroupProps, InputProps, Text } from "@chakra-ui/react";
import { FieldError, UseFormRegister } from "react-hook-form";
import type { FieldValues, Path, RegisterOptions } from "react-hook-form";

type RHFInputFieldProps<TFormValues extends FieldValues> = {
    required?: boolean;
    name: Path<TFormValues>;
    label: string;
    placeholder?: string;

    register: UseFormRegister<TFormValues>;
    error?: FieldError;
    rules?: RegisterOptions<TFormValues, Path<TFormValues>>;

    inputProps?: InputProps;
    inputGroupProps?: Omit<InputGroupProps, "children">;
};

export default function RHFInputField<TFormValues extends FieldValues>({
    error, label, required = false,
    name, placeholder,
    register, rules,
    inputProps, inputGroupProps
}: RHFInputFieldProps<TFormValues>) {

    return (
        <Field.Root gap={1} invalid={!!error}>
            <Field.Label>{label}{required && <Text as="span" color="red.500" ml={1}>*</Text>}</Field.Label>
            <InputGroup {...inputGroupProps}>
                <Input placeholder={placeholder} borderRadius="full" bg="pallete.primary"
                    {...register(name, rules)}
                    {...inputProps}
                />
            </InputGroup>

            <Field.ErrorText><Field.ErrorIcon size={'xs'} />{error?.message}</Field.ErrorText>
        </Field.Root>
    );
}
