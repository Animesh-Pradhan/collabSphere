"use client";

import { Editor, useEditorState } from "@tiptap/react";
import { HStack, Text } from "@chakra-ui/react";

interface DocumentCharacterCounterProps {
    editor: Editor;
}

export default function DocumentCharacterCounter({ editor }: DocumentCharacterCounterProps) {
    const { characters, words } = useEditorState({
        editor,
        selector: ({ editor }) => ({
            characters: editor.storage.characterCount.characters(),
            words: editor.storage.characterCount.words(),
        }),
    });

    return (
        <HStack gap={3} fontSize="xs" color="text.secondary">
            <Text>{words.toLocaleString()} words</Text>
            <Text>•</Text>
            <Text>{characters.toLocaleString()} characters</Text>
        </HStack>
    );
}