import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
    headers: jest.fn()
}))

beforeAll(async () => {
    await prisma.$connect()
    await prisma.user.create({
        data: {
            email: "other@gmailcom",
            name: "Example",
            password: hashData("any password"),
            birthday: new Date().toISOString()
        }
    })
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

    formData.append("email","other@gmailcom")
    formData.append("password","any password")

    const requestObj: NextRequest = {
        formData: async () => formData,
    }as any

    const response = await POST(requestObj)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("user")
})