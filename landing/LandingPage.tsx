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
    text: "El contratista describe su recurso, dónde está y cuándo puede trabajar.",
    Icon: Truck,
  },
  {
    number: "02",
    title: "Encontrar opciones",
    text: "Productores y cooperativas exploran, filtran y comparan lo que está disponible.",
    Icon: Compass,
  },
  {
    number: "03",
    title: "Elegir y contratar",
    text: "Las partes se conectan para convertir una disponibilidad en una operación concreta.",
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
          <div><span className="footer-label">Contacto</span><a href="mailto:agronex.app@gmail.com">agronex.app@gmail.com</a><a href="https://wa.me/543415158464" target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={12} /></a><a href="/legal/terminos-agronex.html" target="_blank" rel="noreferrer">Términos de uso <ArrowUpRight size={12} /></a></div>
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
              <SectionEyebrow light>Una plataforma para el agro argentino</SectionEyebrow>
              <h1>Menos incertidumbre,<br /><span>más crecimiento.</span></h1>
              <p className="hero-description">Agronex conecta capacidades, recursos y servicios para que el agro pueda coordinarse mejor.</p>
              <div className="hero-actions">
                <a className="button button-lime" href="/">Explorar Agronex <ArrowUpRight size={17} /></a>
                <a className="button button-quiet" href="#nexudrive">Conocer NexuDrive <ArrowDown size={15} /></a>
              </div>
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
            <article className="context-point"><span>01</span><h3>El tiempo se fragmenta</h3><p>Encontrar un camión disponible todavía depende de llamadas, mensajes y contactos dispersos.</p></article>
            <article className="context-point"><span>02</span><h3>La información también</h3><p>Ubicación, fechas y estados viven en planillas que no siempre están actualizadas.</p></article>
            <article className="context-point"><span>03</span><h3>La demanda no espera</h3><p>Cuando una cooperativa se satura, necesita sumar capacidad sin perder días coordinando.</p></article>
            <article className="context-point"><span>04</span><h3>Falta visibilidad</h3><p>Sin un hilo operativo compartido, cada parte toma decisiones con información incompleta.</p></article>
          </div>
        </section>

        <section className="product-section" id="nexudrive" aria-labelledby="product-title">
          <div className="product-backdrop" aria-hidden="true" />
          <div className="product-inner section-shell">
            <div className="product-intro">
              <div>
                <SectionEyebrow light>El producto actual de Agronex</SectionEyebrow>
                <h2 id="product-title">NexuDrive</h2>
                <p className="product-lede">Convertir disponibilidad<br className="desktop-break" /> en una operación concreta.</p>
              </div>
              <p className="product-intro-note">Una forma más clara de encontrar y contratar capacidad para el trabajo agrícola. El transporte es hoy un foco prioritario; la plataforma está pensada para crecer por etapas.</p>
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
            <div className="ecosystem-intro"><SectionEyebrow>La plataforma evoluciona</SectionEyebrow><h2 id="ecosystem-title">Una plataforma<br />que <em>crece con el agro.</em></h2><p>Hoy NexuDrive se enfoca en resolver necesidades operativas, con el transporte como prioridad. La plataforma puede crecer por etapas y conectar otras capacidades del campo.</p></div>
            <EcosystemList />
          </div>
        </section>

        <section className="contact-section" id="contacto" aria-labelledby="contact-title">
          <div className="contact-inner section-shell"><div><SectionEyebrow>El próximo paso</SectionEyebrow><h2 id="contact-title">Conocé Agronex.<br /><em>Imaginemos lo que sigue.</em></h2></div><div className="contact-action"><p>Explorá NexuDrive y conocé cómo estamos conectando capacidades para el agro.</p><a className="button button-dark inline-flex items-center gap-2" href="/">Explorar Agronex <ArrowUpRight size={16} /></a></div></div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
