import { getAdminCategories } from "@/sanity/queries";
import AdminProducts from "@/components/admin/AdminProducts";

/** Auth is enforced by admin console layout + proxy (all Clerk emails checked). */
const AdminProductsPage = async () => {
  const categories = await getAdminCategories();
  return <AdminProducts initialCategories={categories} />;
};

export default AdminProductsPage;
