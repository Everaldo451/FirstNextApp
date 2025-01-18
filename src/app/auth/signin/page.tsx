'use client'

import { useContext } from 'react'
import AuthBaseForm from "../_components/AuthBaseForm"
import AuthBaseInput from "../_components/AuthBaseInput"
import AnotherLink from '../_components/Link'
import { UserContext } from "@/contexts/UserContext"


export default function LoginRoute() {
    const [user,setUser] = useContext(UserContext)

    async function afterResponse(response:Response) {
        const json = await response.json()

        if (!response.ok) {throw new Error(json.message)}
        if (json && json.user) {setUser(json.user)}
    }

    return (
        <>
            <AuthBaseForm url={"/api/auth/login"} redirectUrl={"/"} afterResponse={afterResponse}>
                <legend>Sign in</legend>
                <AuthBaseInput name="email" placeholder="Digite seu email"/>
                <AuthBaseInput name="password" type="password" placeholder="Digite sua senha"/>
            </AuthBaseForm>
            <AnotherLink value={"Sign up"} url={"/auth/signup"}/>
        </>
    )
}