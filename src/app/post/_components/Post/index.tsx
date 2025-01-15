import { Post } from "@prisma/client";

export default function PostComponent(params:Post) {
    return (
        <section>
            <h3>{params.title}</h3>
            <p>{params.content}</p>
            <p>{params.createdAt.toUTCString()}</p>
        </section>
    )
}