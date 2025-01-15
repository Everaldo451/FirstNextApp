import { useState } from "react"
import styles from "./index.module.css"

export interface AuthProps {
    url: string,
    children: React.ReactNode
}

export default function AuthBaseForm({url, children}:AuthProps) {

    const [errorMessage, setErrorMessage] = useState<string|null>(null)

    async function onSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = new FormData(e.currentTarget)

        try {
            const response = await fetch(e.currentTarget.action, {
                method: e.currentTarget.method,
                body: data
            })
            const json = await response.json()

            if (!response.ok) {throw new Error(json.message)}

        } catch (error: unknown) {
            if (error instanceof Error) {setErrorMessage(error.message)}
        }
        
    }

    return (
        <form action={url} onSubmit={onSubmit}>
            {children}
            {errorMessage?<p>{errorMessage}</p>:null}
            <input type="submit">Send</input>
        </form>
    )
}