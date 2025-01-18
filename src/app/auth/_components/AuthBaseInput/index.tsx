import { InputHTMLAttributes, useState } from "react"
import styles from "./index.module.css"

export default function AuthBaseInput(params:InputHTMLAttributes<HTMLInputElement>) {

    const [focus, setFocus] = useState<boolean>(false)
    const [value, setValue] = useState("")

    return (
        <div className={styles.Input}>
            <input 
                {...params} 
                placeholder="" 
                id={params.name} 
                className={styles.Input} 
                onInput={(e) => {setValue(e.currentTarget.value)}}
                onFocus={(e) => {setFocus(true)}}
                onBlur={(e) => {!value?setFocus(false):null}}
            />
            {params.placeholder?
                <label 
                    htmlFor={params.name} 
                    className={styles.common + " " + (focus?styles.inFocus:styles.noFocus)}
                >{focus?
                    params.name?
                        params.name.charAt(0).toUpperCase()+params.name.slice(1,params.name.length)+":"
                        :params.placeholder
                    :params.placeholder}</label>
                :null
            }
        </div>
    )
}