import dynamic from "next/dynamic"

const LoginForm = dynamic(() => import("@/features/auth/components/LoginForm"))

export default function LoginPage() {
    return (<LoginForm />)
}
