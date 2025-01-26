'use server'

import { UserContext } from "@/contexts/UserContext";
import {Post} from "@prisma/client";
import PostCatalog from "./_components/PostCatalog";
import styles from "./page.module.css";

export async function getPosts():Promise<Post[]> {

  const response = await fetch("/api/post")
  const body = await response.json()

  if (!body.posts || !(body.posts satisfies Post[])) {
    return []
  }
  return body.posts

}

export default async function Home(){

  const initialPosts = [
    {
      id:1,
      authorId:1,
      title: "first_post",
      content: `Este é o conteúdo deste post simulado que vai servir
      para teste`,
      createdAt: new Date(Date.now() - 60*60*24*1000*3)
    },
    {
      id:2,
      authorId:1,
      title: "second_post",
      content: `Este é o conteúdo deste segundo post simulado que vai servir
      para teste do segundo post`,
      createdAt: new Date(Date.now() - 60*60*24*1000*8)
    },
  ]

  return (
    <div className={styles.Main}>
      <div className={styles.postCatalog}>
        <PostCatalog initialPosts={initialPosts}/>
      </div>
    </div>
  );
}
