import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const en = {
  productCard: {
    imageAlt: "Product image",
    sale: "Sale!",
    review: "Review",
    reviews: "Reviews",
    noReviews: "No Reviews",
    from: "From",
    customizeOptions: "Customize options",
  },
  searchModal: {
    placeholder: "Search",
    openAria: "Open search",
    title: "Search Products",
    closeAria: "Close search (Escape)",
    closeTitle: "Close (Escape)",
    loadingTitle: "Searching products...",
    loadingHint: "Please wait a moment",
    badges: { hot: "Hot", new: "New" },
    emptyTitle: "Discover Amazing Products",
    emptyDescription: "Search and explore thousands of products",
    popularTitle: "Popular Products",
    quickSearch: "Quick search:",
    noResultsTitle: "No Results Found",
    noResultsDescription: "Sorry, we couldn't find any products matching",
    clearSearch: "Clear Search",
    productAlt: "Product",
  },
  socialShare: {
    defaultTitle: "Check this out!",
    linkCopied: "Link copied to clipboard",
    label: "Share this article:",
    shareOn: "Share on {platform}",
    shareOrCopy: "Share or Copy Link",
  },
  initialVisit: {
    title: "Welcome to Sheba Cup Coffee!",
    description:
      "Discover freshly roasted Ethiopian coffee, brewing essentials, and curated lots delivered to your door.",
    features: [
      "Fresh Roasts",
      "Ethiopian Origins",
      "Brewing Gear",
      "Wholesale Options",
    ],
    cta: "Shop Sheba Cup Coffee",
    dismiss: "No thanks, maybe later",
    sidePopup: {
      title: "Visit Sheba Cup Coffee",
      description: "Explore our curated coffee collection",
    },
  },
  productCatalog: {
    searchPlaceholder: "Search products...",
    sortBy: "Sort by",
    sortNameAsc: "Name A-Z",
    sortNameDesc: "Name Z-A",
    sortPriceLow: "Price Low to High",
    sortPriceHigh: "Price High to Low",
    sortNewest: "Newest First",
    filters: "Filters",
    activeFilters: "Active filters:",
    searchLabel: "Search:",
    clearAll: "Clear all",
    categories: "Categories",
    priceRange: "Price Range",
    resultsSummary: "Showing {shown} of {total} products",
  },
  productCatalogPage: {
    title: "Product Catalog",
    breadcrumbProducts: "Products",
    heroDescription:
      "Discover our complete collection of premium coffee and brewing essentials. From freshly roasted beans to everyday coffee tools, find everything you need in one place.",
    statsProducts: "{count}+ Products",
    statsQuality: "Premium Quality Items",
    statsCategories: "{count} Categories",
    statsNavigate: "Easy to Navigate",
    statsFilters: "Advanced Filters",
    statsFind: "Find What You Need",
    loading: "Loading products...",
    ctaTitle: "Can't find what you're looking for?",
    ctaDescription:
      "Our customer support team is here to help you find the perfect product. Get in touch with us for personalized recommendations.",
    contactSupport: "Contact Support",
  },
  authPages: {
    backToHome: "Back to Home",
    supportPrompt: "Need help? Contact our support team at",
    questionsPrompt: "Questions? Contact us at",
    signIn: {
      title: "Welcome Back!",
      description:
        "Sign in to access your account, track orders, and enjoy personalized coffee recommendations at {company}.",
      features: {
        secure: {
          title: "Secure Authentication",
          description: "Your data is protected with enterprise-grade security",
        },
        trusted: {
          title: "Trusted by Thousands",
          description: "Join our community of satisfied customers",
        },
        premium: {
          title: "Premium Experience",
          description: "Access exclusive coffee offers and personalized brew picks",
        },
      },
    },
    signUp: {
      title: "Join {company}",
      description:
        "Create your account today and unlock exclusive benefits, personalized recommendations, and seamless shopping experiences.",
      benefits: {
        welcome: {
          title: "Welcome Bonus",
          description: "Get 10% off your first order when you sign up",
        },
        deals: {
          title: "Exclusive Deals",
          description: "Access member-only discounts and early sales",
        },
        shipping: {
          title: "Free Shipping",
          description: "Enjoy free shipping on orders over $50",
        },
        payments: {
          title: "Secure Payments",
          description: "Multiple payment options with bank-level security",
        },
      },
      trustCustomers: "Trusted by 50,000+ customers",
      trustRating: "4.8/5 average rating",
      hasAccount: "Already have an account?",
      signInLink: "Sign in here",
    },
  },
  blogSingle: {
    meta: {
      notFoundTitle: "Blog Not Found",
      notFoundDescription: "The blog post you're looking for could not be found.",
    },
    article: "Article",
    minRead: "{count} min read",
    views: "{count} views",
    actions: { like: "Like", comment: "Comment", share: "Share" },
    imageAlt: "Blog Image",
    thumbnailAlt: "Blog thumbnail",
    backToBlog: "Back to Blog",
    sidebar: {
      categories: "Blog Categories",
      latestPosts: "Latest Posts",
    },
    newsletter: {
      title: "Stay Updated",
      description: "Get the latest articles delivered to your inbox.",
      subscribe: "Subscribe Now",
    },
  },
  cartToasts: {
    quantityDecreased: "Quantity decreased successfully!",
    quantityIncreased: "Quantity increased successfully!",
    itemRemoved: "Item removed from cart",
    itemRemovedNamed: "{name} removed successfully!",
    movedToCart: "Moved to cart successfully!",
    removeFailed: "Failed to remove item",
    stockLimit: "Cannot add more than available stock",
  },
  checkoutAddress: {
    addFirstTitle: "Add Your First Address",
    addNewTitle: "Add New Address",
    addDescription: "Add a shipping address to {email}",
    defaultFirst: "This will be your default address",
    setDefault: "Set as default address",
    adding: "Adding...",
    requiredFields: "Please fill in all required fields",
    saved: "Address saved successfully!",
    addFailed: "Failed to add address",
    phoneLabel: "Phone Number",
    cityLabel: "City *",
    stateLabel: "State *",
    zipLabel: "ZIP Code *",
  },
  checkoutPlacement: {
    addressRequired: "Address Required",
    selectAddress: "Please select a shipping address",
    cartEmpty: "Cart is empty",
    insufficientStock: "Insufficient Stock",
    orderFailed: "Order Failed",
  },
  shopMeta: {
    title: "Shop",
    description:
      "Browse fresh coffee, brewing tools, and curated essentials for home and office brewing.",
  },
  blogMeta: {
    title: "Blog",
    description: "Read our latest insights on coffee, brewing, and our roastery.",
  },
};

const es = {
  productCard: {
    imageAlt: "Imagen del producto",
    sale: "¡Oferta!",
    review: "Reseña",
    reviews: "Reseñas",
    noReviews: "Sin reseñas",
    from: "Desde",
    customizeOptions: "Personalizar opciones",
  },
  searchModal: {
    placeholder: "Buscar",
    openAria: "Abrir búsqueda",
    title: "Buscar productos",
    closeAria: "Cerrar búsqueda (Escape)",
    closeTitle: "Cerrar (Escape)",
    loadingTitle: "Buscando productos...",
    loadingHint: "Espera un momento",
    badges: { hot: "Popular", new: "Nuevo" },
    emptyTitle: "Descubre productos increíbles",
    emptyDescription: "Busca y explora miles de productos",
    popularTitle: "Productos populares",
    quickSearch: "Búsqueda rápida:",
    noResultsTitle: "No se encontraron resultados",
    noResultsDescription: "Lo sentimos, no encontramos productos que coincidan con",
    clearSearch: "Limpiar búsqueda",
    productAlt: "Producto",
  },
  socialShare: {
    defaultTitle: "¡Mira esto!",
    linkCopied: "Enlace copiado al portapapeles",
    label: "Compartir este artículo:",
    shareOn: "Compartir en {platform}",
    shareOrCopy: "Compartir o copiar enlace",
  },
  initialVisit: {
    title: "¡Bienvenido a Sheba Cup Coffee!",
    description:
      "Descubre café etíope recién tostado, esenciales de preparación y lotes seleccionados entregados a tu puerta.",
    features: [
      "Tostados frescos",
      "Orígenes etíopes",
      "Equipo de preparación",
      "Opciones mayoristas",
    ],
    cta: "Comprar en Sheba Cup Coffee",
    dismiss: "No gracias, quizás después",
    sidePopup: {
      title: "Visita Sheba Cup Coffee",
      description: "Explora nuestra colección de café seleccionada",
    },
  },
  productCatalog: {
    searchPlaceholder: "Buscar productos...",
    sortBy: "Ordenar por",
    sortNameAsc: "Nombre A-Z",
    sortNameDesc: "Nombre Z-A",
    sortPriceLow: "Precio: menor a mayor",
    sortPriceHigh: "Precio: mayor a menor",
    sortNewest: "Más recientes",
    filters: "Filtros",
    activeFilters: "Filtros activos:",
    searchLabel: "Búsqueda:",
    clearAll: "Limpiar todo",
    categories: "Categorías",
    priceRange: "Rango de precio",
    resultsSummary: "Mostrando {shown} de {total} productos",
  },
  productCatalogPage: {
    title: "Catálogo de productos",
    breadcrumbProducts: "Productos",
    heroDescription:
      "Descubre nuestra colección completa de café premium y esenciales de preparación. Desde granos recién tostados hasta herramientas diarias, encuentra todo en un solo lugar.",
    statsProducts: "{count}+ productos",
    statsQuality: "Artículos de calidad premium",
    statsCategories: "{count} categorías",
    statsNavigate: "Fácil de navegar",
    statsFilters: "Filtros avanzados",
    statsFind: "Encuentra lo que necesitas",
    loading: "Cargando productos...",
    ctaTitle: "¿No encuentras lo que buscas?",
    ctaDescription:
      "Nuestro equipo de soporte está aquí para ayudarte a encontrar el producto perfecto. Contáctanos para recomendaciones personalizadas.",
    contactSupport: "Contactar soporte",
  },
  authPages: {
    backToHome: "Volver al inicio",
    supportPrompt: "¿Necesitas ayuda? Contacta a nuestro equipo de soporte en",
    questionsPrompt: "¿Preguntas? Contáctanos en",
    signIn: {
      title: "¡Bienvenido de nuevo!",
      description:
        "Inicia sesión para acceder a tu cuenta, rastrear pedidos y disfrutar recomendaciones personalizadas de café en {company}.",
      features: {
        secure: {
          title: "Autenticación segura",
          description: "Tus datos están protegidos con seguridad de nivel empresarial",
        },
        trusted: {
          title: "Confianza de miles",
          description: "Únete a nuestra comunidad de clientes satisfechos",
        },
        premium: {
          title: "Experiencia premium",
          description: "Accede a ofertas exclusivas de café y selecciones personalizadas",
        },
      },
    },
    signUp: {
      title: "Únete a {company}",
      description:
        "Crea tu cuenta hoy y desbloquea beneficios exclusivos, recomendaciones personalizadas y compras sin fricciones.",
      benefits: {
        welcome: {
          title: "Bono de bienvenida",
          description: "Obtén 10% de descuento en tu primer pedido al registrarte",
        },
        deals: {
          title: "Ofertas exclusivas",
          description: "Accede a descuentos solo para miembros y ventas anticipadas",
        },
        shipping: {
          title: "Envío gratis",
          description: "Disfruta envío gratis en pedidos superiores a $50",
        },
        payments: {
          title: "Pagos seguros",
          description: "Múltiples opciones de pago con seguridad bancaria",
        },
      },
      trustCustomers: "Confianza de más de 50,000 clientes",
      trustRating: "Calificación promedio 4.8/5",
      hasAccount: "¿Ya tienes una cuenta?",
      signInLink: "Inicia sesión aquí",
    },
  },
  blogSingle: {
    meta: {
      notFoundTitle: "Blog no encontrado",
      notFoundDescription: "No se pudo encontrar la publicación que buscas.",
    },
    article: "Artículo",
    minRead: "{count} min de lectura",
    views: "{count} vistas",
    actions: { like: "Me gusta", comment: "Comentar", share: "Compartir" },
    imageAlt: "Imagen del blog",
    thumbnailAlt: "Miniatura del blog",
    backToBlog: "Volver al blog",
    sidebar: {
      categories: "Categorías del blog",
      latestPosts: "Publicaciones recientes",
    },
    newsletter: {
      title: "Mantente informado",
      description: "Recibe los últimos artículos en tu bandeja de entrada.",
      subscribe: "Suscribirse ahora",
    },
  },
  cartToasts: {
    quantityDecreased: "¡Cantidad disminuida con éxito!",
    quantityIncreased: "¡Cantidad aumentada con éxito!",
    itemRemoved: "Artículo eliminado del carrito",
    itemRemovedNamed: "¡{name} eliminado con éxito!",
    movedToCart: "¡Movido al carrito con éxito!",
    removeFailed: "Error al eliminar el artículo",
    stockLimit: "No se puede agregar más del stock disponible",
  },
  checkoutAddress: {
    addFirstTitle: "Agrega tu primera dirección",
    addNewTitle: "Agregar nueva dirección",
    addDescription: "Agrega una dirección de envío para {email}",
    defaultFirst: "Esta será tu dirección predeterminada",
    setDefault: "Establecer como dirección predeterminada",
    adding: "Agregando...",
    requiredFields: "Completa todos los campos obligatorios",
    saved: "¡Dirección guardada con éxito!",
    addFailed: "Error al agregar la dirección",
    phoneLabel: "Número de teléfono",
    cityLabel: "Ciudad *",
    stateLabel: "Estado *",
    zipLabel: "Código postal *",
  },
  checkoutPlacement: {
    addressRequired: "Dirección requerida",
    selectAddress: "Selecciona una dirección de envío",
    cartEmpty: "El carrito está vacío",
    insufficientStock: "Stock insuficiente",
    orderFailed: "Error en el pedido",
  },
  shopMeta: {
    title: "Tienda",
    description:
      "Explora café fresco, herramientas de preparación y esenciales seleccionados para preparar en casa u oficina.",
  },
  blogMeta: {
    title: "Blog",
    description: "Lee nuestras últimas ideas sobre café, preparación y nuestra tostaduría.",
  },
};

const ar = {
  productCard: {
    imageAlt: "صورة المنتج",
    sale: "تخفيض!",
    review: "مراجعة",
    reviews: "مراجعات",
    noReviews: "لا توجد مراجعات",
    from: "من",
    customizeOptions: "تخصيص الخيارات",
  },
  searchModal: {
    placeholder: "بحث",
    openAria: "فتح البحث",
    title: "البحث عن منتجات",
    closeAria: "إغلاق البحث (Escape)",
    closeTitle: "إغلاق (Escape)",
    loadingTitle: "جاري البحث عن المنتجات...",
    loadingHint: "يرجى الانتظار لحظة",
    badges: { hot: "رائج", new: "جديد" },
    emptyTitle: "اكتشف منتجات رائعة",
    emptyDescription: "ابحث واستكشف آلاف المنتجات",
    popularTitle: "منتجات شائعة",
    quickSearch: "بحث سريع:",
    noResultsTitle: "لم يتم العثور على نتائج",
    noResultsDescription: "عذراً، لم نعثر على منتجات تطابق",
    clearSearch: "مسح البحث",
    productAlt: "منتج",
  },
  socialShare: {
    defaultTitle: "اطّلع على هذا!",
    linkCopied: "تم نسخ الرابط",
    label: "شارك هذا المقال:",
    shareOn: "شارك على {platform}",
    shareOrCopy: "شارك أو انسخ الرابط",
  },
  initialVisit: {
    title: "مرحباً بك في Sheba Cup Coffee!",
    description:
      "اكتشف قهوة إثيوبية محمصة طازجة، مستلزمات التحضير، ودفعات مختارة تُسلّم إلى بابك.",
    features: [
      "تحميص طازج",
      "أصول إثيوبية",
      "معدات التحضير",
      "خيارات الجملة",
    ],
    cta: "تسوق Sheba Cup Coffee",
    dismiss: "لا شكراً، ربما لاحقاً",
    sidePopup: {
      title: "زر Sheba Cup Coffee",
      description: "استكشف مجموعتنا المختارة من القهوة",
    },
  },
  productCatalog: {
    searchPlaceholder: "البحث عن منتجات...",
    sortBy: "ترتيب حسب",
    sortNameAsc: "الاسم أ-ي",
    sortNameDesc: "الاسم ي-أ",
    sortPriceLow: "السعر: من الأقل للأعلى",
    sortPriceHigh: "السعر: من الأعلى للأقل",
    sortNewest: "الأحدث أولاً",
    filters: "الفلاتر",
    activeFilters: "الفلاتر النشطة:",
    searchLabel: "بحث:",
    clearAll: "مسح الكل",
    categories: "الفئات",
    priceRange: "نطاق السعر",
    resultsSummary: "عرض {shown} من {total} منتجات",
  },
  productCatalogPage: {
    title: "قائمة المنتجات",
    breadcrumbProducts: "المنتجات",
    heroDescription:
      "اكتشف مجموعتنا الكاملة من القهوة الفاخرة ومستلزمات التحضير. من حبوب محمصة طازجة إلى أدوات يومية، اعثر على كل ما تحتاجه في مكان واحد.",
    statsProducts: "{count}+ منتجات",
    statsQuality: "منتجات عالية الجودة",
    statsCategories: "{count} فئات",
    statsNavigate: "سهل التصفح",
    statsFilters: "فلاتر متقدمة",
    statsFind: "اعثر على ما تحتاجه",
    loading: "جاري تحميل المنتجات...",
    ctaTitle: "ألا تجد ما تبحث عنه؟",
    ctaDescription:
      "فريق الدعم لدينا هنا لمساعدتك في العثور على المنتج المثالي. تواصل معنا للحصول على توصيات شخصية.",
    contactSupport: "اتصل بالدعم",
  },
  authPages: {
    backToHome: "العودة للرئيسية",
    supportPrompt: "تحتاج مساعدة؟ تواصل مع فريق الدعم على",
    questionsPrompt: "أسئلة؟ تواصل معنا على",
    signIn: {
      title: "مرحباً بعودتك!",
      description:
        "سجّل الدخول للوصول إلى حسابك، تتبع الطلبات، والاستمتاع بتوصيات قهوة مخصصة في {company}.",
      features: {
        secure: {
          title: "مصادقة آمنة",
          description: "بياناتك محمية بأمان على مستوى المؤسسات",
        },
        trusted: {
          title: "موثوق من آلاف العملاء",
          description: "انضم إلى مجتمع عملائنا الراضين",
        },
        premium: {
          title: "تجربة مميزة",
          description: "الوصول إلى عروض قهوة حصرية واختيارات تحضير شخصية",
        },
      },
    },
    signUp: {
      title: "انضم إلى {company}",
      description:
        "أنشئ حسابك اليوم وافتح المزايا الحصرية، التوصيات الشخصية، وتجربة تسوق سلسة.",
      benefits: {
        welcome: {
          title: "مكافأة ترحيب",
          description: "احصل على خصم 10% على أول طلب عند التسجيل",
        },
        deals: {
          title: "عروض حصرية",
          description: "الوصول إلى خصومات الأعضاء والمبيعات المبكرة",
        },
        shipping: {
          title: "شحن مجاني",
          description: "استمتع بشحن مجاني للطلبات فوق 50$",
        },
        payments: {
          title: "مدفوعات آمنة",
          description: "خيارات دفع متعددة بأمان مصرفي",
        },
      },
      trustCustomers: "موثوق من أكثر من 50,000 عميل",
      trustRating: "تقييم متوسط 4.8/5",
      hasAccount: "لديك حساب بالفعل؟",
      signInLink: "سجّل الدخول هنا",
    },
  },
  blogSingle: {
    meta: {
      notFoundTitle: "المدونة غير موجودة",
      notFoundDescription: "تعذّر العثور على المقال الذي تبحث عنه.",
    },
    article: "مقال",
    minRead: "{count} دقائق قراءة",
    views: "{count} مشاهدة",
    actions: { like: "إعجاب", comment: "تعليق", share: "مشاركة" },
    imageAlt: "صورة المدونة",
    thumbnailAlt: "صورة مصغرة للمدونة",
    backToBlog: "العودة للمدونة",
    sidebar: {
      categories: "فئات المدونة",
      latestPosts: "أحدث المقالات",
    },
    newsletter: {
      title: "ابقَ على اطلاع",
      description: "احصل على أحدث المقالات في بريدك.",
      subscribe: "اشترك الآن",
    },
  },
  cartToasts: {
    quantityDecreased: "تم تقليل الكمية بنجاح!",
    quantityIncreased: "تم زيادة الكمية بنجاح!",
    itemRemoved: "تمت إزالة العنصر من السلة",
    itemRemovedNamed: "تمت إزالة {name} بنجاح!",
    movedToCart: "تم النقل إلى السلة بنجاح!",
    removeFailed: "فشل إزالة العنصر",
    stockLimit: "لا يمكن إضافة أكثر من المخزون المتاح",
  },
  checkoutAddress: {
    addFirstTitle: "أضف عنوانك الأول",
    addNewTitle: "إضافة عنوان جديد",
    addDescription: "أضف عنوان شحن لـ {email}",
    defaultFirst: "سيكون هذا عنوانك الافتراضي",
    setDefault: "تعيين كعنوان افتراضي",
    adding: "جاري الإضافة...",
    requiredFields: "يرجى ملء جميع الحقول المطلوبة",
    saved: "تم حفظ العنوان بنجاح!",
    addFailed: "فشل إضافة العنوان",
    phoneLabel: "رقم الهاتف",
    cityLabel: "المدينة *",
    stateLabel: "الولاية *",
    zipLabel: "الرمز البريدي *",
  },
  checkoutPlacement: {
    addressRequired: "العنوان مطلوب",
    selectAddress: "يرجى اختيار عنوان الشحن",
    cartEmpty: "السلة فارغة",
    insufficientStock: "مخزون غير كافٍ",
    orderFailed: "فشل الطلب",
  },
  shopMeta: {
    title: "المتجر",
    description:
      "تصفّح القهوة الطازجة، أدوات التحضير، والأساسيات المختارة للتحضير في المنزل أو المكتب.",
  },
  blogMeta: {
    title: "المدونة",
    description: "اقرأ أحدث أفكارنا حول القهوة والتحضير ومحمصتنا.",
  },
};

const shopFiltersEn = {
  brands: "Brands",
  clearBrandFilter: "Clear brand filter",
  priceRange: "Price Range",
  clearPriceFilter: "Clear price filter",
  under100: "Under $100",
  range100_200: "$100 - $200",
  range200_300: "$200 - $300",
  range300_500: "$300 - $500",
  over500: "Over $500",
};

const shopFiltersEs = {
  brands: "Marcas",
  clearBrandFilter: "Limpiar filtro de marca",
  priceRange: "Rango de precio",
  clearPriceFilter: "Limpiar filtro de precio",
  under100: "Menos de $100",
  range100_200: "$100 - $200",
  range200_300: "$200 - $300",
  range300_500: "$300 - $500",
  over500: "Más de $500",
};

const shopFiltersAr = {
  brands: "العلامات",
  clearBrandFilter: "مسح فلتر العلامة",
  priceRange: "نطاق السعر",
  clearPriceFilter: "مسح فلتر السعر",
  under100: "أقل من $100",
  range100_200: "$100 - $200",
  range200_300: "$200 - $300",
  range300_500: "$300 - $500",
  over500: "أكثر من $500",
};

const productDetailsEn = {
  description: "Description",
  additionalInfo: "Additional Information",
  weight: "Weight",
  dimensions: "Dimensions",
  noDescription: "No description available for this product.",
};

const productDetailsEs = {
  description: "Descripción",
  additionalInfo: "Información adicional",
  weight: "Peso",
  dimensions: "Dimensiones",
  noDescription: "No hay descripción disponible para este producto.",
};

const productDetailsAr = {
  description: "الوصف",
  additionalInfo: "معلومات إضافية",
  weight: "الوزن",
  dimensions: "الأبعاد",
  noDescription: "لا يوجد وصف متاح لهذا المنتج.",
};

const wishlistToastsEn = {
  added: "Added to wishlist",
  removed: "Removed from wishlist",
  addedDescription: "Product added successfully!",
  removedDescription: "Product removed successfully!",
};

const wishlistToastsEs = {
  added: "Agregado a la lista de deseos",
  removed: "Eliminado de la lista de deseos",
  addedDescription: "¡Producto agregado con éxito!",
  removedDescription: "¡Producto eliminado con éxito!",
};

const wishlistToastsAr = {
  added: "أُضيف إلى قائمة الأمنيات",
  removed: "أُزيل من قائمة الأمنيات",
  addedDescription: "تمت إضافة المنتج بنجاح!",
  removedDescription: "تمت إزالة المنتج بنجاح!",
};

const addToCartToastsEn = {
  stockLimitTitle: "Stock limit reached",
  stockLimitDescription: "Cannot add more than available stock",
};

const addToCartToastsEs = {
  stockLimitTitle: "Límite de stock alcanzado",
  stockLimitDescription: "No se puede agregar más del stock disponible",
};

const addToCartToastsAr = {
  stockLimitTitle: "تم الوصول لحد المخزون",
  stockLimitDescription: "لا يمكن إضافة أكثر من المخزون المتاح",
};

const miscEn = {
  breadcrumbProducts: "Products",
  premiumCloseAria: "Close",
  mainNavAria: "Main navigation",
  close: "Close",
};

const miscEs = {
  breadcrumbProducts: "Productos",
  premiumCloseAria: "Cerrar",
  mainNavAria: "Navegación principal",
  close: "Cerrar",
};

const miscAr = {
  breadcrumbProducts: "المنتجات",
  premiumCloseAria: "إغلاق",
  mainNavAria: "التنقل الرئيسي",
  close: "إغلاق",
};

for (const [locale, patch] of Object.entries({ en, es, ar })) {
  const path = join(root, "dictionaries", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));

  Object.assign(data, {
    productCard: patch.productCard,
    searchModal: patch.searchModal,
    socialShare: patch.socialShare,
    initialVisit: patch.initialVisit,
    productCatalog: patch.productCatalog,
    productCatalogPage: patch.productCatalogPage,
    authPages: patch.authPages,
    blogSingle: patch.blogSingle,
    cartToasts: patch.cartToasts,
    checkoutAddress: patch.checkoutAddress,
    checkoutPlacement: patch.checkoutPlacement,
    shopMeta: patch.shopMeta,
    blogMeta: patch.blogMeta,
  });

  const shopFilters =
    locale === "en" ? shopFiltersEn : locale === "es" ? shopFiltersEs : shopFiltersAr;
  Object.assign(data.shop, shopFilters);

  const productDetails =
    locale === "en"
      ? productDetailsEn
      : locale === "es"
        ? productDetailsEs
        : productDetailsAr;
  data.product.details = productDetails;

  data.product.defaultProductName = locale === "en"
    ? "this product"
    : locale === "es"
      ? "este producto"
      : "هذا المنتج";

  const wishlistToasts =
    locale === "en"
      ? wishlistToastsEn
      : locale === "es"
        ? wishlistToastsEs
        : wishlistToastsAr;
  data.wishlist.toasts = wishlistToasts;

  const addToCartToasts =
    locale === "en"
      ? addToCartToastsEn
      : locale === "es"
        ? addToCartToastsEs
        : addToCartToastsAr;
  data.product.addToCart.toasts = addToCartToasts;

  const misc = locale === "en" ? miscEn : locale === "es" ? miscEs : miscAr;
  data.breadcrumb.products = misc.breadcrumbProducts;
  data.premium = data.premium || {};
  data.premium.closeAria = misc.premiumCloseAria;
  data.header.menu = data.header.menu || {};
  data.header.menu.mainNavAria = misc.mainNavAria;
  data.common.close = misc.close;

  if (!data.header.search.placeholderShort) {
    data.header.search.placeholderShort = patch.searchModal.placeholder;
  }

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

console.log("Patched remaining customer i18n keys");
