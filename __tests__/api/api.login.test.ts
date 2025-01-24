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
            findFirst: jest.fn()
        }
    }
}))

import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";
import { cookies } from "next/headers";

describe("Authentication login", () => {
    const commonData = {
        email: "other@gmail.com",
        password: "Mypas12!",
    }

    function createFormData(data:{[key:string]:any}) {
        const formData = new FormData()
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value)
        }
        return formData
    }

    function configurePrismaMock(data:{[key:string]:any}) {
        (prisma.user.findFirst as jest.Mock).mockResolvedValue({
            id:1,
            email:data.email,
            password: hashData(data.password)
        })
    }

    test("successfull",async () => {

        const data = {...commonData}
        const formData = createFormData(data);
        configurePrismaMock(data)

        const requestObj: NextRequest = {
            formData: async () => formData,
        }as any

        const response = await POST(requestObj)
        const body = await response.json()

        expect(response.status).toBe(200)
        expect(body).toHaveProperty("user")
        expect(body.user.email).toBe(data.email)
    })

    test("invalid password",async () => {

        const data = {...commonData, password:"abc"}
        const formData = createFormData(data);
        configurePrismaMock(data)

        const requestObj: NextRequest = {
            formData: async () => formData,
        }as any

        const response = await POST(requestObj)
        const body = await response.json()

        expect(response.status).toBe(400)
    })
})