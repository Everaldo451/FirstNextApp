import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import Joi from "joi";
import createJsonResponse from "@/lib/createResponse";
import JWT from "@/services/JWTService";
import loginUser from "@/lib/loginUser";

const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    password: Joi.string(),
    birthday: Joi.string()
})

export async function POST(request:NextRequest){
    const formData = await request.formData()

    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    }

    const {value, error} = schema.validate(data)
    if (error) {return createJsonResponse("Invalid credentials.",400)}

    try {
        const user = await loginUser(value.email, value.password)
        if (!user) {
            return createJsonResponse("Login unauthorized.", 401)
        }

        const cookieStore = await cookies()
        JWT.setAccessCookie(user.id, cookieStore)
        JWT.setRefreshCookie(user.id, cookieStore)
        JWT.setCSRFCookie(
            JWT.createCSRFToken(),
            cookieStore
        )
        
        return createJsonResponse("User login did successfull.",200,{
            user: {name: user.name, email: user.email}
        })
    }catch(error) {
        return createJsonResponse("Internal server Error.",500)
    }
}