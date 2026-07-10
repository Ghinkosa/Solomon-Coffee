"use client";

import { useState } from "react";
import { ArrowRight, ChevronUp } from "lucide-react";
import {
  homeBodyClass,
  homeEyebrowClass,
} from "./HomeSectionHeader";

export type OurStoryDictionary = {
  eyebrow: string;
  headline: { line1: string; line2: string };
  paragraphs: string[];
  readMore: string;
  readLess: string;
  badge: { title: string; subtitle: string };
  imageAlt: string;
};

const PREVIEW_COUNT = 3;

export function OurStoryHeader({ story }: { story: OurStoryDictionary }) {
  return (
    <div className="space-y-5">
      <div className={`rounded-full bg-shop_dark_green px-4 py-1 text-white ${homeEyebrowClass}`}>
        {story.eyebrow}
      </div>

      <h2 className="font-serif text-3xl font-bold leading-tight text-shop_dark_green md:text-4xl">
        {story.headline.line1}
        <br />
        <span className="italic text-shop_orange">{story.headline.line2}</span>
      </h2>
    </div>
  );
}

export function OurStoryBody({ story }: { story: OurStoryDictionary }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = story.paragraphs ?? [];
  const previewParagraphs = paragraphs.slice(0, PREVIEW_COUNT);
  const moreParagraphs = paragraphs.slice(PREVIEW_COUNT);

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        {previewParagraphs.map((paragraph) => (
          <p key={paragraph} className={homeBodyClass}>
            {paragraph}
          </p>
        ))}
      </div>

      {expanded && moreParagraphs.length > 0 && (
        <div className="space-y-5">
          {moreParagraphs.slice(0, -1).map((paragraph) => (
            <p key={paragraph} className={homeBodyClass}>
              {paragraph}
            </p>
          ))}
          <p className="text-base font-medium leading-relaxed text-shop_dark_green md:text-lg">
            {moreParagraphs[moreParagraphs.length - 1]}
          </p>
        </div>
      )}

      {moreParagraphs.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-2 border-b border-shop_orange pb-1 text-base font-medium text-shop_orange transition-all hover:border-shop_dark_green hover:text-shop_dark_green"
          aria-expanded={expanded}
        >
          <span>{expanded ? story.readLess : story.readMore}</span>
          {expanded ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
        </button>
      )}
    </div>
  );
}
