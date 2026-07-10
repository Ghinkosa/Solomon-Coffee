import Link from "next/link";
import Logo from "./common/Logo";
import { categoriesData } from "@/constants";
import { contactConfig } from "@/config/contact";
import FooterTop from "./layout/FooterTop";
import SocialMedia from "./common/SocialMedia";
import NewsletterForm from "./NewsletterForm";
import { t } from "@/lib/dictionary-utils";

interface FooterProps {
  lang: string;
  dictionary: any;
}

const Footer = ({ lang, dictionary }: FooterProps) => {
  const hasCategories = categoriesData.length > 0;
  const quickLinks = dictionary?.footer?.quickLinksItems;

  const quickLinkItems = [
    { title: quickLinks?.about ?? "About us", href: "/about" },
    { title: quickLinks?.wholesale ?? "Wholesale", href: "/shop#wholesale" },
    { title: quickLinks?.contact ?? "Contact us", href: "/contact" },
    { title: quickLinks?.terms ?? "Terms & Conditions", href: "/terms" },
    { title: quickLinks?.privacy ?? "Privacy Policy", href: "/privacy" },
    { title: quickLinks?.faqs ?? "FAQs", href: "/faqs" },
    { title: quickLinks?.help ?? "Help", href: "/help" },
  ];

  return (
    <footer className="border-t border-shop_orange/25 bg-shop_dark_green text-shop_light_pink/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FooterTop dictionary={dictionary} />

        <div
          className={`grid grid-cols-1 gap-10 py-12 md:grid-cols-2 ${
            hasCategories ? "lg:grid-cols-4" : "lg:grid-cols-3"
          } lg:gap-12 lg:py-14`}
        >
          <div className="space-y-5">
            <Logo
              variant="sm"
              lang={lang}
              logoText={dictionary.logo}
              theme="dark"
            />
            <p className="max-w-xs text-sm leading-relaxed text-shop_light_pink/75">
              {t(
                dictionary,
                "footer.tagline",
                contactConfig.company.description,
              )}
            </p>
            <SocialMedia variant="footer" />
          </div>

          <div>
            <h3 className="mb-5 font-serif text-sm font-semibold uppercase tracking-[0.16em] text-shop_orange">
              {t(dictionary, "footer.quickLinks", "Quick Links")}
            </h3>
            <ul className="space-y-3">
              {quickLinkItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${lang}${item.href}`}
                    className="text-sm font-medium text-shop_light_pink/80 transition-colors hover:text-shop_orange hoverEffect"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {hasCategories ? (
            <div>
              <h3 className="mb-5 font-serif text-sm font-semibold uppercase tracking-[0.16em] text-shop_orange">
                {t(dictionary, "footer.categories", "Categories")}
              </h3>
              <ul className="space-y-3">
                {categoriesData.map((item) => (
                  <li key={item?.title}>
                    <Link
                      href={`/${lang}/category/${item?.href}`}
                      className="text-sm font-medium capitalize text-shop_light_pink/80 transition-colors hover:text-shop_orange hoverEffect"
                    >
                      {item?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="mb-5 font-serif text-sm font-semibold uppercase tracking-[0.16em] text-shop_orange">
              {t(dictionary, "footer.newsletter.title", "Newsletter")}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-shop_light_pink/75">
              {t(
                dictionary,
                "footer.newsletter.description",
                "Subscribe for roast updates, brewing tips, and exclusive offers.",
              )}
            </p>
            <NewsletterForm variant="footer" />
          </div>
        </div>

        <div className="border-t border-shop_orange/20 py-6 text-center text-sm text-shop_light_pink/60 lg:py-8">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold tracking-wide text-shop_orange">
              {dictionary.logo?.first} {dictionary.logo?.second}
            </span>
            . {t(dictionary, "footer.copyright", "All rights reserved.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
