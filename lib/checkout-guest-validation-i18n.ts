import type { Dictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

const VALIDATION_ERROR_KEY_MAP: Record<string, string> = {
  "Full name is required": "nameRequired",
  "Enter your first and last name": "nameTooShort",
  "Name must be 80 characters or fewer": "nameTooLong",
  "Enter first and last name using letters only": "nameInvalid",
  "Email is required": "emailRequired",
  "Email must be 254 characters or fewer": "emailTooLong",
  "Enter a valid email address": "emailInvalid",
  "Phone number is required": "phoneRequired",
  "Enter a valid 10-digit US phone number": "phoneInvalid",
  "Enter a valid phone number": "phoneGenericInvalid",
  "Street address is required": "addressRequired",
  "Street address is too short": "addressTooShort",
  "Street address must be 100 characters or fewer": "addressTooLong",
  "Include a street number in your address": "addressNoNumber",
  "Enter a valid street address": "addressInvalid",
  "City is required": "cityRequired",
  "Enter a valid city name": "cityInvalid",
  "State is required": "stateRequired",
  "Select a valid US state": "stateInvalid",
  "ZIP code is required": "zipRequired",
  "Enter a valid ZIP code (12345 or 12345-6789)": "zipInvalid",
};

export function translateGuestValidationError(
  dictionary: Dictionary | null | undefined,
  message?: string,
): string | undefined {
  if (!message) return undefined;

  const key = VALIDATION_ERROR_KEY_MAP[message];
  if (key) {
    return t(dictionary, `checkout.guest.validation.${key}`, message);
  }

  return message;
}
