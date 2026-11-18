// Dropdown options for the domicile application form.

export const RELATIONS = ["S/o", "D/o", "W/o"] as const;

export const RELIGIONS = ["Islam", "Hinduism", "Christianity", "Sikhism", "Parsi", "Other"] as const;

export const DOMICILE_AREAS = ["Rural (Dehi)", "Urban (Shehri)"] as const;

// Hyderabad district talukas and their union councils.
export const TEHSILS: Record<string, string[]> = {
  "Hyderabad City": Array.from({ length: 12 }, (_, i) => `UC-${String(i + 1).padStart(2, "0")} Hyderabad City`),
  Latifabad: Array.from({ length: 12 }, (_, i) => `UC-${String(i + 1).padStart(2, "0")} Latifabad`),
  Qasimabad: Array.from({ length: 8 }, (_, i) => `UC-${String(i + 1).padStart(2, "0")} Qasimabad`),
  "Hyderabad Rural": Array.from({ length: 10 }, (_, i) => `UC-${String(i + 1).padStart(2, "0")} Hyderabad Rural`),
};

export const OCCUPATIONS = [
  "Student",
  "Government Employee",
  "Private Employee",
  "Business",
  "Agriculture",
  "Labour",
  "Housewife",
  "Unemployed",
  "Other",
] as const;

export const EDUCATION = [
  "Primary",
  "Middle",
  "Matric",
  "Inter",
  "Graduate",
  "Master",
  "Uneducated",
] as const;

export const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widow"] as const;


export const BLOOD_RELATIONS = ["Father", "Mother", "Brother", "Sister"] as const;

export const DOCUMENT_TYPES = [
  { key: "photo", label: "Photo", hint: "Upload each applicant", imageOnly: true },
  { key: "cnic", label: "CNIC", hint: "Upload all side image or PDF file" },
  { key: "form_b", label: "Form-B", hint: "Upload all side image or PDF file" },
  { key: "blood_relation", label: "Blood Relation Documents", hint: "Upload all side image or PDF file" },
  { key: "education", label: "Education Certificate", hint: "Upload all side image or PDF file" },
  { key: "property", label: "Property Document/Residence Certificate", hint: "Upload all side image or PDF file" },
  { key: "counter_sign", label: "Counter Sign Form", hint: "Upload all side image or PDF file" },
  { key: "chalan", label: "Chalan Copy", hint: "Upload all side image or PDF file" },
  { key: "other", label: "Other", hint: "Upload all side image or PDF file" },
  { key: "affidavit", label: "Affidavit", hint: "Upload all side image or PDF file" },
  { key: "mukhtiarkar_fc", label: "Report from Mukhtiarkar and FC", hint: "Upload all side image or PDF file" },
  { key: "noc", label: "NOC", hint: "Upload all side image or PDF file" },
  { key: "varisya", label: "Varisya", hint: "Upload all side image or PDF file" },
  { key: "token_list", label: "Token List", hint: "Upload all side image or PDF file" },
  { key: "cancellation", label: "Cancellation Letter", hint: "Upload all side image or PDF file" },
] as const;

export const STEPS = [
  { n: 1, label: "CNIC", path: "applicant-cnic" },
  { n: 2, label: "Details", path: "details" },
  { n: 3, label: "Photo", path: "photo" },
  { n: 4, label: "Address", path: "additional" },
  { n: 5, label: "Personal", path: "personal" },
  { n: 6, label: "Electoral", path: "electoral" },
  { n: 7, label: "Fee", path: "fee" },
] as const;
