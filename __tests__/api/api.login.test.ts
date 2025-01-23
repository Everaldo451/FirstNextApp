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


it("successfull login",async () => {

    const data = {
        email: "other@gmail.com",
        password: "any password",
    };

    (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id:1,
        email:data.email,
        password: hashData(data.password)
    })

    const formData = new FormData()

    formData.append("email",data.email);
    formData.append("password",data.password);

    const requestObj: NextRequest = {
        formData: async () => formData,
    }as any

    const response = await POST(requestObj)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveProperty("user")
    expect(body.user.email).toBe(data.email)
})