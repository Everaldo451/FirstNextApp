import Link from 'next/link'
import styles from "./index.module.css"

export default function AnotherLink({value, url}:{value:string, url:string}) {
    return <span className={styles.Span}>or <Link href={url}>{value}</Link></span>
}