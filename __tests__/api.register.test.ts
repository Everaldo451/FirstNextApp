import { POST } from "@/app/api/auth/register/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { cookies, headers } from "next/headers";

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
    headers: jest.fn()
}))

beforeAll(async () => {
    await prisma.$connect()
})

afterAll(async () => {
    await prisma.user.deleteMany({
        where: {
            id: 1
        }
    })
    await prisma.$disconnect()
})


it("successfull register",async () => {

    const formData = new FormData()

    formData.append("email","example@gmailcom")
    formData.append("name","Example")
    formData.append("password","any password")
    formData.append("birthday", new Date().toISOString())

    const requestObj: NextRequest = {
        formData: async () => formData
    } as any

    const response = await POST(requestObj)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("user")
})