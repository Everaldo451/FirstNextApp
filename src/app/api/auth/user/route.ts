import { prisma } from "@/lib/db";
import { getIdentity } from "@/services/JWTService";
import { NextRequest } from "next/server";
import createJsonResponse from "@/lib/createResponse";

export async function GET(request:NextRequest) {
    const identityOrError = await getIdentity(request)

    if (identityOrError instanceof Error) {
        return createJsonResponse(identityOrError.message, 400)
    }
    if (!identityOrError || isNaN(identityOrError)) {
        return createJsonResponse("Unauthorized", 401)
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: identityOrError}
        })

        if (!user) {return createJsonResponse("Unauthorized", 401)}
        return createJsonResponse("Sending user credentials.",200,{
            user: {name: user.name, email: user.email}
        })

    } catch(error) {
        return createJsonResponse("Internal server error.",500)
    }

}