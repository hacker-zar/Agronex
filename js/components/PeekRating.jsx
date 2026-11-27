import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import StarIcon from "@hugeicons/core-free-icons/StarIcon";

const ratingLabels = ["Mala", "Regular", "Buena", "Muy buena", "Excelente"];

export default function PeekRating({ defaultValue = 0, onChange, count = 5, labels = ratingLabels, size = 40, lift = 8, magnify = 1.15, riseDuration = 320, popScale = 1.3, activeColor = "#f5b400", idleColor = "#52525b", tipColor = "#27272a", tipTextColor = "#f5f5f5", showTip = true, allowClear = true, showLabels = true, readOnly = false }) {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState(0);
  const [pop, setPop] = useState({ value: 0, token: 0 });
  const starRefs = useRef([]);
  const visibleValue = hoverValue || selectedValue;
  const visibleLabel = labels[visibleValue - 1] || "Elegí una calificación";

  const selectRating = (nextValue) => {
    if (readOnly) return;
    const next = allowClear && selectedValue === nextValue ? 0 : nextValue;
    setSelectedValue(next);
    if (!next) setHoverValue(0);
    setPop((previous) => ({ value: nextValue, token: previous.token + 1 }));
    onChange(next);
  };

  const handleKeyDown = (event, currentValue) => {
    let nextValue = currentValue;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue = Math.min(count, currentValue + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue = Math.max(1, currentValue - 1);
    else if (event.key === "Home") nextValue = 1;
    else if (event.key === "End") nextValue = count;
    else return;

    event.preventDefault();
    starRefs.current[nextValue - 1]?.focus();
    selectRating(nextValue);
  };

  return (
    <div
      className="peek-rating"
      style={{
        "--peek-size": `${size}px`,
        "--peek-lift": `${lift}px`,
        "--peek-magnify": magnify,
        "--peek-rise-duration": `${riseDuration}ms`,
        "--peek-pop-scale": popScale,
        "--peek-active-color": activeColor,
        "--peek-idle-color": idleColor,
        "--peek-tip-color": tipColor,
        "--peek-tip-text-color": tipTextColor,
      }}
      onPointerLeave={() => setHoverValue(0)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) setHoverValue(0);
      }}
    >
      <div className="peek-rating-stars" role="radiogroup" aria-label="Calificación general">
        {Array.from({ length: count }, (_, index) => {
          const starValue = index + 1;
          const active = visibleValue >= starValue;
          const hovered = hoverValue === starValue;
          const popping = pop.value === starValue;
          const label = labels[index] || `${starValue} de ${count}`;
          return (
            <button
              key={starValue}
              ref={(element) => { starRefs.current[index] = element; }}
              className={`peek-rating-star${active ? " is-active" : ""}${hovered ? " is-hovered" : ""}`}
              type="button"
              role="radio"
              aria-checked={selectedValue === starValue}
              aria-label={`${label}, ${starValue} de ${count}`}
              title={`${label} (${starValue} de ${count})`}
              tabIndex={selectedValue === starValue || (selectedValue === 0 && starValue === 1) ? 0 : -1}
              disabled={readOnly}
              onPointerEnter={() => setHoverValue(starValue)}
              onFocus={() => setHoverValue(starValue)}
              onKeyDown={(event) => handleKeyDown(event, starValue)}
              onClick={() => selectRating(starValue)}
            >
              <span key={popping ? pop.token : "idle"} className={`peek-rating-icon${popping ? " is-popping" : ""}`}>
                <HugeiconsIcon icon={StarIcon} size={size} color={active ? activeColor : idleColor} strokeWidth={1.65} aria-hidden="true" />
              </span>
            </button>
          );
        })}
        {showTip && visibleValue > 0 && (
          <span className="peek-rating-tip" style={{ left: `${((visibleValue - 0.5) / count) * 100}%` }} aria-hidden="true">{visibleLabel}</span>
        )}
      </div>
      {showLabels && <p className="peek-rating-label" aria-live="polite">{selectedValue ? visibleLabel : "Elegí de 1 a 5 estrellas"}</p>}
    </div>
  );
}
