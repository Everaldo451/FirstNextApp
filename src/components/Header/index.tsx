import Link from "next/link"
import styles from "./index.module.css"

export default function Header() {
    return (
        <header className={styles.mainHeader}>
            <nav className={styles.navHeader}>
                <Link href={"/"}>Home</Link>
                <Link href={"/auth/signin"}>Login</Link>
            </nav>
        </header>
    )
}