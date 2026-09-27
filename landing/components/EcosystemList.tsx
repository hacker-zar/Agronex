import { ArrowUpRight, CircleDashed, Compass, Layers3, MoveUpRight, Sprout } from "lucide-react";

const modules = [
  { name: "NexuDrive", status: "Producto actual", current: true, Icon: Compass },
  { name: "Campañas", status: "En construcción", Icon: Sprout },
  { name: "Calculadora", status: "Próximamente", Icon: Layers3 },
  { name: "Diario digital", status: "Próximamente", Icon: CircleDashed },
  { name: "Servicios agrícolas", status: "Próximamente", Icon: ArrowUpRight },
  { name: "Lo que viene", status: "En evolución", Icon: MoveUpRight },
];

export function EcosystemList() {
  return (
    <div className="ecosystem-list">
      {modules.map(({ name, status, current, Icon }, index) => (
        <div className={`ecosystem-row${current ? " ecosystem-row-current" : ""}`} key={name}>
          <span className="ecosystem-index">0{index + 1}</span>
          <span className="ecosystem-icon"><Icon size={17} strokeWidth={1.7} /></span>
          <strong>{name}</strong>
          <span className={`ecosystem-status${current ? " ecosystem-status-current" : ""}`}>
            <i /> {status}
          </span>
        </div>
      ))}
      <p className="ecosystem-footnote">Una visión amplia, construida paso a paso.</p>
    </div>
  );
}
