import dynamic from "next/dynamic"

const RegisterForm = dynamic(() => import("@/features/auth/components/RegisterForm"))

export default function RegisterPage() {
    return (<RegisterForm />)
}
