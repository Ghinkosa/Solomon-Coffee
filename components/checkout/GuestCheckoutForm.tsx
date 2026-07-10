"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatPhoneInput,
  getUsStateOptions,
  isShippingAddressValid,
  normalizeShippingAddress,
  normalizeZipCode,
  type ShippingAddressField,
  type ShippingAddressFields,
  validateShippingAddress,
} from "@/lib/shipping-address-validation";
import { useDictionary } from "@/lib/dictionary-context";
import { translateGuestValidationError } from "@/lib/checkout-guest-validation-i18n";
import type { Dictionary } from "@/lib/dictionary-context";

export type GuestCheckoutDetails = ShippingAddressFields;

interface GuestCheckoutFormProps {
  value: GuestCheckoutDetails;
  onChange: (value: GuestCheckoutDetails) => void;
  showErrors?: boolean;
}

function FieldError({
  message,
  id,
}: {
  message?: string;
  id?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-red-600">
      {message}
    </p>
  );
}

export function GuestCheckoutForm({
  value,
  onChange,
  showErrors = false,
}: GuestCheckoutFormProps) {
  const dictionary = useDictionary() as Dictionary;
  const guest = (dictionary.checkout as Record<string, unknown>)?.guest as
    | Record<string, unknown>
    | undefined;
  const guestLabels = guest as Record<string, string> | undefined;
  const placeholders = guest?.placeholders as Record<string, string> | undefined;
  const [touched, setTouched] = useState<
    Partial<Record<ShippingAddressField, boolean>>
  >({});

  const stateOptions = useMemo(() => getUsStateOptions(), []);
  const errors = useMemo(() => validateShippingAddress(value), [value]);

  const getFieldError = (field: ShippingAddressField) =>
    translateGuestValidationError(dictionary, errors[field]);

  const shouldShowError = (field: ShippingAddressField) =>
    Boolean(errors[field] && (showErrors || touched[field]));

  const updateField = (field: ShippingAddressField, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleBlur = (field: ShippingAddressField) => {
    setTouched((current) => ({ ...current, [field]: true }));
  };

  const inputClassName = (field: ShippingAddressField) =>
    cn(shouldShowError(field) && "border-red-500 focus-visible:ring-red-500");

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-white">
      <div>
        <h3 className="text-lg font-semibold">
          {guestLabels?.title ?? "Guest checkout"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {String(guest?.formDescription ?? guestLabels?.description ??
            "Enter your contact and shipping details to complete your order.")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="guest-name">
            {guestLabels?.fullName ?? "Full name"}
          </Label>
          <Input
            id="guest-name"
            value={value.name}
            onChange={(event) => updateField("name", event.target.value)}
            onBlur={() => handleBlur("name")}
            autoComplete="name"
            placeholder={placeholders?.fullName ?? "Jane Doe"}
            aria-invalid={shouldShowError("name")}
            aria-describedby={shouldShowError("name") ? "guest-name-error" : undefined}
            className={inputClassName("name")}
          />
          {shouldShowError("name") && (
            <FieldError message={getFieldError("name")} id="guest-name-error" />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest-email">{guestLabels?.email ?? "Email"}</Label>
          <Input
            id="guest-email"
            type="email"
            value={value.email}
            onChange={(event) => updateField("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
            placeholder={placeholders?.email ?? "jane@example.com"}
            aria-invalid={shouldShowError("email")}
            aria-describedby={shouldShowError("email") ? "guest-email-error" : undefined}
            className={inputClassName("email")}
          />
          {shouldShowError("email") && (
            <FieldError message={getFieldError("email")} id="guest-email-error" />
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="guest-phone">{guestLabels?.phone ?? "Phone"}</Label>
          <Input
            id="guest-phone"
            type="tel"
            inputMode="tel"
            value={value.phone}
            onChange={(event) =>
              updateField("phone", formatPhoneInput(event.target.value))
            }
            onBlur={() => handleBlur("phone")}
            autoComplete="tel"
            placeholder={placeholders?.phone ?? "(555) 555-5555"}
            aria-invalid={shouldShowError("phone")}
            aria-describedby={shouldShowError("phone") ? "guest-phone-error" : undefined}
            className={inputClassName("phone")}
          />
          {shouldShowError("phone") && (
            <FieldError message={getFieldError("phone")} id="guest-phone-error" />
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="guest-address">
            {guestLabels?.streetAddress ?? "Street address"}
          </Label>
          <Input
            id="guest-address"
            value={value.address}
            onChange={(event) => updateField("address", event.target.value)}
            onBlur={() => handleBlur("address")}
            autoComplete="street-address"
            placeholder={placeholders?.street ?? "123 Main St, Apt 4B"}
            aria-invalid={shouldShowError("address")}
            aria-describedby={
              shouldShowError("address") ? "guest-address-error" : undefined
            }
            className={inputClassName("address")}
          />
          {shouldShowError("address") && (
            <FieldError message={getFieldError("address")} id="guest-address-error" />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest-city">{guestLabels?.city ?? "City"}</Label>
          <Input
            id="guest-city"
            value={value.city}
            onChange={(event) => updateField("city", event.target.value)}
            onBlur={() => handleBlur("city")}
            autoComplete="address-level2"
            placeholder={placeholders?.city ?? "Arlington"}
            aria-invalid={shouldShowError("city")}
            aria-describedby={shouldShowError("city") ? "guest-city-error" : undefined}
            className={inputClassName("city")}
          />
          {shouldShowError("city") && (
            <FieldError message={getFieldError("city")} id="guest-city-error" />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest-state">{guestLabels?.state ?? "State"}</Label>
          <Select
            value={value.state}
            onValueChange={(stateValue) => {
              updateField("state", stateValue);
              setTouched((current) => ({ ...current, state: true }));
            }}
          >
            <SelectTrigger
              id="guest-state"
              aria-invalid={shouldShowError("state")}
              className={inputClassName("state")}
            >
              <SelectValue placeholder={guestLabels?.selectState ?? "Select state"} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {stateOptions.map((state) => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {shouldShowError("state") && (
            <FieldError message={getFieldError("state")} />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="guest-zip">{guestLabels?.zip ?? "ZIP code"}</Label>
          <Input
            id="guest-zip"
            value={value.zip}
            onChange={(event) =>
              updateField("zip", normalizeZipCode(event.target.value))
            }
            onBlur={() => handleBlur("zip")}
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder={placeholders?.zip ?? "22204"}
            maxLength={10}
            aria-invalid={shouldShowError("zip")}
            aria-describedby={shouldShowError("zip") ? "guest-zip-error" : undefined}
            className={inputClassName("zip")}
          />
          {shouldShowError("zip") && (
            <FieldError message={getFieldError("zip")} id="guest-zip-error" />
          )}
        </div>
      </div>
    </div>
  );
}

export function isGuestCheckoutComplete(details: GuestCheckoutDetails): boolean {
  return isShippingAddressValid(details);
}

export function getGuestCheckoutValidationMessage(
  details: GuestCheckoutDetails,
  dictionary?: Dictionary | null,
): string | undefined {
  const errors = validateShippingAddress(details);
  const firstError = Object.values(errors)[0];
  return translateGuestValidationError(dictionary, firstError);
}

export function guestDetailsToAddress(details: GuestCheckoutDetails) {
  const normalized = normalizeShippingAddress(details);

  return {
    _id: "guest-address",
    name: normalized.name,
    email: normalized.email,
    phone: normalized.phone,
    address: normalized.address,
    city: normalized.city,
    state: normalized.state,
    zip: normalized.zip,
    default: true,
    createdAt: new Date().toISOString(),
  };
}
