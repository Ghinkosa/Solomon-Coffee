"use client";

import { createContext, useContext, type ReactNode } from "react";

export type Dictionary = Record<string, unknown>;

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): Dictionary {
  const dictionary = useContext(DictionaryContext);
  if (!dictionary) {
    throw new Error("useDictionary must be used within DictionaryProvider");
  }
  return dictionary;
}
