import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";
import { cookies } from "next/headers";
import createJsonResponse from "@/lib/createResponse";
import loginUser from "@/lib/loginUser";
import jwtServiceInstance from "@/lib/jwtService";

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

        const cookieStore = await cookies()
        jwtServiceInstance.setAccessCookie(user.id, cookieStore)
        jwtServiceInstance.setRefreshCookie(user.id, cookieStore)
        
        return createJsonResponse("User login did successfull.",200)
    }catch(error) {
        return createJsonResponse("Internal server Error.",500)
    }
}