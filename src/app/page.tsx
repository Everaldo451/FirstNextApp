import Image from "next/image";
import styles from "./page.module.css";
import { UserContext } from "@/contexts/UserContext";

export default async function Home() {
  const response = await fetch("http://localhost:3000/api/auth/user")
  const json = await response.json()

  if (response.ok && json.user) {
    console.log(json.user)
  }

  return (
    <div className={styles.page}>
      
    </div>
  );
}
