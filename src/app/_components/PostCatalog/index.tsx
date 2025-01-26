"use client"

import PostComponent from "../Post"
import { Post } from "@prisma/client"
import { useEffect, useState } from "react"
import { getPosts } from "@/app/page"
import styles from "./index.module.css"

interface CatalogProps {
    initialPosts: Post[],
}

export default async function PostCatalog({initialPosts}:CatalogProps) {
    const [posts, setPosts] = useState<Post[]>([])

    useEffect(() => {
        async function fetchData() { 
            const posts = await getPosts()
            setPosts(prev => [...prev, ...posts])
        }
        fetchData()
    })

    return (
        <>
        {initialPosts.map((value) => <PostComponent {...value}/>)}
        {posts.map((value) => <PostComponent {...value}/>)}
        </>
    )
}