import { currentUser } from "@clerk/nextjs/server";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/i18n-config";
import Container from "@/components/Container";
import { ClientCartContent } from "@/components/cart/ClientCartContent";
import { ShoppingBag } from "lucide-react";
import DynamicBreadcrumb from "@/components/DynamicBreadcrumb";

const CartPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params;
  const dictionary = await getDictionary(lang as Locale);
  const user = await currentUser();
  return (
    <Container className="py-6">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Cart Header */}
      <div className="flex items-center gap-2 mb-6">
        <ShoppingBag className="w-6 h-6" />
        <h1 className="text-2xl font-bold">{dictionary.cart.title}</h1>
      </div>

      {/* Client Cart Content with Loading */}
      <ClientCartContent />
    </Container>
  );
};

export default CartPage;
