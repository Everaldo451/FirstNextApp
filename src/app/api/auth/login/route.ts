import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";
import createJsonResponse from "@/lib/createResponse";
import loginUser from "@/lib/loginUser";

export default async function POST(request:NextRequest){
    const {password, email} = await request.json()

    if (!password || !email) {
        return createJsonResponse("Invalid credentials.",400)
    }

    try {
        const user = await loginUser(email, password)
        if (!user) {
            return createJsonResponse("Login unauthorized.", 401)
        }
        return createJsonResponse("User login did successfull.",200)
    }catch(error) {
        return createJsonResponse("Internal server Error.",500)
    }
}