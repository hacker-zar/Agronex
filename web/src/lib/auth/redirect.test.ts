import { describe, expect, it } from "vitest";
import { loginPath } from "./redirect";

describe("loginPath", () => {
  it("conserva el destino protegido", () => {
    expect(loginPath("/app/perfil?tab=datos")).toBe("/ingresar?next=%2Fapp%2Fperfil%3Ftab%3Ddatos");
  });
});
