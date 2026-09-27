import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./Brand";

const links = [
  { href: "#nexudrive", label: "NexuDrive" },
  { href: "#ecosistema", label: "Ecosistema" },
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Brand light />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contacto">
            Hablemos <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a className="button button-lime button-small" href="/">
            Explorar Agronex <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className={`mobile-nav${open ? " mobile-nav-open" : ""}`}
        aria-label="Navegación móvil"
        aria-hidden={!open}
      >
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={close} tabIndex={open ? 0 : -1}>
            {link.label}
          </a>
        ))}
        <a className="mobile-nav-cta" href="/" onClick={close} tabIndex={open ? 0 : -1}>
          Explorar Agronex <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
    </header>
  );
}
