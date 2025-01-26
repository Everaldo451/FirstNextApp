'use client'

import { Post } from "@prisma/client";
import styles from "./index.module.css"
import { verifyDayDiference, verifyWeekDiference } from "@/lib/verifyDateDiference";
import { useEffect, useState } from "react";


export default function PostComponent(params:Post) {
    const [dateAgo, setDateAgo] = useState<string|undefined>(undefined)

    function verifyDateDiference() {
    
    const [dayBool, dayDiference] = verifyDayDiference(params.createdAt)
    if (dayBool) {setDateAgo(dayDiference);return}

    const [weekBool, weekDiference] = verifyWeekDiference(params.createdAt)
    if (weekBool) {setDateAgo(weekDiference);return}

    }

    useEffect(() => {
        verifyDateDiference()
    })

    return (
        <section className={styles.Post}>
            <h3>{params.title}</h3>
            <p className={styles.content}>{params.content}</p>
            <span className={styles.date}>{dateAgo}</span>
        </section>
    )
}