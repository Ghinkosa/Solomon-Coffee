import Container from "@/components/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { localizedPath } from "@/lib/localized-path";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

const BrandsPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const t = dictionary?.brandsPage ?? {};
  const common = dictionary?.common ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-shop_light_bg via-white to-shop_light_pink">
      <Container className="py-10">
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={localizedPath("/", lang)}>
                    {t.breadcrumbHome ?? common.home ?? "Home"}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {t.breadcrumbRoasters ?? "Roasters"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold text-shop_dark_green mb-4">
            {t.title ?? "Shop by Roasters"}
          </h1>
          <p className="text-lg text-dark-text">
            {t.description ?? t.comingSoon ?? "Coming soon - Explore coffee from your favorite roasters"}
          </p>
        </div>
      </Container>
    </div>
  );
};

export default BrandsPage;
