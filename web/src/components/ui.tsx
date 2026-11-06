import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Button({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={`button ${className}`} {...props} />; }
export function Input({ id, label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="field" htmlFor={id}>{label}<input id={id} {...props} /></label>; }
export function Card({ children }: { children: ReactNode }) { return <section className="card">{children}</section>; }
export function EmptyState({ title, children }: { title: string; children: ReactNode }) { return <Card><h2>{title}</h2><p className="muted">{children}</p></Card>; }
export function Skeleton() { return <div className="skeleton" aria-label="Cargando" />; }
export function Toast({ message, error = false }: { message?: string; error?: boolean }) { return message ? <p role="status" className={error ? "error" : "success"}>{message}</p> : null; }
