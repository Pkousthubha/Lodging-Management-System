// src/utils/validationRuleHelper.js
import {
  Patterns,
  required,
  isValidAadhaarVerhoeff
} from "./Validation.js";

/**
 * Helper for quickly generating FieldRule[] for a form.
 *
 * Examples:
 *  const rules = buildRules({
 *    email: { required: "Enter The Email ID.", type: "email" },
 *    pwd:   { required: true, minLength: 6 },
 *    confirmPwd: { required: true, confirmWith: "pwd", message: "Passwords do not match." },
 *    aadhaar: { required: true, type: "aadhaar", useAadhaarChecksum: true }
 *  });
 */

export function buildRules(config) {
  const rules = [];

  for (const key in config) {
    const {
      required: req,
      type,
      minLength,
      maxLength,
      oneOf,
      numberRange,
      trim,
      confirmWith,
      message,
      useAadhaarChecksum
    } = config[key];

    const field = { key };

    // Trim override
    if (typeof trim === "boolean") {
      field.trim = trim;
    }

    // Required
    if (req) {
      const msg = typeof req === "string" ? req : `Enter the ${key}.`;
      field.required = required(msg);
    }

    // Pattern by type
    if (type) {
      let pattern;
      let patternMsg = message;

      switch (type) {
        case "email":
          pattern = Patterns.email;
          patternMsg ||= "Enter a valid Email ID.";
          break;
        case "mobile":
          pattern = Patterns.mobileIndia;
          patternMsg ||= "Enter a valid Mobile Number.";
          break;
        case "pincode":
          pattern = Patterns.pincodeIndia;
          patternMsg ||= "Enter a valid PIN Code.";
          break;
        case "pan":
          pattern = Patterns.panIndia;
          patternMsg ||= "Enter a valid PAN Number.";
          break;
        case "website":
          pattern = Patterns.website;
          patternMsg ||= "Enter a valid Website URL.";
          break;
        case "ifsc":
          pattern = Patterns.ifsc;
          patternMsg ||= "Enter a valid IFSC Code.";
          break;
        case "bankAccount":
          pattern = Patterns.bankAccountIndia;
          patternMsg ||= "Enter a valid Bank Account Number.";
          break;
        case "aadhaar":
          pattern = Patterns.aadhaarDigits;
          patternMsg ||= "Enter a valid 12-digit Aadhaar Number.";
          break;
      }

      if (pattern) {
        field.pattern = { value: pattern, message: patternMsg };
      }
    }

    // Min/Max length
    if (minLength) {
      field.minLength = {
        value: minLength,
        message: message || `Minimum ${minLength} characters required.`
      };
    }

    if (maxLength) {
      field.maxLength = {
        value: maxLength,
        message: message || `Maximum ${maxLength} characters allowed.`
      };
    }

    // oneOf
    if (oneOf && oneOf.length) {
      field.oneOf = {
        values: oneOf,
        message: message || `Value must be one of: ${oneOf.join(", ")}.`
      };
    }

    // numberRange
    if (numberRange) {
      field.numberRange = {
        ...numberRange,
        message:
          message ||
          `Value must be${numberRange.min !== undefined ? ` ≥ ${numberRange.min}` : ""}${
            numberRange.max !== undefined ? ` and ≤ ${numberRange.max}` : ""
          }.`
      };
    }

    // confirmWith (cross-field equality)
    if (confirmWith) {
      const confirmMsg = message || "Values do not match.";
      const prevCustom = field.custom;

      field.custom = {
        isValid: (v, all) =>
          (prevCustom ? prevCustom.isValid(v, all) : true) &&
          v === all[confirmWith],
        message: confirmMsg
      };
    }

    // Aadhaar checksum validation
    if (type === "aadhaar" && useAadhaarChecksum) {
      const prevCustom = field.custom;

      field.custom = {
        isValid: (v, all) =>
          (prevCustom ? prevCustom.isValid(v, all) : true) &&
          Patterns.aadhaarDigits.test(v) &&
          isValidAadhaarVerhoeff(v),
        message: message || "Invalid Aadhaar (checksum failed)."
      };
    }

    rules.push(field);
  }

  return rules;
}
