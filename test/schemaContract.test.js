import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  MACHINERY_CATEGORIES,
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
