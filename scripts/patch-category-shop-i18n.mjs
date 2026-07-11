import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const patches = {
  en: {
    categoryPage: {
      featuredCategory: "Featured Category",
      rangeLabel: "Range:",
      categoryView: "Category View",
      filteredResults: "Filtered Results",
      exploreOtherCategories: "Explore Other Categories",
      viewAll: "View All",
      discoverMoreTitle: "Discover More Amazing Products",
      discoverMoreDescription:
        "Can't find what you're looking for in {category}? Explore our complete collection of products across all categories.",
      metaNotFoundTitle: "Category Not Found",
      metaNotFoundDescription:
        "The category you're looking for could not be found.",
      productsSuffix: "Products",
      products: {
        categoriesSidebar: "Categories",
        productsIn: "Products in {category}",
        thisCategory: "this category",
        productFound: "{count} product found",
        productsFound: "{count} products found",
        zeroProductsFound: "0 products found",
        gridView: "Grid View",
      },
    },
    shopNoProducts: {
      description:
        "We couldn't find any products in the {category} category. This category might be temporarily out of stock.",
      descriptionGeneric:
        "We couldn't find any products. This category might be temporarily out of stock.",
      viewCategories: "View Categories",
      footerHint: "Try exploring our other product categories",
    },
    breadcrumb: {
      orderHistory: "Order History",
      wishlist: "Wishlist",
      blog: "Blog",
      shop: "Shop",
      product: "Product",
      about: "About",
      contact: "Contact",
      help: "Help",
      faq: "FAQ",
      privacy: "Privacy",
      terms: "Terms",
      trackOrder: "Track Order",
      order: "Order",
      profile: "Profile",
      settings: "Settings",
      notifications: "Notifications",
      success: "Success",
      wholesalers: "Wholesale",
      mission: "Mission",
      education: "Education",
      brands: "Brands",
    },
    shop: {
      categoryFilterTitle: "Categories",
      clearCategoryFilter: "Clear category filter",
    },
  },
  es: {
    categoryPage: {
      featuredCategory: "Categoría destacada",
      rangeLabel: "Rango:",
      categoryView: "Vista por categoría",
      filteredResults: "Resultados filtrados",
      exploreOtherCategories: "Explorar otras categorías",
      viewAll: "Ver todo",
      discoverMoreTitle: "Descubre más productos increíbles",
      discoverMoreDescription:
        "¿No encuentras lo que buscas en {category}? Explora nuestra colección completa en todas las categorías.",
      metaNotFoundTitle: "Categoría no encontrada",
      metaNotFoundDescription:
        "No se pudo encontrar la categoría que buscas.",
      productsSuffix: "Productos",
      products: {
        categoriesSidebar: "Categorías",
        productsIn: "Productos en {category}",
        thisCategory: "esta categoría",
        productFound: "{count} producto encontrado",
        productsFound: "{count} productos encontrados",
        zeroProductsFound: "0 productos encontrados",
        gridView: "Vista en cuadrícula",
      },
    },
    shopNoProducts: {
      description:
        "No encontramos productos en la categoría {category}. Esta categoría podría estar temporalmente sin stock.",
      descriptionGeneric:
        "No encontramos productos. Esta categoría podría estar temporalmente sin stock.",
      viewCategories: "Ver categorías",
      footerHint: "Prueba explorando otras categorías de productos",
    },
    breadcrumb: {
      orderHistory: "Historial de pedidos",
      wishlist: "Lista de deseos",
      blog: "Blog",
      shop: "Tienda",
      product: "Producto",
      about: "Acerca de",
      contact: "Contacto",
      help: "Ayuda",
      faq: "Preguntas frecuentes",
      privacy: "Privacidad",
      terms: "Términos",
      trackOrder: "Rastrear pedido",
      order: "Pedido",
      profile: "Perfil",
      settings: "Configuración",
      notifications: "Notificaciones",
      success: "Éxito",
      wholesalers: "Mayoristas",
      mission: "Misión",
      education: "Educación",
      brands: "Marcas",
    },
    shop: {
      categoryFilterTitle: "Categorías",
      clearCategoryFilter: "Limpiar filtro de categoría",
    },
  },
  ar: {
    categoryPage: {
      featuredCategory: "فئة مميزة",
      rangeLabel: "النطاق:",
      categoryView: "عرض الفئة",
      filteredResults: "نتائج مفلترة",
      exploreOtherCategories: "استكشف فئات أخرى",
      viewAll: "عرض الكل",
      discoverMoreTitle: "اكتشف المزيد من المنتجات الرائعة",
      discoverMoreDescription:
        "ألا تجد ما تبحث عنه في {category}؟ استكشف مجموعتنا الكاملة من المنتجات في جميع الفئات.",
      metaNotFoundTitle: "الفئة غير موجودة",
      metaNotFoundDescription: "تعذّر العثور على الفئة التي تبحث عنها.",
      productsSuffix: "منتجات",
      products: {
        categoriesSidebar: "الفئات",
        productsIn: "منتجات في {category}",
        thisCategory: "هذه الفئة",
        productFound: "تم العثور على {count} منتج",
        productsFound: "تم العثور على {count} منتجات",
        zeroProductsFound: "0 منتجات",
        gridView: "عرض شبكي",
      },
    },
    shopNoProducts: {
      description:
        "لم نعثر على أي منتجات في فئة {category}. قد تكون هذه الفئة غير متوفرة مؤقتاً.",
      descriptionGeneric:
        "لم نعثر على أي منتجات. قد تكون هذه الفئة غير متوفرة مؤقتاً.",
      viewCategories: "عرض الفئات",
      footerHint: "جرّب استكشاف فئات المنتجات الأخرى",
    },
    breadcrumb: {
      orderHistory: "سجل الطلبات",
      wishlist: "قائمة الأمنيات",
      blog: "المدونة",
      shop: "المتجر",
      product: "منتج",
      about: "من نحن",
      contact: "اتصل بنا",
      help: "المساعدة",
      faq: "الأسئلة الشائعة",
      privacy: "الخصوصية",
      terms: "الشروط",
      trackOrder: "تتبع الطلب",
      order: "طلب",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      notifications: "الإشعارات",
      success: "نجاح",
      wholesalers: "تجار الجملة",
      mission: "مهمتنا",
      education: "التعليم",
      brands: "العلامات",
    },
    shop: {
      categoryFilterTitle: "الفئات",
      clearCategoryFilter: "مسح فلتر الفئة",
    },
  },
};

for (const [locale, patch] of Object.entries(patches)) {
  const path = join(root, "dictionaries", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));

  Object.assign(data.categoryPage, patch.categoryPage);
  Object.assign(data.shopNoProducts, patch.shopNoProducts);
  Object.assign(data.breadcrumb, patch.breadcrumb);
  Object.assign(data.shop, patch.shop);

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

console.log("Patched category, breadcrumb, and shop filter i18n keys");
