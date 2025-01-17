import AuthBaseForm from "../_components/AuthBaseForm"

export default function RegisterRoute() {
    return (
        <AuthBaseForm url={"/api/auth/login"} redirectUrl={"/"}>
            <input name="email" placeholder="Digite seu email"/>
            <input name="password" type="password" placeholder="Digite sua senha"/>
            <input name="name" placeholder="Digite seu Nome"/>
        </AuthBaseForm>
    )
}