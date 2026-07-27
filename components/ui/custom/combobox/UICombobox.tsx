"use client";

import { useEffect, type RefObject } from "react";
import {
    Combobox,
    Portal,
    useFilter,
    useListCollection,
} from "@chakra-ui/react";

type ItemType = {
    label: string;
    value: string;
};

type UIComboboxProps = {
    data: ItemType[];
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    onBlur?: () => void;
    name?: string;
    invalid?: boolean;
    contentRef?: RefObject<HTMLDivElement>;
    placeholder?: string;
    multiple?: boolean;
};

const UICombobox = ({
    data,
    value,
    onChange,
    onBlur,
    name,
    invalid,
    contentRef,
    placeholder = "Select From Here",
    multiple = false,
}: UIComboboxProps) => {
    const { contains } = useFilter({ sensitivity: "base" });

    const { collection, filter, set } = useListCollection<ItemType>({
        initialItems: [],
        filter: contains,
    });

    useEffect(() => {
        if (Array.isArray(data)) {
            set(data);
        }
    }, [data, set]);

    const valuesArray = Array.isArray(value) ? value : value ? [value] : [];
    const inputValue = (() => {
        if (valuesArray.length === 0) return "";
        if (valuesArray.length === 1) {
            return (collection.items.find((i) => i.value === valuesArray[0])?.label ?? "");
        }
        return `${valuesArray.length} selected`;
    })();


    return (
        <Combobox.Root
            collection={collection}
            value={valuesArray}
            inputValue={inputValue}
            name={name}
            invalid={invalid}
            onValueChange={({ value }) => { onChange?.(multiple ? value : value[0] ?? "") }}
            onBlur={onBlur}
            onInputValueChange={(e) => filter(e.inputValue)}
            openOnClick
            onOpenChange={(open) => open && filter("")}
            size={'xs'}
            multiple={multiple}
            closeOnSelect={!multiple}
        >
            <Combobox.Control>
                <Combobox.Input placeholder={placeholder} />
                <Combobox.IndicatorGroup>
                    {valuesArray.length > 0 && <Combobox.ClearTrigger />}
                    <Combobox.Trigger />
                </Combobox.IndicatorGroup>
            </Combobox.Control>

            <Portal>
                <Combobox.Positioner zIndex="popover" ref={contentRef}>
                    <Combobox.Content zIndex={9999999}>
                        <Combobox.Empty>No items found</Combobox.Empty>
                        {collection.items.map((item) => (
                            <Combobox.Item key={item.value} item={item}>
                                {item.label}
                                <Combobox.ItemIndicator />
                            </Combobox.Item>
                        ))}
                    </Combobox.Content>
                </Combobox.Positioner>
            </Portal>
        </Combobox.Root>
    );
};

export default UICombobox;