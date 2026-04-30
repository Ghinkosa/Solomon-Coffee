import Link from "next/link";
import Logo from "./common/Logo";
import { categoriesData, quickLinksData } from "@/constants";
import { contactConfig } from "@/config/contact";
import FooterTop from "./layout/FooterTop";
import SocialMedia from "./common/SocialMedia";
import NewsletterForm from "./NewsletterForm";

interface FooterProps {
  lang: string;
  dictionary: any;
}

const Footer = ({ lang, dictionary }: FooterProps) => {
  return (
    <footer className="bg-shop_dark_green border-t border-shop_light_green/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top section with contact info */}
        <FooterTop />

        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="mb-2">
              <Logo
                variant="sm"
                lang={lang}
                logoText={dictionary.logo}
                theme="dark"
              />
            </div>
            <p className="text-shop_light_pink/85 text-sm">
              {contactConfig.company.description}
            </p>
            <SocialMedia
              className="text-shop_light_pink/80"
              iconClassName="border-shop_orange/50 text-shop_light_pink hover:bg-shop_btn_dark_green"
              tooltipClassName="bg-shop_light_pink text-shop_dark_green"
            />
          </div>

          <div>
            <h3 className="font-semibold text-shop_orange mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={`/${lang}${item?.href}`}
                    className="text-shop_light_pink/85 hover:text-shop_orange text-sm font-medium hoverEffect"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {categoriesData.length > 0 ? (
            <div>
              <h3 className="font-semibold text-shop_orange mb-4">Categories</h3>
              <ul className="space-y-3">
                {categoriesData.map((item) => (
                  <li key={item?.title}>
                    <Link
                      href={`/${lang}/category/${item?.href}`}
                      className="text-shop_light_pink/85 hover:text-shop_orange text-sm font-medium hoverEffect capitalize"
                    >
                      {item?.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <h3 className="font-semibold text-shop_orange mb-4">Newsletter</h3>
            <p className="text-shop_light_pink/85 text-sm mb-4">
              Subscribe to our newsletter to receive updates and exclusive
              offers.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom copyright section */}
        <div className="py-6 border-t border-shop_light_green/25 text-center text-sm text-shop_light_pink/80">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-shop_orange font-black tracking-wider uppercase hover:text-shop_light_pink hoverEffect group font-sans">
              Sheba Cup Coffee
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
