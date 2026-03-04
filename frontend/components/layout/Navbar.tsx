"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { Flex, Text, IconButton, Avatar, Menu, Portal } from "@chakra-ui/react";
import { useColorMode } from "../ui/chakra/color-mode";
import { LuMoon, LuSun } from "react-icons/lu";
import { useAuthStore } from "@/store/auth.store";

import { FaCaretDown } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { BsPersonWorkspace } from "react-icons/bs";
import { CiCreditCard1 } from "react-icons/ci";
import { IoSettingsSharp } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { HiOutlineLogout } from "react-icons/hi";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { colorMode, toggleColorMode } = useColorMode();
    const themeToggleRef = useRef<HTMLButtonElement | null>(null);
    const { user } = useAuthStore();
    const { logout } = useLogout();
    const router = useRouter();

    useGSAP(() => {
        if (!themeToggleRef.current) return;
        const icon = themeToggleRef.current.querySelector("svg");
        if (!icon) return;

        gsap.set(icon, { transformOrigin: "50% 50%", transformPerspective: 500 });
        const tl = gsap.timeline();

        tl.fromTo(icon,
            { rotate: colorMode === "dark" ? -360 : 360, scale: 1, opacity: 0 },
            { rotate: 0, scale: 1.1, opacity: 1, duration: 1, ease: "power4.out" }
        ).to(icon, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });

    }, { dependencies: [colorMode] });

    const handleLogout = () => {
        logout();
        router.replace("/auth/login")
    }

    return (
        <Flex h="56px" align="center" justify="space-between" px={6} borderBottom="1px solid" borderColor="pallete.borderSubtle" boxShadow="0 1px 0 rgba(0,0,0,0.08)">
            <Text fontWeight="semibold">Dashboard</Text>

            <Flex alignItems={'center'} gap={2}>
                <IconButton ref={themeToggleRef} aria-label="Toggle theme" onClick={toggleColorMode} borderColor={'pallete.borderSubtle'} variant="ghost" size="sm" rounded="full" color="text" _hover={{ bg: "text.secondary" }}>
                    {colorMode === "dark" ? <LuMoon size={16} /> : <LuSun size={16} />}
                </IconButton>

                <Menu.Root>
                    <Menu.Trigger outline={'none'} display={'flex'} alignItems={'center'} flexDir={'row'} cursor={'pointer'}>
                        <Avatar.Root shape="full" size="sm">
                            <Avatar.Fallback name={`${user?.firstName} ${user?.lastName}`} />
                            {user?.avatar && <Avatar.Image src={user?.avatar} />}
                        </Avatar.Root>
                        <FaCaretDown />
                    </Menu.Trigger>
                    <Portal>
                        <Menu.Positioner>
                            <Menu.Content>
                                <Menu.ItemGroup>
                                    <Flex alignItems={'center'} gap={2} flexDir={'row'} border={'1px solid'} borderColor={'gray.200'} px={2} py='2px' borderRadius={'5px'}>
                                        <Flex flexDir={'column'} alignItems={'self-start'}>
                                            <Text fontWeight={'medium'} fontSize={'14px'}>{user?.firstName} {user?.lastName}</Text>
                                            <Text textDecor={'underline'} color={'text.secondary'} fontSize={'12px'}>{user?.username}</Text>
                                        </Flex>

                                        <Avatar.Root shape="full" size="sm">
                                            <Avatar.Fallback name={`${user?.firstName} ${user?.lastName}`} />
                                            {user?.avatar && <Avatar.Image src={user?.avatar} />}
                                        </Avatar.Root>
                                    </Flex>
                                </Menu.ItemGroup>
                                <Menu.Separator />
                                <Menu.ItemGroup>
                                    <Menu.Item value="profile">
                                        <CgProfile /> Profile
                                    </Menu.Item>
                                    <Menu.Item value="workspace">
                                        <BsPersonWorkspace />  Workspace
                                    </Menu.Item>
                                    <Menu.Item value="subscription">
                                        <CiCreditCard1 /> Subscription
                                    </Menu.Item>
                                    <Menu.Item value="settings">
                                        <IoSettingsSharp />Settings
                                    </Menu.Item>
                                </Menu.ItemGroup>
                                <Menu.Separator />
                                <Menu.ItemGroup>
                                    <Menu.Item value="support"><BiSupport />Help Center</Menu.Item>
                                    <Menu.Item color={'tomato'} value="signout" onClick={handleLogout}><HiOutlineLogout />Sign Out</Menu.Item>
                                </Menu.ItemGroup>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
            </Flex>
        </Flex>
    );
}
