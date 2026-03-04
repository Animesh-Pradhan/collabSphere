"use client";

import Link from 'next/link';
import { Field, Flex, GridItem, Heading, InputGroup, Separator, SimpleGrid, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';


import { LoginPayload } from '@/services/auth.service';
import { loginRules } from '../validations/login.rules';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { RHFInputField, UIButton, UIAlert } from '@/components/ui/custom';
import { PasswordInput } from '@/components/ui/chakra/password-input';


import { IoMailOutline } from 'react-icons/io5';
import { FaFacebookF, FaGoogle, FaShieldAlt } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { useLogout } from '../hooks/useLogout';


const LoginForm: React.FC = () => {
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

    const { register, handleSubmit, formState: { errors } } = useForm<LoginPayload>();
    const { register: formRegister, loading, error, resetError } = useLogin();
    const { logout } = useLogout()

    const onSubmit = (data: LoginPayload) => {
        // console.log("LOGIN DATA 👉", data);
        logout();
        formRegister(data);
    };

    return (
        <Flex h={'100%'} w={'100%'} alignItems={'start'} justifyContent={{ base: 'flex-start', md: 'center' }} flexDir={'column'} py={{ base: 4, md: 6 }} px={{ base: 4, md: 10, lg: 12, xl: 14 }}>
            <Heading fontSize={{ base: '24px', md: '42px' }} fontWeight={'medium'} letterSpacing="-0.5px">Login to your account</Heading>

            <Flex mt={4} gap={2}>
                <Text>Don&apos;t have an account?</Text>
                <Link href={redirect ? `/auth/register?redirect=${encodeURIComponent(redirect)}` : "/auth/register"}>
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
                        Register
                    </Text>
                </Link>
            </Flex>

            <Flex as={'form'} flexDir={'column'} w={'100%'} mt={10} gap={'20px'} width={'100%'} onSubmit={handleSubmit(onSubmit)}>
                {error && <UIAlert title={error} onClose={resetError} />}
                <SimpleGrid columns={{ base: 1, md: 2 }} gapX={2} gapY={2}>
                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <RHFInputField
                            label="Email" name="email" placeholder="eg: (some@gmail.com)" required={true}
                            register={register} error={errors.email}
                            rules={loginRules.email}
                            inputGroupProps={{ startElement: < IoMailOutline /> }}
                        />
                    </GridItem>

                    <GridItem colSpan={{ base: 1, md: 2 }}>
                        <Field.Root gap={1} invalid={!!errors.password}>
                            <Field.Label>Password <Text as="span" color="red.500" ml={1}>*</Text></Field.Label>
                            <InputGroup startElement={<FaShieldAlt />}>
                                <PasswordInput size='sm' placeholder='eg: (********)' borderRadius={'full'} bg={'pallete.primary'}
                                    {...register("password", loginRules.password)}
                                />
                            </InputGroup>
                            <Field.ErrorText><Field.ErrorIcon size={'xs'} />{errors.password?.message}</Field.ErrorText>
                        </Field.Root>
                    </GridItem>
                </SimpleGrid>

                <UIButton type="submit" btnType={'primary'} borderRadius={'full'} size='sm' loading={loading}>Login</UIButton>

                <Link href="/auth/forgot-password" style={{ marginTop: "-20px", textAlign: 'end' }}>
                    <Text as="span" fontWeight={600} fontSize={'14px'} position="relative" cursor="pointer"
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
                        Forgot Paassword?
                    </Text>
                </Link>

                <Flex gap={2} alignItems={'center'}>
                    <Separator flex="1" />
                    <Text fontSize="14px" whiteSpace="nowrap" color="gray.500">or Login with</Text>
                    <Separator flex="1" />
                </Flex>

                <Flex gap={2} alignItems={'center'} pb={'10px'}>
                    <UIButton flex={'1'} btnType={'outline'} borderRadius={'full'} size='sm'><FaGoogle style={{ color: "#ff8000" }} />Google</UIButton>
                    <UIButton flex={'1'} btnType={'outline'} borderRadius={'full'} size='sm'><FaFacebookF style={{ color: "#0056ff" }} />Facebook</UIButton>
                </Flex>

            </Flex>
        </Flex>
    );
};

export default LoginForm;