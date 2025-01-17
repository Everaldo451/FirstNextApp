import { prisma } from "@/lib/db";
import JWT from "@/services/JWTService";
import { NextRequest } from "next/server";
import createJsonResponse from "@/lib/createResponse";

export async function GET(request:NextRequest) {
    const identity = await JWT.getIdentity(request)

    if (!identity || isNaN(identity)) {
        return createJsonResponse("Unauthorized", 401)
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: identity}
        })

        if (!user) {return createJsonResponse("Unauthorized", 401)}
        return createJsonResponse("Sending user credentials.",200,{
            user: {name: user.name, email: user.email}
        })

    } catch(error) {
        return createJsonResponse("Internal server error.",500)
    }

}