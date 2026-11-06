import { Card } from "@/components/ui";
import { SignInForm } from "@/components/auth-forms";
export const metadata = { title: "Ingresar | Agronex" };
export default function SignInPage() { return <main className="shell page"><div style={{ maxWidth: "30rem", margin: "auto" }}><Card><p className="eyebrow">Agronex</p><h1>Ingresar</h1><SignInForm /><p className="muted">¿Todavía no tenés cuenta? <a href="/registrarse">Registrate</a>.</p></Card></div></main>; }
