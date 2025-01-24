jest.mock("next/headers", () => ({
    cookies: jest.fn().mockResolvedValue({
        set: jest.fn(),
        get: jest.fn()
    }),
    headers: jest.fn()
}))

jest.mock("@/lib/db", () => ({
    prisma: {
        user: {
            create: jest.fn()
        }
    }
}))

import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

describe("Authentication register", () => {
    const commonData = {
        id:1,
        email: "example@gmail.com",
        name: "Example",
        password: "Mypas12?",
        birthday: new Date().toISOString()
    }

    function createFormData(data:{[key:string]:any}) {
        const formData = new FormData()
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value)
        }
        return formData
    }

    function configurePrismaMock(data:{[key:string]:any}) {
        (prisma.user.create as jest.Mock).mockResolvedValue(data)
    }

    test("successfull",async () => {

        const data = {...commonData}
        const formData = createFormData(data);
        configurePrismaMock(data)

        const requestObj: NextRequest = {
            formData: async () => formData
        } as any

        const response = await POST(requestObj)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toHaveProperty("user")
        expect(body.user.email).toBe(data.email)
    })

    test("invalid password",async () => {

        const data = {...commonData, password: "abc"}
        const formData = createFormData(data)
        configurePrismaMock(data)

        const requestObj: NextRequest = {
            formData: async () => formData
        } as any

        const response = await POST(requestObj)
        const body = await response.json()

        expect(response.status).toBe(400)
        expect(body).toHaveProperty("message")
        expect(body.message).toBe("Invalid credentials.")
    })
})