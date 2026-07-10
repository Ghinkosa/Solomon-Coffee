import { State } from "country-state-city";

export interface ShippingAddressFields {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export type ShippingAddressField = keyof ShippingAddressFields;

export type ShippingAddressErrors = Partial<
  Record<ShippingAddressField, string>
>;

const US_COUNTRY_CODE = "US";

const US_STATE_CODES = new Set(
  State.getStatesOfCountry(US_COUNTRY_CODE).map((state) => state.isoCode),
);

const US_STATE_NAMES = new Map(
  State.getStatesOfCountry(US_COUNTRY_CODE).map((state) => [
    state.name.toLowerCase(),
    state.isoCode,
  ]),
);

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const NAME_PATTERN =
  /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' .-]*\s+[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ' .-]+$/;

const CITY_PATTERN = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ .'-]{1,48}$/;

const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;

const INVALID_PHONE_DIGITS = new Set([
  "0000000000",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "6666666666",
  "7777777777",
  "8888888888",
  "9999999999",
  "1234567890",
]);

export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
}

export function formatPhoneInput(value: string): string {
  const digits = normalizePhoneDigits(value).slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function normalizeUsState(state: string): string {
  const trimmed = state.trim();
  if (!trimmed) return "";

  const upper = trimmed.toUpperCase();
  if (US_STATE_CODES.has(upper)) {
    return upper;
  }

  return US_STATE_NAMES.get(trimmed.toLowerCase()) || upper;
}

export function normalizeZipCode(zip: string): string {
  const digits = zip.replace(/\D/g, "");
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
}

export function validateShippingAddressField(
  field: ShippingAddressField,
  value: string,
): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "name": {
      if (!trimmed) return "Full name is required";
      if (trimmed.length < 3) return "Enter your first and last name";
      if (trimmed.length > 80) return "Name must be 80 characters or fewer";
      if (!NAME_PATTERN.test(trimmed)) {
        return "Enter first and last name using letters only";
      }
      return undefined;
    }
    case "email": {
      if (!trimmed) return "Email is required";
      if (trimmed.length > 254) return "Email must be 254 characters or fewer";
      if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";
      return undefined;
    }
    case "phone": {
      if (!trimmed) return "Phone number is required";
      const digits = normalizePhoneDigits(trimmed);
      if (digits.length !== 10) {
        return "Enter a valid 10-digit US phone number";
      }
      if (INVALID_PHONE_DIGITS.has(digits)) {
        return "Enter a valid phone number";
      }
      return undefined;
    }
    case "address": {
      if (!trimmed) return "Street address is required";
      if (trimmed.length < 5) return "Street address is too short";
      if (trimmed.length > 100) return "Street address must be 100 characters or fewer";
      if (!/\d/.test(trimmed)) {
        return "Include a street number in your address";
      }
      if (!/[A-Za-z]/.test(trimmed)) {
        return "Enter a valid street address";
      }
      return undefined;
    }
    case "city": {
      if (!trimmed) return "City is required";
      if (!CITY_PATTERN.test(trimmed)) return "Enter a valid city name";
      return undefined;
    }
    case "state": {
      if (!trimmed) return "State is required";
      const normalized = normalizeUsState(trimmed);
      if (!US_STATE_CODES.has(normalized)) {
        return "Select a valid US state";
      }
      return undefined;
    }
    case "zip": {
      const normalized = normalizeZipCode(trimmed);
      if (!normalized) return "ZIP code is required";
      if (!ZIP_PATTERN.test(normalized)) {
        return "Enter a valid ZIP code (12345 or 12345-6789)";
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

export function validateShippingAddress(
  details: ShippingAddressFields,
): ShippingAddressErrors {
  const errors: ShippingAddressErrors = {};

  (Object.keys(details) as ShippingAddressField[]).forEach((field) => {
    const error = validateShippingAddressField(field, details[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

export function isShippingAddressValid(details: ShippingAddressFields): boolean {
  return Object.keys(validateShippingAddress(details)).length === 0;
}

export function normalizeShippingAddress(
  details: ShippingAddressFields,
): ShippingAddressFields {
  return {
    name: details.name.trim().replace(/\s+/g, " "),
    email: details.email.trim().toLowerCase(),
    phone: formatPhoneInput(details.phone),
    address: details.address.trim().replace(/\s+/g, " "),
    city: details.city.trim().replace(/\s+/g, " "),
    state: normalizeUsState(details.state),
    zip: normalizeZipCode(details.zip),
  };
}

export function getUsStateOptions() {
  return State.getStatesOfCountry(US_COUNTRY_CODE).map((state) => ({
    value: state.isoCode,
    label: state.name,
  }));
}
