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


it("successfull register",async () => {

    const formData = new FormData()

    const data = {
        id:1,
        email: "example@gmail.com",
        name: "Example",
        password: "any password",
        birthday: new Date().toISOString()
    }

    formData.append("email",data.email);
    formData.append("name",data.name);
    formData.append("password",data.password);
    formData.append("birthday",data.birthday);

    (prisma.user.create as jest.Mock).mockResolvedValue(data)

    const requestObj: NextRequest = {
        formData: async () => formData
    } as any

    const response = await POST(requestObj)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("user")
    expect(body.user.email).toBe(data.email)
})