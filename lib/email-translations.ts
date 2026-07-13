import type { Locale } from "@/i18n-config";

export type EmailLocale = Locale;

type EmailStrings = {
  subject: string;
  headerTitle: string;
  headerSubtitle: string;
  greeting: (name: string) => string;
  intro: string;
  orderId: string;
  orderDate: string;
  item: string;
  product: string;
  qty: string;
  price: string;
  subtotal: string;
  shipping: string;
  tax: string;
  total: string;
  shippingAddress: string;
  estimatedDelivery: string;
  nextStepsTitle: string;
  nextSteps: string[];
  needHelp: string;
  helpIntro: string;
  emailLabel: string;
  phoneLabel: string;
  hoursLabel: string;
  thankYou: (company: string) => string;
  textIntro: string;
  textItemsOrdered: string;
  textShippingAddress: string;
  textTrackingNote: string;
  textQuestions: (supportEmail: string, phone: string) => string;
};

const translations: Record<EmailLocale, EmailStrings> = {
  en: {
    subject: "Order Confirmation",
    headerTitle: "Order Confirmed!",
    headerSubtitle: "Thank you for shopping with",
    greeting: (name) => `Hi ${name}!`,
    intro:
      "We're excited to let you know that your order has been confirmed and is being prepared for shipment. You'll receive another email when your order is on its way.",
    orderId: "Order #",
    orderDate: "Placed on",
    item: "Item",
    product: "Product",
    qty: "Qty",
    price: "Price",
    subtotal: "Subtotal:",
    shipping: "Shipping:",
    tax: "Tax:",
    total: "Total:",
    shippingAddress: "Shipping Address",
    estimatedDelivery: "Estimated Delivery",
    nextStepsTitle: "What happens next?",
    nextSteps: [
      "We'll prepare your order for shipment",
      "You'll receive a tracking number via email once shipped",
      "Track your package progress in real-time",
      "Your order will be delivered to the address provided",
    ],
    needHelp: "Need Help?",
    helpIntro:
      "Our customer service team is here to help with any questions about your order.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    hoursLabel: "Hours",
    thankYou: (company) => `Thank you for choosing ${company}!`,
    textIntro: "Thank you for your order! Here are the details:",
    textItemsOrdered: "Items Ordered:",
    textShippingAddress: "Shipping Address:",
    textTrackingNote:
      "We'll send you another email with tracking information once your order ships.",
    textQuestions: (email, phone) =>
      `If you have any questions, please contact us at ${email} or ${phone}.`,
  },
  es: {
    subject: "Confirmación de pedido",
    headerTitle: "¡Pedido confirmado!",
    headerSubtitle: "Gracias por comprar en",
    greeting: (name) => `¡Hola ${name}!`,
    intro:
      "Nos complace informarte que tu pedido ha sido confirmado y se está preparando para el envío. Recibirás otro correo cuando tu pedido esté en camino.",
    orderId: "Pedido #",
    orderDate: "Realizado el",
    item: "Artículo",
    product: "Producto",
    qty: "Cant.",
    price: "Precio",
    subtotal: "Subtotal:",
    shipping: "Envío:",
    tax: "Impuesto:",
    total: "Total:",
    shippingAddress: "Dirección de envío",
    estimatedDelivery: "Entrega estimada",
    nextStepsTitle: "¿Qué sigue?",
    nextSteps: [
      "Prepararemos tu pedido para el envío",
      "Recibirás un número de seguimiento por correo cuando se envíe",
      "Podrás seguir tu paquete en tiempo real",
      "Tu pedido se entregará en la dirección indicada",
    ],
    needHelp: "¿Necesitas ayuda?",
    helpIntro:
      "Nuestro equipo de atención al cliente está aquí para ayudarte con cualquier pregunta sobre tu pedido.",
    emailLabel: "Correo",
    phoneLabel: "Teléfono",
    hoursLabel: "Horario",
    thankYou: (company) => `¡Gracias por elegir ${company}!`,
    textIntro: "¡Gracias por tu pedido! Aquí están los detalles:",
    textItemsOrdered: "Artículos pedidos:",
    textShippingAddress: "Dirección de envío:",
    textTrackingNote:
      "Te enviaremos otro correo con la información de seguimiento cuando tu pedido sea enviado.",
    textQuestions: (email, phone) =>
      `Si tienes alguna pregunta, contáctanos en ${email} o ${phone}.`,
  },
  ar: {
    subject: "تأكيد الطلب",
    headerTitle: "تم تأكيد الطلب!",
    headerSubtitle: "شكراً لتسوقك من",
    greeting: (name) => `مرحباً ${name}!`,
    intro:
      "يسعدنا إبلاغك بأن طلبك قد تم تأكيده وجاري تجهيزه للشحن. ستتلقى بريداً إلكترونياً آخر عندما يكون طلبك في الطريق.",
    orderId: "طلب رقم",
    orderDate: "تاريخ الطلب",
    item: "الصورة",
    product: "المنتج",
    qty: "الكمية",
    price: "السعر",
    subtotal: "المجموع الفرعي:",
    shipping: "الشحن:",
    tax: "الضريبة:",
    total: "الإجمالي:",
    shippingAddress: "عنوان الشحن",
    estimatedDelivery: "موعد التسليم المتوقع",
    nextStepsTitle: "ماذا بعد؟",
    nextSteps: [
      "سنقوم بتجهيز طلبك للشحن",
      "ستتلقى رقم تتبع عبر البريد الإلكتروني عند الشحن",
      "يمكنك متابعة شحنتك في الوقت الفعلي",
      "سيتم تسليم طلبك إلى العنوان المحدد",
    ],
    needHelp: "هل تحتاج مساعدة؟",
    helpIntro: "فريق خدمة العملاء لدينا جاهز لمساعدتك في أي استفسار حول طلبك.",
    emailLabel: "البريد الإلكتروني",
    phoneLabel: "الهاتف",
    hoursLabel: "ساعات العمل",
    thankYou: (company) => `شكراً لاختيارك ${company}!`,
    textIntro: "شكراً لطلبك! إليك التفاصيل:",
    textItemsOrdered: "المنتجات المطلوبة:",
    textShippingAddress: "عنوان الشحن:",
    textTrackingNote:
      "سنرسل لك بريداً إلكترونياً آخر يتضمن معلومات التتبع عند شحن طلبك.",
    textQuestions: (email, phone) =>
      `إذا كان لديك أي أسئلة، يرجى التواصل معنا على ${email} أو ${phone}.`,
  },
};

export function getEmailStrings(locale?: string | null): EmailStrings {
  if (locale === "es" || locale === "ar") {
    return translations[locale];
  }
  return translations.en;
}

export function normalizeEmailLocale(locale?: string | null): EmailLocale {
  if (locale === "es" || locale === "ar") return locale;
  return "en";
}
