import Image from "next/image";
import styles from "./page.module.css";

export default async function Home() {

  const response = await fetch("/api/post")

  return (
    <div className={styles.page}>
      
    </div>
  );
}
