'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import styles from "./index.module.css"

export interface AuthProps {
    url: string,
    redirectUrl: string,
    children?: React.ReactNode,
    afterResponse: (response:Response) => void,
}

export default function AuthBaseForm({url, redirectUrl, children, afterResponse}:AuthProps) {

    const [errorMessage, setErrorMessage] = useState<string|null>(null)
    const router = useRouter()

    async function onSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.currentTarget)

        try {
            const response = await fetch(e.currentTarget.action, {
                method: e.currentTarget.method,
                body: data,
            })
            const json = await response.json()
            if (!response.ok) {throw new Error(json.message)}
            afterResponse(response)
            router.push(redirectUrl)
        } catch (error: unknown) {
            if (error instanceof Error) {setErrorMessage(error.message)}
        }
        
    }

    return (
        <form action={url} onSubmit={onSubmit} method="POST" className={styles.authForm}>
            {children}
            {errorMessage?<p>{errorMessage}</p>:null}
            <input type="submit" value="Send" className={styles.sendInput}/>
        </form>
    )
}