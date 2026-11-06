import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { delayTypes, machineryCategories, operationStages, priceUnits, reservationStatuses } from "./contract";

const schema = readFileSync(resolve(process.cwd(), "../supabase/schema.sql"), "utf8");
function values(expression: RegExp) { const match = schema.match(expression); if (!match) throw new Error(`No se encontró el CHECK esperado: ${expression}`); return [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]); }

describe("contrato SQL", () => {
  it("mantiene listas de negocio alineadas al schema", () => {
    expect(machineryCategories).toEqual(values(/category\s+text[\s\S]*?category in\s*\(([^)]*)\)/i));
    expect(priceUnits).toEqual(values(/price_unit\s+text[\s\S]*?price_unit in\s*\(([^)]*)\)/i));
    expect(reservationStatuses).toEqual(values(/status\s+text not null default 'pending'[\s\S]*?status in\s*\(([^)]*)\)/i));
    expect(operationStages).toEqual(values(/operation_stage\s+text[\s\S]*?operation_stage in\s*\(([^)]*)\)/i));
    expect(delayTypes).toEqual(values(/delay_type\s+text[\s\S]*?delay_type in\s*\(([^)]*)\)/i));
  });
});
