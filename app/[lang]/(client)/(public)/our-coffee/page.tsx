import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import OurCoffee from "./OurCoffee";

export const metadata: Metadata = {
  title: "Our Coffee | Sheba Cup Coffee",
  description:
    "Discover our coffee processing methods - Natural, Washed, and Honey processes that create exceptional flavors.",
};

async function getCoffeeContent() {
  const query = `
    *[_type == "coffeePage"][0] {
      _id,
      title,
      description,
      heroImage,
      naturalProcess {
        enabled,
        title,
        description,
        images[] {
          ...,
          asset->
        }
      },
      washedProcess {
        enabled,
        title,
        description,
        images[] {
          ...,
          asset->
        }
      },
      honeyProcess {
        enabled,
        title,
        description,
        varieties,
        images[] {
          ...,
          asset->
        }
      },
      anaerobicProcess {
        enabled,
        title,
        description,
        images[] {
          ...,
          asset->
        }
      },
      seo {
        title,
        description,
        keywords
      }
    }
  `;
  
  const content = await client.fetch(query);
  return content;
}

export default async function CoffeePage() {
  const coffeeContent = await getCoffeeContent();

  return <OurCoffee coffeeContent={coffeeContent} />;
}