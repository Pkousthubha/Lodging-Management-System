/**
 * Validate an object of values using an array of rules.
 * @param {Object} values - key/value map of form values
 * @param {Array} rules - array of field rule configs (see FieldRule above)
 * @returns {Object} errors - key/errorMessage map
 */
export function validateValues(values, rules) {
  const errors = {};

  for (const rule of rules) {
    const raw = values[rule.key];
    const val =
      (rule.trim ?? true) && typeof raw === "string" ? raw.trim() : raw;

    // 1) Required
    if (
      rule.required?.value &&
      (val === undefined || val === null || val === "")
    ) {
      errors[rule.key] = rule.required.message;
      continue;
    }

    // Skip the rest if empty but not required
    if (val === undefined || val === null || val === "") {
      continue;
    }

    // 2) Pattern
    if (rule.pattern && typeof val === "string" && !rule.pattern.value.test(val)) {
      errors[rule.key] = rule.pattern.message;
      continue;
    }

    // 3) String length
    if (rule.minLength && typeof val === "string" && val.length < rule.minLength.value) {
      errors[rule.key] = rule.minLength.message;
      continue;
    }
    if (rule.maxLength && typeof val === "string" && val.length > rule.maxLength.value) {
      errors[rule.key] = rule.maxLength.message;
      continue;
    }

    // 4) oneOf
    if (rule.oneOf && !rule.oneOf.values.includes(val)) {
      errors[rule.key] = rule.oneOf.message;
      continue;
    }

    // 5) numberRange
    if (rule.numberRange && typeof val === "number") {
      const { min, max, message } = rule.numberRange;
      if ((min !== undefined && val < min) || (max !== undefined && val > max)) {
        errors[rule.key] = message;
        continue;
      }
    }

    // 6) Custom (cross-field etc.)
    if (rule.custom && !rule.custom.isValid(val, values)) {
      errors[rule.key] = rule.custom.message;
      continue;
    }
  }

  return errors;
}

/* -------------------------------------------------------
   Common Patterns (India-centric where applicable)
------------------------------------------------------- */
export const Patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Indian Mobile: optional +91/0 prefix, must start 6-9, exactly 10 digits at core
  mobileIndia: /^(?:(?:\+?91|0)[\s-]?)?[6-9]\d{9}$/,

  // India PIN code: 6 digits, cannot start with 0
  pincodeIndia: /^[1-9]\d{5}$/,

  // PAN: 5 letters + 4 digits + 1 letter (uppercase)
  panIndia: /^[A-Z]{5}[0-9]{4}[A-Z]$/,

  // Website (simple + practical). Accepts http/https optional, requires a dot TLD.
  website: /^(https?:\/\/)?([^\s.]+\.)+[^\s]{2,}$/i,

  // IFSC: 11 chars => 4 letters + 0 + 6 alphanumerics
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,

  // Bank account (generic India): 9–18 digits
  bankAccountIndia: /^\d{9,18}$/,

  // Aadhaar: 12 digits (use with Verhoeff check below for strong validation)
  aadhaarDigits: /^\d{12}$/,
};

/* -------------------------------------------------------
   Aadhaar Verhoeff checksum (strong validation)
   Usage: Aadhaar is valid if:
     Patterns.aadhaarDigits.test(value) && isValidAadhaarVerhoeff(value)
------------------------------------------------------- */
const dTable = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,2,3,4,0,6,7,8,9,5],
  [2,3,4,0,1,7,8,9,5,6],
  [3,4,0,1,2,8,9,5,6,7],
  [4,0,1,2,3,9,5,6,7,8],
  [5,9,8,7,6,0,4,3,2,1],
  [6,5,9,8,7,1,0,4,3,2],
  [7,6,5,9,8,2,1,0,4,3],
  [8,7,6,5,9,3,2,1,0,4],
  [9,8,7,6,5,4,3,2,1,0],
];

const pTable = [
  [0,1,2,3,4,5,6,7,8,9],
  [1,5,7,6,2,8,3,0,9,4],
  [5,8,0,3,7,9,6,1,4,2],
  [8,9,1,6,0,4,3,5,2,7],
  [9,4,5,3,1,2,6,8,7,0],
  [4,2,8,6,5,7,3,9,0,1],
  [2,7,9,3,8,0,6,4,1,5],
  [7,0,4,6,9,1,3,2,5,8],
];

/**
 * Strong Aadhaar validation using Verhoeff checksum.
 * @param {string} aadhaar
 * @returns {boolean}
 */
export function isValidAadhaarVerhoeff(aadhaar) {
  if (!Patterns.aadhaarDigits.test(aadhaar)) return false;

  let c = 0;
  const rev = aadhaar.split("").reverse().map(Number);
  for (let i = 0; i < rev.length; i++) {
    c = dTable[c][pTable[i % 8][rev[i]]];
  }
  return c === 0;
}

/* -------------------------------------------------------
   Tiny helper
------------------------------------------------------- */
export const required = (message) => ({ value: true, message });
