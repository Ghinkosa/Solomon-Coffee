import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const patchEn = {
  dashboard: {
    premiumBanner: {
      title: "Unlock Premium Benefits!",
      freeBadge: "Free",
      description:
        "Get access to exclusive offers, priority customer support, early access to sales, and personalized recommendations. Join our premium community today!",
      prioritySupport: "Priority Support",
      exclusiveOffers: "Exclusive Offers",
      earlyAccess: "Early Access",
      registering: "Registering...",
      applyButton: "Apply for Premium Services",
      toasts: {
        success: "Successfully registered for premium services!",
        successDescription:
          "Welcome to premium! Enjoy exclusive offers and priority support.",
        failed: "Failed to register for premium services",
        error: "Something went wrong. Please try again.",
      },
    },
    applicationSuccess: {
      continueButton: "Continue to Dashboard",
      statusPending: "Status: Pending Review",
      whatNext: "What happens next?",
      benefitsUponApproval: "{type} Benefits (Upon Approval):",
      premiumType: "Premium",
      businessType: "Business",
      premiumSubtitle: "Congratulations {name}!",
      businessSubtitle: "Excellent choice {name}!",
      defaultUserName: "User",
    },
    badges: {
      vip: "VIP",
      premium: "Premium",
      member: "Member",
    },
  },
  settings: {
    newsletter: {
      title: "Newsletter Subscription",
      description: "Manage your newsletter subscription preferences",
      subscribed: "Subscribed to Newsletter",
      notSubscribed: "Not Subscribed",
      benefitsTitle: "Newsletter Benefits:",
      benefits: [
        "Exclusive deals & discounts up to 50% off",
        "Early access to new products",
        "Free shipping offers",
        "Shopping tips & trends",
        "Birthday surprises",
      ],
      subscribe: "Subscribe to Newsletter",
      unsubscribe: "Unsubscribe from Newsletter",
      subscribing: "Subscribing...",
      unsubscribing: "Unsubscribing...",
      footerSubscribed: "You can resubscribe at any time",
      footerNotSubscribed: "Join 50,000+ subscribers and never miss a deal",
      toasts: {
        emailNotFound: "Email not found",
        subscribeSuccess: "Successfully subscribed to newsletter!",
        alreadySubscribed: "You're already subscribed!",
        subscribeFailed: "Failed to subscribe",
        unsubscribeSuccess: "Successfully unsubscribed from newsletter",
        unsubscribeFailed: "Failed to unsubscribe",
        genericError: "Something went wrong. Please try again.",
      },
    },
  },
  checkoutSuccess: {
    title: "Order Placed Successfully!",
    thankYou:
      "Thank you for your purchase! Your order has been confirmed and we're preparing it for shipment. You'll receive a confirmation email",
    orderNumber: "Order Number:",
    whatNext: "What happens next?",
    steps: {
      processing: {
        title: "Order Processing",
        description: "We're preparing your items for shipment",
      },
      shipping: {
        title: "Shipping",
        description: "Your order will be shipped within 2-3 business days",
      },
      delivery: {
        title: "Delivery",
        description: "Delivered to your doorstep with tracking updates",
      },
    },
    recentOrders: "Your Recent Orders",
    orderLabel: "Order #",
    view: "View",
    showLess: "Show Less",
    showAll: "Show All {count} Orders",
    continueShopping: "Continue Shopping",
    trackOrder: "Track Order",
    trackOrders: "Track Orders",
    shopMore: "Shop More",
    notAvailable: "N/A",
  },
};

const patchEs = {
  dashboard: {
    premiumBanner: {
      title: "¡Desbloquea beneficios premium!",
      freeBadge: "Gratis",
      description:
        "Accede a ofertas exclusivas, soporte prioritario, acceso anticipado a rebajas y recomendaciones personalizadas. ¡Únete hoy!",
      prioritySupport: "Soporte prioritario",
      exclusiveOffers: "Ofertas exclusivas",
      earlyAccess: "Acceso anticipado",
      registering: "Registrando...",
      applyButton: "Solicitar servicios premium",
      toasts: {
        success: "¡Registro en servicios premium completado!",
        successDescription:
          "¡Bienvenido a premium! Disfruta ofertas exclusivas y soporte prioritario.",
        failed: "Error al registrarse en servicios premium",
        error: "Algo salió mal. Inténtalo de nuevo.",
      },
    },
    applicationSuccess: {
      continueButton: "Continuar al panel",
      statusPending: "Estado: revisión pendiente",
      whatNext: "¿Qué sigue?",
      benefitsUponApproval: "Beneficios {type} (al aprobar):",
      premiumType: "Premium",
      businessType: "Business",
      premiumSubtitle: "¡Felicidades {name}!",
      businessSubtitle: "¡Excelente elección {name}!",
      defaultUserName: "Usuario",
    },
    badges: { vip: "VIP", premium: "Premium", member: "Miembro" },
  },
  settings: {
    newsletter: {
      title: "Suscripción al boletín",
      description: "Gestiona tus preferencias de suscripción al boletín",
      subscribed: "Suscrito al boletín",
      notSubscribed: "No suscrito",
      benefitsTitle: "Beneficios del boletín:",
      benefits: [
        "Ofertas y descuentos exclusivos de hasta 50%",
        "Acceso anticipado a nuevos productos",
        "Ofertas de envío gratis",
        "Consejos y tendencias de compra",
        "Sorpresas de cumpleaños",
      ],
      subscribe: "Suscribirse al boletín",
      unsubscribe: "Cancelar suscripción al boletín",
      subscribing: "Suscribiendo...",
      unsubscribing: "Cancelando suscripción...",
      footerSubscribed: "Puedes volver a suscribirte en cualquier momento",
      footerNotSubscribed:
        "Únete a más de 50.000 suscriptores y no te pierdas ninguna oferta",
      toasts: {
        emailNotFound: "Correo no encontrado",
        subscribeSuccess: "¡Suscripción al boletín completada!",
        alreadySubscribed: "¡Ya estás suscrito!",
        subscribeFailed: "Error al suscribirse",
        unsubscribeSuccess: "Suscripción cancelada correctamente",
        unsubscribeFailed: "Error al cancelar la suscripción",
        genericError: "Algo salió mal. Inténtalo de nuevo.",
      },
    },
  },
  checkoutSuccess: {
    title: "¡Pedido realizado con éxito!",
    thankYou:
      "¡Gracias por tu compra! Tu pedido está confirmado y lo estamos preparando para el envío. Recibirás un correo de confirmación",
    orderNumber: "Número de pedido:",
    whatNext: "¿Qué sigue?",
    steps: {
      processing: {
        title: "Procesamiento del pedido",
        description: "Estamos preparando tus artículos para el envío",
      },
      shipping: {
        title: "Envío",
        description: "Tu pedido se enviará en 2-3 días hábiles",
      },
      delivery: {
        title: "Entrega",
        description: "Entregado en tu puerta con actualizaciones de seguimiento",
      },
    },
    recentOrders: "Tus pedidos recientes",
    orderLabel: "Pedido #",
    view: "Ver",
    showLess: "Mostrar menos",
    showAll: "Mostrar los {count} pedidos",
    continueShopping: "Seguir comprando",
    trackOrder: "Rastrear pedido",
    trackOrders: "Rastrear pedidos",
    shopMore: "Comprar más",
    notAvailable: "N/D",
  },
};

const patchAr = {
  dashboard: {
    premiumBanner: {
      title: "افتح مزايا Premium!",
      freeBadge: "مجاني",
      description:
        "احصل على عروض حصرية ودعم أولوية ووصول مبكر للتخفيضات وتوصيات مخصصة. انضم اليوم!",
      prioritySupport: "دعم أولوية",
      exclusiveOffers: "عروض حصرية",
      earlyAccess: "وصول مبكر",
      registering: "جاري التسجيل...",
      applyButton: "التقديم لخدمات Premium",
      toasts: {
        success: "تم التسجيل في خدمات Premium بنجاح!",
        successDescription:
          "مرحباً بك في Premium! استمتع بالعروض الحصرية والدعم الأولوي.",
        failed: "فشل التسجيل في خدمات Premium",
        error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      },
    },
    applicationSuccess: {
      continueButton: "المتابعة إلى لوحة التحكم",
      statusPending: "الحالة: قيد المراجعة",
      whatNext: "ماذا بعد؟",
      benefitsUponApproval: "مزايا {type} (عند الموافقة):",
      premiumType: "Premium",
      businessType: "Business",
      premiumSubtitle: "تهانينا {name}!",
      businessSubtitle: "اختيار ممتاز {name}!",
      defaultUserName: "مستخدم",
    },
    badges: { vip: "VIP", premium: "Premium", member: "عضو" },
  },
  settings: {
    newsletter: {
      title: "اشتراك النشرة البريدية",
      description: "إدارة تفضيلات اشتراك النشرة البريدية",
      subscribed: "مشترك في النشرة",
      notSubscribed: "غير مشترك",
      benefitsTitle: "مزايا النشرة:",
      benefits: [
        "عروض وخصومات حصرية حتى 50%",
        "وصول مبكر للمنتجات الجديدة",
        "عروض شحن مجاني",
        "نصائح واتجاهات التسوق",
        "مفاجآت عيد الميلاد",
      ],
      subscribe: "الاشتراك في النشرة",
      unsubscribe: "إلغاء الاشتراك في النشرة",
      subscribing: "جاري الاشتراك...",
      unsubscribing: "جاري إلغاء الاشتراك...",
      footerSubscribed: "يمكنك إعادة الاشتراك في أي وقت",
      footerNotSubscribed: "انضم إلى أكثر من 50,000 مشترك ولا تفوت أي عرض",
      toasts: {
        emailNotFound: "البريد غير موجود",
        subscribeSuccess: "تم الاشتراك في النشرة بنجاح!",
        alreadySubscribed: "أنت مشترك بالفعل!",
        subscribeFailed: "فشل الاشتراك",
        unsubscribeSuccess: "تم إلغاء الاشتراك بنجاح",
        unsubscribeFailed: "فشل إلغاء الاشتراك",
        genericError: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      },
    },
  },
  checkoutSuccess: {
    title: "تم تقديم الطلب بنجاح!",
    thankYou:
      "شكراً لشرائك! تم تأكيد طلبك ونحن نجهّزه للشحن. ستتلقى رسالة تأكيد بالبريد",
    orderNumber: "رقم الطلب:",
    whatNext: "ماذا بعد؟",
    steps: {
      processing: {
        title: "معالجة الطلب",
        description: "نحن نجهّز عناصر طلبك للشحن",
      },
      shipping: {
        title: "الشحن",
        description: "سيُشحن طلبك خلال 2-3 أيام عمل",
      },
      delivery: {
        title: "التسليم",
        description: "يُسلّم إلى باب منزلك مع تحديثات التتبع",
      },
    },
    recentOrders: "طلباتك الأخيرة",
    orderLabel: "طلب #",
    view: "عرض",
    showLess: "عرض أقل",
    showAll: "عرض كل {count} طلب",
    continueShopping: "متابعة التسوق",
    trackOrder: "تتبع الطلب",
    trackOrders: "تتبع الطلبات",
    shopMore: "تسوق المزيد",
    notAvailable: "غ/م",
  },
};

const locales = { en: patchEn, es: patchEs, ar: patchAr };

for (const [locale, patch] of Object.entries(locales)) {
  const path = join(root, "dictionaries", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));

  data.userDashboard.dashboard = {
    ...data.userDashboard.dashboard,
    ...patch.dashboard,
  };
  data.userDashboard.settings = {
    ...data.userDashboard.settings,
    newsletter: patch.settings.newsletter,
  };
  data.userDashboard.checkoutSuccess = patch.checkoutSuccess;

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

console.log("Patched remaining user dashboard i18n keys");
