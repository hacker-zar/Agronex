import { Card } from "@/components/ui";
import { SignUpForm } from "@/components/auth-forms";
export const metadata = { title: "Registrarse | Agronex" };
export default function SignUpPage() { return <main className="shell page"><div style={{ maxWidth: "30rem", margin: "auto" }}><Card><p className="eyebrow">Agronex</p><h1>Crear cuenta</h1><SignUpForm /><p className="muted">¿Ya tenés cuenta? <a href="/ingresar">Ingresá</a>.</p></Card></div></main>; }
