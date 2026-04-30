import "server-only";
import { type Locale } from "@/i18n-config";

// We enumerate all dictionaries here for better type safety and static analysis
const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  es: () => import("@/dictionaries/es.json").then((module) => module.default),
  ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
};

function deepMerge(base: any, update: any) {
  if (!update) return base;
  if (!base) return update;

  const output = { ...base };
  Object.keys(update).forEach((key) => {
    if (isObject(update[key]) && isObject(base[key])) {
      output[key] = deepMerge(base[key], update[key]);
    } else {
      output[key] = update[key];
    }
  });
  return output;
}

function isObject(item: any) {
  return item && typeof item === "object" && !Array.isArray(item);
}

export const getDictionary = async (locale: Locale) => {
  const [en, target] = await Promise.all([
    dictionaries.en(),
    locale !== "en" ? dictionaries[locale]?.() : null,
  ]).catch(() => [null, null]);

  if (!en) return {}; // Safety fallback

  // Perform deep merge to ensure nested fallbacks (like userDropdown.myProfile)
  return deepMerge(en, target);
};
