import Container from "@/components/Container";
import WishlistProducts from "@/components/WishlistProducts";
import { Heart } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import WishlistSignInHint from "@/components/WishlistSignInHint";

const WishListPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const bc = (dictionary?.breadcrumb ?? {}) as Record<string, string>;

  return (
    <Container className="py-6">
      <DynamicBreadcrumb
        customItems={[
          { label: bc.home ?? dictionary.common.home, href: "/" },
          { label: dictionary.wishlist.title },
        ]}
      />

      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {dictionary.wishlist.title}
            </h1>
            <p className="mt-1 text-gray-600">{dictionary.wishlist.subtitle}</p>
          </div>
        </div>
        <WishlistSignInHint />
      </div>

      <WishlistProducts />
    </Container>
  );
};

export default WishListPage;
