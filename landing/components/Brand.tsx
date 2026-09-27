import { ArrowUpRight } from "lucide-react";
import agronexLogo from "../../assets/agronex-logo.png";

export function BrandIcon({ className = "" }: { className?: string }) {
  return <img className={`brand-image ${className}`} src={agronexLogo} alt="" aria-hidden="true" />;
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand-mark${light ? " brand-mark-light" : ""}`}
      href="#inicio"
      aria-label="Agronex, inicio"
    >
      <span className="brand-symbol" aria-hidden="true">
        <BrandIcon />
      </span>
      <span className="brand-word">agronex</span>
      {light && <ArrowUpRight className="brand-arrow" size={14} aria-hidden="true" />}
    </a>
  );
}
