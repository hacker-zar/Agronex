import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Compass,
  Truck,
} from "lucide-react";
import { CapacityPreview } from "./components/CapacityPreview";
import { EcosystemList } from "./components/EcosystemList";
import { HeroVisual } from "./components/HeroVisual";
import { Brand } from "./components/Brand";
import { Navigation } from "./components/Navigation";

const AgronexParticleField = lazy(() => import("./components/AgronexParticleField").then((module) => ({ default: module.AgronexParticleField })));

const steps = [
  {
    number: "01",
    title: "Publicar disponibilidad",
    text: "El contratista publica el transporte, la maquinaria o el servicio que ofrece, con su zona y disponibilidad.",
    Icon: Truck,
  },
  {
    number: "02",
    title: "Consultar opciones",
    text: "Productores y cooperativas revisan las publicaciones y consultan qué opciones hay en la zona.",
    Icon: Compass,
  },
  {
    number: "03",
    title: "Coordinar el trabajo",
    text: "Quien necesita el servicio se contacta con quien lo ofrece para conversar los detalles.",
    Icon: Check,
  },
];

function SectionEyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`section-eyebrow${light ? " section-eyebrow-light" : ""}`}><span />{children}</p>;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-block">
          <Brand light />
          <p>Menos incertidumbre,<br />más crecimiento.</p>
        </div>
        <div className="footer-links">
          <div><span className="footer-label">Explorar</span><a href="#nexudrive">NexuDrive</a><a href="#ecosistema">Ecosistema</a></div>
          <div><span className="footer-label">Contacto</span><a href="mailto:agronex.app@gmail.com">agronex.app@gmail.com</a><a href="https://wa.me/543415158464" target="_blank" rel="noopener noreferrer">WhatsApp <ArrowUpRight size={12} /></a><a href="/legal/terminos-agronex.html" target="_blank" rel="noopener noreferrer">Términos de uso <ArrowUpRight size={12} /></a><a className="footer-cafecito-button" href="https://cafecito.app/agronex" target="_blank" rel="noopener noreferrer"><img src="/landing/cafecito-button.png" alt="Invitame un café en cafecito.app" loading="lazy" /></a></div>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Agronex · Argentina</span><a href="#inicio">Volver al inicio <ArrowUpRight size={13} /></a></div>
    </footer>
  );
}

export default function LandingPage() {
  const [showParticleField, setShowParticleField] = useState(false);
  useEffect(() => {
    // Let the headline and product preview paint before downloading the 3D renderer.
    const timer = window.setTimeout(() => setShowParticleField(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="landing-site">
      <Navigation />
      <main className="w-full">
        <section className="hero-section" id="inicio">
          <div className="hero-glow" aria-hidden="true" />
          {showParticleField && <Suspense fallback={null}><AgronexParticleField /></Suspense>}
          <div className="hero-inner">
            <div className="hero-copy">
              <SectionEyebrow light>Agronex · Plataforma agropecuaria</SectionEyebrow>
              <h1>Conectamos el trabajo del agro.<br /><span>Menos incertidumbre, más crecimiento.</span></h1>
              <p className="hero-description">Encontrá transporte y maquinaria, consultá disponibilidad y conectate con productores, contratistas y cooperativas en un mismo lugar.</p>
              <div className="hero-actions">
                <a className="button button-lime" href="/">Explorar NexuDrive <ArrowUpRight size={17} /></a>
                <a className="button button-quiet" href="#nexudrive">Conocer NexuDrive <ArrowDown size={15} /></a>
              </div>
              <p className="hero-product-status">NexuDrive está en etapa de prueba. Las publicaciones que vas a ver son de demostración.</p>
            </div>
            <HeroVisual />
          </div>
          <a href="#nexudrive" className="hero-scroll" aria-label="Desplazarse a NexuDrive"><span>DESCUBRÍ AGRONEX</span><ArrowDown size={14} /></a>
        </section>

        <section className="context-section section-shell" aria-labelledby="context-title">
          <div className="context-heading">
            <SectionEyebrow>El contexto</SectionEyebrow>
            <h2 id="context-title">Cuando el agro se mueve,<br /><em>cada hora cuenta.</em></h2>
          </div>
          <div className="context-points">
            <article className="context-point"><span>01</span><h3>Buscar lleva tiempo</h3><p>Encontrar transporte agrícola puede depender de llamadas y contactos dispersos.</p></article>
            <article className="context-point"><span>02</span><h3>Cuesta saber quién está disponible</h3><p>La información sobre ubicación y fechas no siempre está reunida en un mismo lugar.</p></article>
            <article className="context-point"><span>03</span><h3>Coordinar suma trabajo</h3><p>Productores, contratistas y cooperativas necesitan ordenar los detalles de cada operación.</p></article>
            <article className="context-point"><span>04</span><h3>Falta una vista compartida</h3><p>Consultar ofertas y disponibilidad ayuda a evaluar opciones antes de ponerse de acuerdo.</p></article>
          </div>
        </section>

        <section className="product-section" id="nexudrive" aria-labelledby="product-title">
          <div className="product-backdrop" aria-hidden="true" />
          <div className="product-inner section-shell">
            <div className="product-intro">
              <div>
                <SectionEyebrow light>El producto actual de Agronex</SectionEyebrow>
                <h2 id="product-title">NexuDrive</h2>
                <p className="product-lede">Transporte y maquinaria<br className="desktop-break" /> a la vista para coordinar mejor.</p>
              </div>
              <p className="product-intro-note">NexuDrive permite consultar publicaciones y conectar a quienes ofrecen y necesitan transporte, maquinaria o servicios agropecuarios. Está en etapa de prueba y las publicaciones son de demostración.</p>
            </div>
            <div className="product-main-grid">
              <CapacityPreview />
              <div className="product-steps">
                {steps.map(({ number, title, text, Icon }) => (
                  <article className="product-step" key={number}>
                    <span className="step-number">{number}</span>
                    <div className="step-content"><span className="step-icon"><Icon size={17} /></span><h3>{title}</h3><p>{text}</p></div>
                    {number !== "03" && <span className="step-connector" aria-hidden="true" />}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="ecosystem-section" id="ecosistema" aria-labelledby="ecosystem-title">
          <div className="ecosystem-inner section-shell">
            <div className="ecosystem-intro"><SectionEyebrow>La plataforma evoluciona</SectionEyebrow><h2 id="ecosystem-title">Una plataforma<br />que <em>crece con el agro.</em></h2><p>NexuDrive es el módulo actual, enfocado en transporte y operaciones agrícolas. Las demás propuestas son líneas de trabajo en evaluación o proyectos futuros, todavía no disponibles.</p></div>
            <EcosystemList />
          </div>
        </section>

        <section className="contact-section" id="contacto" aria-labelledby="contact-title">
          <div className="contact-inner section-shell"><div><SectionEyebrow>El próximo paso</SectionEyebrow><h2 id="contact-title">Conocé Agronex.<br /><em>Imaginemos lo que sigue.</em></h2></div><div className="contact-action"><p>Explorá NexuDrive y conocé la experiencia de publicación y consulta de servicios agropecuarios.</p><a className="button button-dark inline-flex items-center gap-2" href="/">Explorar NexuDrive <ArrowUpRight size={16} /></a></div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
