import { ArrowUpRight } from "lucide-react";
import { Brand } from "./Brand";
import { StaggeredMenu } from "./StaggeredMenu";

const links = [
  { link: "#nexudrive", label: "NexuDrive", ariaLabel: "Conocer NexuDrive" },
  { link: "#ecosistema", label: "Ecosistema", ariaLabel: "Explorar el ecosistema Agronex" },
  { link: "#contacto", label: "Hablemos", ariaLabel: "Ir a contacto" },
];

export function Navigation() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Brand light />
        <nav className="desktop-nav" aria-label="Navegación principal">
          {links.map((link) => (
            <a key={link.link} href={link.link}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a className="header-contact" href="#contacto">
            Hablemos <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a className="button button-lime button-small" href="/">
            Explorar NexuDrive <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </div>
      <StaggeredMenu
        items={links}
        primaryAction={{ label: "Explorar NexuDrive", ariaLabel: "Explorar NexuDrive", link: "/" }}
      />
    </header>
  );
}
