import { currentUser } from "@clerk/nextjs/server";
import Container from "@/components/Container";
import NoAccessToCart from "@/components/NoAccessToCart";
import WishlistProducts from "@/components/WishlistProducts";
import { Heart } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";

const WishListPage = async ({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang);
  const user = await currentUser();

  return (
    <Container className="py-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Page Header */}
      <div className="flex items-center gap-2 mb-8">
        <Heart className="w-6 h-6 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {dictionary.wishlist.title}
          </h1>
          <p className="text-gray-600 mt-1">{dictionary.wishlist.subtitle}</p>
        </div>
      </div>

      {/* Content */}
      {user ? (
        <WishlistProducts />
      ) : (
        <NoAccessToCart
          details={dictionary.wishlist.loginDetails}
          lang={lang}
          logoText={dictionary.logo}
        />
      )}
    </Container>
  );
};

export default WishListPage;
