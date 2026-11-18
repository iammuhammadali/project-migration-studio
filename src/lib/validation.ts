import { z } from "zod";

export const CNIC_LENGTH = 13;
export const MIN_APPLICANT_AGE = 5;
export const PHONE_REGEX = /^03\d{9}$/;

export const MSG = {
  type: "Please select an application type.",
  cnic: "CNIC must be exactly 13 digits.",
  age: "Applicant must be at least 5 years old.",
  formCEducation: "Please select an education other than Uneducated for Form C.",
  phone: "Phone number must be 11 digits and start with 03.",
} as const;

/** Keeps digits only, capped at `max` characters. */
export function digitsOnly(value: string, max?: number) {
  const d = value.replace(/\D/g, "");
  return max ? d.slice(0, max) : d;
}

/** Full years between an ISO date (yyyy-MM-dd) and `today`. */
export function ageInYears(dobIso: string, today: Date = new Date()) {
  const [y, m, d] = dobIso.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  let age = today.getFullYear() - y;
  const monthDiff = today.getMonth() + 1 - m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) age -= 1;
  return age;
}

const req = (label: string) => z.string().trim().min(1, `${label} is required`).max(200, `${label} is too long`);
const reqLong = (label: string) => z.string().trim().min(1, `${label} is required`).max(500, `${label} is too long`);

export const cnicSchema = z.object({
  applicationType: z.string().min(1, MSG.type),
  cnic: z.string().regex(/^\d{13}$/, MSG.cnic),
});

export function detailsSchema(today: Date = new Date()) {
  return z.object({
    fullName: req("Name"),
    surname: req("Surname / Caste"),
    relation: req("Relation"),
    fatherName: req("Father / Spouse name"),
    dob: req("Date of birth").refine((v) => ageInYears(v, today) >= MIN_APPLICANT_AGE, MSG.age),
    religion: req("Religion"),
    challanDate: req("Bank challan date"),
    challanNumber: req("Bank challan number"),
  });
}
export type DetailsValues = z.infer<ReturnType<typeof detailsSchema>>;

export const additionalSchema = z.object({
  domicileArea: req("Domicile area"),
  permanentAddress: reqLong("Permanent address"),
  temporaryAddress: reqLong("Temporary address"),
  outsideAddress: z.string().trim().max(500).transform((v) => (v === "" ? "NIL" : v)),
});
export type AdditionalValues = z.input<typeof additionalSchema>;

export function personalSchema(applicationType: string) {
  return z
    .object({
      tehsil: req("Tehsil"),
      unionCouncil: req("Union council"),
      occupation: req("Applicant occupation"),
      fatherOccupation: req("Father's occupation"),
      education: req("Education"),
      placeOfBirth: req("Place of birth"),
      arrivalDate: req("Date of arrival in domicile"),
      maritalStatus: req("Marital status"),
    })
    .superRefine((v, ctx) => {
      if (applicationType === "form_c" && v.education === "Uneducated") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["education"], message: MSG.formCEducation });
      }
    });
}
export type PersonalValues = z.infer<ReturnType<typeof personalSchema>>;

export const electoralSchema = z
  .object({
    electoralRoll: req("Electoral roll"),
    bloodRelationNo: z.string().trim().max(100),
    bloodRelation: z.string().trim().max(50),
    bloodIssuanceDate: z.string().trim().max(20),
    propertyDetails: z.string().trim().max(1000),
    phone: z.string().regex(PHONE_REGEX, MSG.phone),
    homeDelivery: z.enum(["yes", "no"]),
    deliveryAddress: z.string().trim().max(500),
  })
  .superRefine((v, ctx) => {
    if (v.homeDelivery === "yes" && v.deliveryAddress === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deliveryAddress"], message: "Delivery address is required" });
    }
  });
export type ElectoralValues = z.infer<typeof electoralSchema>;

export const authSchema = z.object({
  cnic: z.string().regex(/^\d{13}$/, MSG.cnic),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const registerSchema = authSchema
  .extend({ confirm: z.string() })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export type Errors<K extends string> = Partial<Record<K | "form", string>>;

/** Turns a zod error into a { field: message } map (first message per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Domicile Verification lookup: only an exact 13-digit CNIC is accepted. */
export const verifySchema = z.object({
  cnic: z.string().regex(/^\d{13}$/, MSG.cnic),
});

export const feeAmounts = {
  new: 500,
  correction: 300,
  lost: 400,
  form_c: 500,
  form_d: 500,
} as const;
