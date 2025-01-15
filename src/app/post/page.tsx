import PostComponent from "./_components/Post"
import { Post } from "@prisma/client"

export default async function PageRoute() {

    const response = await fetch("/api/post")
    const json = await response.json()

    if (response.status == 200) {
        return (
            <>
            {json.posts.map((value:Post) => <PostComponent {...value}/>)}
            </>
        )
    } else {
        return <h2>{json.message}</h2>
    }
}