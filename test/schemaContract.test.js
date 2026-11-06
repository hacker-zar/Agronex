import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MACHINERY_CATEGORIES,
  DELAY_MINUTES,
  DELAY_TYPES,
  OPERATION_STAGES,
  PRICE_UNITS,
  RESERVATION_STATUSES,
} from "../js/modules/dbMappers.js";

const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

function tableDefinition(name) {
  const match = schema.match(new RegExp(`create table public\\.${name} \\(([\\s\\S]*?)\\n\\);`, "i"));
  assert.ok(match, `No se encontró CREATE TABLE public.${name} en supabase/schema.sql`);
  return match[1];
}

function checkValues(table, column, constraintStart) {
  const expression = new RegExp(`${column}\\s+text[\\s\\S]*?check\\s*\\([\\s\\S]*?${constraintStart}\\s+in\\s*\\(([\\s\\S]*?)\\)`, "i");
  const match = table.match(expression);
  assert.ok(match, `No se encontró CHECK de ${column} en supabase/schema.sql`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((value) => value[1]);
}

test("las categorías, unidades, estados y etapas del mapper coinciden con schema.sql", () => {
  const expected = [
    ["MACHINERY_CATEGORIES", MACHINERY_CATEGORIES, checkValues(tableDefinition("machinery"), "category", "category")],
    ["PRICE_UNITS", PRICE_UNITS, checkValues(tableDefinition("machinery"), "price_unit", "price_unit")],
    ["RESERVATION_STATUSES", RESERVATION_STATUSES, checkValues(tableDefinition("reservations"), "status", "status")],
    ["OPERATION_STAGES", OPERATION_STAGES, checkValues(tableDefinition("reservations"), "operation_stage", "operation_stage is null or operation_stage")],
  ];

  for (const [label, applicationValues, schemaValues] of expected) {
    assert.deepEqual(applicationValues, schemaValues, `${label} difiere de supabase/schema.sql`);
  }
});

test("los tipos y el rango de minutos de demora coinciden con incidents en schema.sql", () => {
  const incidents = tableDefinition("incidents");
  const types = incidents.match(/delay_type\s+text[\s\S]*?in\s*\(([^)]*)\)/i);
  const minutes = incidents.match(/delay_minutes\s+integer[\s\S]*?between\s+(\d+)\s+and\s+(\d+)/i);
  assert.ok(types, "No se encontró CHECK delay_type de public.incidents");
  assert.ok(minutes, "No se encontró rango CHECK delay_minutes de public.incidents");
  assert.deepEqual([...types[1].matchAll(/'([^']+)'/g)].map((match) => match[1]), DELAY_TYPES,
    "DELAY_TYPES difiere de supabase/schema.sql");
  assert.deepEqual({ min: Number(minutes[1]), max: Number(minutes[2]) }, DELAY_MINUTES,
    "DELAY_MINUTES difiere de supabase/schema.sql");
});
