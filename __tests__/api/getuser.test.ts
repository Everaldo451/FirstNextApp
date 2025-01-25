const cookieStore:{[key:string]:[string, {[key:string]:any}|undefined]} = {}
const headerStore:Headers = new Headers()

afterEach(() => {
    headerStore.forEach((value,key) => {
        headerStore.delete(key)
    })

    headerStore.forEach((value,key) => {
        console.log(key, value)
    })

    for (const key of Object.keys(cookieStore)) {
        delete cookieStore[key]
    }
})

jest.mock("next/headers", () => ({
    cookies: jest.fn().mockResolvedValue({
        set: jest.fn(
            (name:string,value:string,cookie?:{[key:string]:any})=>{
                cookieStore[name] = [value, cookie]
            }
        ),
        get: jest.fn(
            (name:string) => {
                const cookie = cookieStore[name]
                if (!cookie) {return undefined}
                return {name:name, value:cookie[0]}
            }
        )
    }),
    headers: jest.fn().mockResolvedValue({
        get: jest.fn((name:string) => headerStore.get(name))
    })
}))

jest.mock("@/lib/db", () => ({
    prisma: {
        user: {
            findUnique: jest.fn((data:{where:{id:number}}) => ({
                id: data.where.id,
                name: "Algum Nome",
                email: "algum@gmail.com"
            }))
        }
    }
}))

import { GET } from "@/app/api/auth/user/route"
import { prisma } from "@/lib/db"
import { cookies, headers } from "next/headers"
import { config, setAccessCookie, setCSRFCookie, createCSRFToken } from "@/services/JWTService"
import { NextRequest } from "next/server"

describe("User Get", () => {

    test("successfull", async () => {
        const requestCookies = await cookies()

        setAccessCookie(1, requestCookies)
        setCSRFCookie(createCSRFToken(), requestCookies)
        const accessToken = requestCookies.get(config.c.accessTokenOptions.cookieOptions.cookieName)
        const csrfToken = requestCookies.get(config.c.csrfOptions.cookieName)

        if (accessToken) {
            headerStore.append(config.c.headerOptions.tokenHeaderName, accessToken.value)
        }
        if (csrfToken) {
            headerStore.append(config.c.csrfOptions.headerName, csrfToken.value)
        }

        const requestObj:NextRequest = {
        } as any

        const response = await GET(requestObj)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toHaveProperty("user")
        expect(body.user.name).toBe("Algum Nome")
        expect(body.user.email).toBe("algum@gmail.com")
    })

    test("invalid token", async () => {
        const requestCookies = await cookies()

        setAccessCookie(1, requestCookies)
        setCSRFCookie(createCSRFToken(), requestCookies)
        const accessToken = requestCookies.get(config.c.accessTokenOptions.cookieOptions.cookieName)
        
        if (accessToken) {
            headerStore.append(config.c.headerOptions.tokenHeaderName, accessToken.value)
        }

        const requestObj:NextRequest = {
        } as any

        const response = await GET(requestObj)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body).toHaveProperty("message")
        expect(body.message).toBe("Missing CSRF token.")
    })
})