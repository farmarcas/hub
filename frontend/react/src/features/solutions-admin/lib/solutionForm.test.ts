import { describe, expect, it } from "vitest";
import { EMPTY_FORM, MESSAGES, toPayload, validate } from "./solutionForm";

const filled = {
  ...EMPTY_FORM,
  name: "Radar CRM",
  url: "https://crm.farmarcas.internal",
  objective: "Centralizar.",
  description: "Carteira.",
  categoryId: "c-1",
  groupIds: ["g-1"],
  accessGroupIds: ["g-2"],
};

describe("validate", () => {
  it("aceita formulário completo", () => {
    expect(validate(filled)).toEqual({});
  });

  it("exige tema ou diretoria e regra de acesso", () => {
    const errors = validate({ ...filled, groupIds: [], accessGroupIds: [] });

    expect(errors.groupIds).toBe(MESSAGES.requiresGroup);
    expect(errors.access).toBe(MESSAGES.requiresAccess);
  });

  it("recusa endereço sem https", () => {
    expect(validate({ ...filled, url: "http://crm" }).url).toBe(MESSAGES.https);
  });
});

describe("toPayload", () => {
  it("descarta grupos e pessoas quando é para toda a empresa", () => {
    const payload = toPayload({ ...filled, accessAll: true, accessUserIds: ["u-1"] });

    expect(payload.access).toEqual({ all: true, groupIds: [], userIds: [] });
  });
});
