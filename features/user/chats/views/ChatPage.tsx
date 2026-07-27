"use client";

import { Tabs, Box } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ChatsPage() {
    const router = useRouter();
    const params = useSearchParams();

    const tab = params.get("tab") ?? "dm";

    return (
        <Box h="100%">
            <Tabs.Root
                value={tab}
                onValueChange={(e) => {
                    router.push(`/chats?tab=${e.value}`);
                }}
            >
                <Tabs.List>
                    <Tabs.Trigger value="dm">Direct Messages</Tabs.Trigger>
                    <Tabs.Trigger value="groups">Groups</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="dm">
                    DM content
                </Tabs.Content>

                <Tabs.Content value="groups">
                    Groups content
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
}