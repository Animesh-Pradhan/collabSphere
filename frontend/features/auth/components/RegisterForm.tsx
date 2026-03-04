"use client";

import { useForm } from "react-hook-form";
import { Field, Flex, GridItem, Heading, InputGroup, Separator, SimpleGrid, Text } from '@chakra-ui/react'
import Link from 'next/link'

import { useRegister } from "@/features/auth/hooks/useRegister";
import { PasswordInput } from '@/components/ui/chakra/password-input'
import { IoMailOutline } from 'react-icons/io5'
import { FaFacebookF, FaGoogle, FaRegUser, FaShieldAlt } from 'react-icons/fa'
import { RegisterPayload } from "@/services/auth.service";

import { registrationRules } from "../validations/registration.rules";
import { RHFInputField, UIButton, UIAlert } from '@/components/ui/custom';
import { useSearchParams } from "next/navigation";
import { useLogout } from "../hooks/useLogout";


export default function RegisterForm() {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterPayload>();
    const { register: formRegister, loading, error, resetError } = useRegister();
    const { logout } = useLogout()

    const onSubmit = (data: RegisterPayload) => {
        // console.log("REGISTER DATA 👉", data);
        logout();
        formRegister(data);
    };

    return (
        <Flex h={'100%'} w={'100%'} alignItems={'start'} justifyContent={{ base: 'flex-start', md: 'center' }} flexDir={'column'} py={{ base: 4, md: 6 }} px={{ base: 4, md: 10, lg: 12, xl: 14 }}>
            <Heading fontSize={{ base: '24px', md: '42px' }} fontWeight={'medium'} letterSpacing="-0.5px">Create an account</Heading>

            <Flex mt={4} gap={2}>
                <Text>Already have an account?</Text>
                <Link href={redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : "/auth/login"}>
                    <Text as="span" fontWeight="600" color="blue.500" position="relative" cursor="pointer"
                        _hover={{ color: "blue.600", _after: { transform: "scaleX(1)" } }}
                        _after={{
                            content: '""', position: "absolute", left: 0, bottom: "-2px", width: "100%", height: "1.5px",
                            transform: "scaleX(0)",
                            transformOrigin: "left",
                            transition: "transform 0.25s ease",
                            bg: "blue.600",
                            willChange: "transform",
                        }}
                    >
                        Login
                    </Text>
                </Link>
            </Flex>

            <Flex as={'form'} flexDir={'column'} w={'100%'} mt={10} gap={'20px'} width={'100%'} onSubmit={handleSubmit(onSubmit)}>
                {error && <UIAlert title={error} onClose={resetError} />}
                <SimpleGrid columns={{ base: 1, md: 2 }} gapX={2} gapY={2}>
                    <GridItem>
                        <RHFInputField
                            label="First Name" name="firstName" placeholder="eg: (Animesh)" required={true}
                            register={register} error={errors.firstName}
                            rules={registrationRules.firstName}
                            inputGroupProps={{ startElement: < FaRegUser /> }}
                        />
                    </GridItem>
                    <GridItem>
                        <RHFInputField
                            label="Last Name" name="lastName" placeholder="eg: (Pradhan)" required={true}
                            register={register} error={errors.lastName}
                            rules={registrationRules.lastName}
                            inputGroupProps={{ startElement: < FaRegUser /> }}
                        />
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <RHFInputField
                            label="User Name" name="username" placeholder="eg: (animesh_06)" required={true}
                            register={register} error={errors.username}
                            rules={registrationRules.username}
                            inputGroupProps={{ startElement: < FaRegUser /> }}
                        />
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <RHFInputField
                            label="Email" name="email" placeholder="eg: (some@gmail.com)" required={true}
                            register={register} error={errors.email}
                            rules={registrationRules.email}
                            inputGroupProps={{ startElement: < IoMailOutline /> }}
                        />
                    </GridItem>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <RHFInputField
                            label="Mobile No" name="mobileNo" placeholder="eg: (8277488392)" required={true}
                            register={register} error={errors.mobileNo}
                            rules={registrationRules.mobileNo}
                            inputGroupProps={{ startAddon: "+91", startAddonProps: { fontSize: '12px', borderRadius: 'full' } }}
                        />
                    </GridItem>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <Field.Root gap={1} invalid={!!errors.password}>
                            <Field.Label>Password <Text as="span" color="red.500" ml={1}>*</Text></Field.Label>
                            <InputGroup startElement={<FaShieldAlt />}>
                                <PasswordInput size='sm' placeholder='eg: (********)' borderRadius={'full'} bg={'pallete.primary'}
                                    {...register("password", registrationRules.password)}
                                />
                            </InputGroup>
                            <Field.ErrorText><Field.ErrorIcon size={'xs'} />{errors.password?.message}</Field.ErrorText>
                        </Field.Root>
                    </GridItem>
                </SimpleGrid>

                <UIButton type="submit" btnType={'primary'} borderRadius={'full'} size='sm' loading={loading}>Create Account</UIButton>

                <Flex gap={2} alignItems={'center'}>
                    <Separator flex="1" />
                    <Text fontSize="14px" whiteSpace="nowrap" color="gray.500">or Register with</Text>
                    <Separator flex="1" />
                </Flex>

                <Flex gap={2} alignItems={'center'} pb={'10px'}>
                    <UIButton flex={'1'} btnType={'outline'} borderRadius={'full'} size='sm'><FaGoogle style={{ color: "#ff8000" }} />Google</UIButton>
                    <UIButton flex={'1'} btnType={'outline'} borderRadius={'full'} size='sm'><FaFacebookF style={{ color: "#0056ff" }} />Facebook</UIButton>
                </Flex>
            </Flex>
        </Flex>
    )
}