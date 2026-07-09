"use client";

import { useState } from "react";
import { ArrowRight, ChevronUp } from "lucide-react";

export const STORY_HEADLINE = {
  line1: "From the Farms of Ethiopia",
  line2: "to Our First Roastery in the United States",
};

const STORY_PARAGRAPHS = [
  "Coffee has always been at the heart of our family story.",
  "Our coffee story began in Ethiopia, where coffee is part of family, culture, and daily life. For more than 30 years, our family has worked with coffee from the farm level, growing, selecting, and protecting the quality of Ethiopian Arabica coffee.",
  "Our roots began in Sidamo, continued in Guji, and connect deeply to Yirgacheffe, one of Ethiopia's most respected coffee regions. These places shaped our family, our work, and our respect for coffee.",
  "Sheba Cup Coffee works directly with Birbirsa Coffee Farm. This partnership helps us protect quality, support sustainable farming, and keep our coffee traceable from farm to cup.",
  "For many years, our family focused on farming, selecting, and preparing green coffee. Roasting is our next step. From the New York Metro area, Sheba Cup Coffee begins a new chapter by roasting our family's Ethiopian coffee for the first time.",
  "Sheba Cup Coffee was created to share authentic Ethiopian specialty coffee while honoring the people, land, and history behind every bean.",
  "Every bag carries our family story, our Ethiopian roots, and our purpose to give back.",
];

const PREVIEW_COUNT = 3;

export function OurStoryHeader() {
  return (
    <div className="space-y-5">
      <div className="inline-block rounded-full bg-shop_dark_green px-4 py-1 text-xs font-medium uppercase tracking-widest text-white">
        Our Story
      </div>

      <h2 className="font-serif text-3xl leading-tight text-shop_dark_green md:text-4xl lg:text-5xl">
        {STORY_HEADLINE.line1}
        <br />
        <span className="italic text-shop_orange">{STORY_HEADLINE.line2}</span>
      </h2>
    </div>
  );
}

export function OurStoryBody() {
  const [expanded, setExpanded] = useState(false);

  const previewParagraphs = STORY_PARAGRAPHS.slice(0, PREVIEW_COUNT);
  const moreParagraphs = STORY_PARAGRAPHS.slice(PREVIEW_COUNT);

  return (
    <div className="space-y-5">
      <div className="space-y-5">
        {previewParagraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-lg leading-relaxed text-stone-800/70"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {expanded && (
        <div className="space-y-5">
          {moreParagraphs.slice(0, -1).map((paragraph) => (
            <p
              key={paragraph}
              className="text-lg leading-relaxed text-stone-800/70"
            >
              {paragraph}
            </p>
          ))}
          <p className="text-lg font-medium leading-relaxed text-shop_dark_green">
            {moreParagraphs[moreParagraphs.length - 1]}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="inline-flex items-center gap-2 border-b border-shop_orange pb-1 font-medium text-shop_orange transition-all hover:border-shop_dark_green hover:text-shop_dark_green"
        aria-expanded={expanded}
      >
        <span>{expanded ? "Read less" : "Read more"}</span>
        {expanded ? <ChevronUp size={16} /> : <ArrowRight size={16} />}
      </button>
    </div>
  );
}

const OurStoryText = () => {
  return (
    <div className="space-y-5">
      <OurStoryHeader />
      <OurStoryBody />
    </div>
  );
};

export default OurStoryText;
