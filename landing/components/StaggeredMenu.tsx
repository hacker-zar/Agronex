import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Menu, X } from "lucide-react";

type MenuItem = {
  label: string;
  ariaLabel: string;
  link: string;
};

type StaggeredMenuProps = {
  items: MenuItem[];
  primaryAction: MenuItem;
};

export function StaggeredMenu({ items, primaryAction }: StaggeredMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<HTMLAnchorElement[]>([]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!open && panel.style.visibility !== "visible") return;

    let cancelled = false;
    let stopAnimation: (() => void) | undefined;

    void import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const timeline = gsap.timeline();
      stopAnimation = () => timeline.kill();

      if (open) {
        gsap.set(panel, { visibility: "visible" });
        if (reducedMotion) {
          gsap.set(panel, { height: "auto", autoAlpha: 1, y: 0 });
          gsap.set(itemRefs.current, { y: 0, autoAlpha: 1 });
        } else {
          timeline
            .fromTo(panel, { height: 0, autoAlpha: 0, y: -8 }, { height: "auto", autoAlpha: 1, y: 0, duration: 0.42, ease: "power3.out" })
            .fromTo(itemRefs.current, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.34, stagger: 0.065, ease: "power2.out" }, "-=0.2");
        }
      } else if (reducedMotion) {
        gsap.set(panel, { height: 0, autoAlpha: 0, y: -8, visibility: "hidden" });
        gsap.set(itemRefs.current, { y: 22, autoAlpha: 0 });
      } else {
        timeline
          .fromTo(panel, { height: panel.scrollHeight, autoAlpha: 1, y: 0 }, {
            height: 0,
            autoAlpha: 0,
            y: -8,
            duration: 0.26,
            ease: "power2.in",
            onComplete: () => gsap.set(panel, { visibility: "hidden" }),
          })
          .set(itemRefs.current, { y: 22, autoAlpha: 0 });
      }
    });

    return () => {
      cancelled = true;
      stopAnimation?.();
    };
  }, [open]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div className="staggered-menu" ref={rootRef}>
      <button
        className={`staggered-menu-toggle${open ? " staggered-menu-toggle-open" : ""}`}
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="staggered-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "Cerrar" : "Menú"}</span>
        {open ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
      </button>

      <nav
        id="staggered-navigation"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-label="Navegación móvil"
        aria-hidden={!open}
        inert={!open}
      >
        <div className="staggered-menu-items">
          {items.map((item, index) => (
            <a
              key={item.link}
              ref={(element) => { if (element) itemRefs.current[index] = element; }}
              className="staggered-menu-item"
              href={item.link}
              aria-label={item.ariaLabel}
              tabIndex={open ? 0 : -1}
              onClick={close}
            >
              <span className="staggered-menu-number">0{index + 1}</span>
              <span className="staggered-menu-label">{item.label}</span>
              <ArrowDownRight size={19} aria-hidden="true" />
            </a>
          ))}
        </div>
        <a className="staggered-menu-action" href={primaryAction.link} onClick={close} tabIndex={open ? 0 : -1}>
          {primaryAction.label} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
        <p className="staggered-menu-note">Menos incertidumbre, más crecimiento.</p>
      </nav>
    </div>
  );
}
