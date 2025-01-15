import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import createJsonResponse from "@/lib/createResponse";

export async function GET(request: NextRequest) {
    try {
        const posts = await prisma.post.findMany()
        return createJsonResponse("Posts finded successful.", 200, {
            posts:posts
        })
    } catch (error) {
        return createJsonResponse("Internal server error.", 500)
    }
}