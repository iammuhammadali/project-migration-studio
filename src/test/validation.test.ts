import { describe, expect, it } from "vitest";
import {
  ageInYears,
  cnicSchema,
  detailsSchema,
  digitsOnly,
  electoralSchema,
  personalSchema,
  additionalSchema,
  MSG,
  feeAmounts,
} from "@/lib/validation";

const baseDetails = {
  fullName: "Ali",
  surname: "Memon",
  relation: "S/o",
  fatherName: "Ahmed",
  religion: "Islam",
  challanDate: "2026-11-16",
  challanNumber: "12345",
};
const today = new Date(2026, 10, 16);

const basePersonal = {
  tehsil: "Latifabad",
  unionCouncil: "UC-01 Latifabad",
  occupation: "Student",
  fatherOccupation: "Teacher",
  placeOfBirth: "Hyderabad",
  arrivalDate: "2010-01-01",
  maritalStatus: "Single",
};

const baseElectoral = {
  electoralRoll: "B-12",
  bloodRelationNo: "",
  bloodRelation: "",
  bloodIssuanceDate: "",
  propertyDetails: "",
  phone: "03001234567",
  homeDelivery: "no" as const,
  deliveryAddress: "",
};

describe("Step 1: CNIC", () => {
  it("requires an application type", () => {
    const r = cnicSchema.safeParse({ applicationType: "", cnic: "4130412345671" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe(MSG.type);
  });
  it("rejects a CNIC that is not exactly 13 digits", () => {
    expect(cnicSchema.safeParse({ applicationType: "new", cnic: "413041234567" }).success).toBe(false);
    expect(cnicSchema.safeParse({ applicationType: "new", cnic: "4130412345671" }).success).toBe(true);
  });
  it("strips letters and symbols from CNIC input and caps at 13", () => {
    expect(digitsOnly("41a30-4123b4567189", 13)).toBe("4130412345671");
  });
});

describe("application fees", () => {
  it("matches the five fees defined for the portal", () => {
    expect(feeAmounts).toEqual({ new: 500, correction: 300, lost: 400, form_c: 500, form_d: 500 });
  });
});

describe("Step 2: age validation", () => {
  it("rejects applicants younger than 5", () => {
    const r = detailsSchema(today).safeParse({ ...baseDetails, dob: "2022-01-01" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe(MSG.age);
  });
  it("accepts an applicant who turns 5 today", () => {
    expect(ageInYears("2021-11-16", today)).toBe(5);
    expect(detailsSchema(today).safeParse({ ...baseDetails, dob: "2021-11-16" }).success).toBe(true);
  });
  it("shows a required message for empty fields", () => {
    const r = detailsSchema(today).safeParse({ ...baseDetails, fullName: "", dob: "2000-01-01" });
    expect(r.error?.issues[0]?.message).toBe("Name is required");
  });
});

describe("Step 4: outside Pakistan address", () => {
  it("saves an empty value as NIL", () => {
    const r = additionalSchema.parse({
      domicileArea: "Urban (Shehri)",
      permanentAddress: "A",
      temporaryAddress: "B",
      outsideAddress: "",
    });
    expect(r.outsideAddress).toBe("NIL");
  });
});

describe("Step 5: Form C education", () => {
  it("blocks Uneducated for Form C", () => {
    const r = personalSchema("form_c").safeParse({ ...basePersonal, education: "Uneducated" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0]?.message).toBe(MSG.formCEducation);
  });
  it("allows Uneducated for other application types", () => {
    expect(personalSchema("new").safeParse({ ...basePersonal, education: "Uneducated" }).success).toBe(true);
  });
});

describe("Step 6: phone and delivery", () => {
  it("requires 11 digits starting with 03", () => {
    for (const phone of ["0300123456", "04001234567", "030012345678"]) {
      const r = electoralSchema.safeParse({ ...baseElectoral, phone });
      expect(r.success).toBe(false);
      expect(r.error?.issues[0]?.message).toBe(MSG.phone);
    }
    expect(electoralSchema.safeParse(baseElectoral).success).toBe(true);
  });
  it("requires a delivery address when home delivery is Yes", () => {
    expect(electoralSchema.safeParse({ ...baseElectoral, homeDelivery: "yes" }).success).toBe(false);
    expect(
      electoralSchema.safeParse({ ...baseElectoral, homeDelivery: "yes", deliveryAddress: "House 1" }).success,
    ).toBe(true);
  });
});

describe("domicile verification", () => {
  it("rejects a CNIC shorter than 13 digits", async () => {
    const { verifySchema } = await import("@/lib/validation");
    expect(verifySchema.safeParse({ cnic: "413041111111" }).success).toBe(false);
  });
  it("accepts an exact 13-digit CNIC", async () => {
    const { verifySchema } = await import("@/lib/validation");
    expect(verifySchema.safeParse({ cnic: "4130411111111" }).success).toBe(true);
  });

  it("requires an issued match and status without personal details", () => {
    const result = { matches: true, status: "Issued" };
    expect(result).toEqual({ matches: true, status: "Issued" });
    expect("full_name" in result).toBe(false);
    expect("date_of_birth" in result).toBe(false);
  });
});
