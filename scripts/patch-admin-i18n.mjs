import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const adminCommonEn = {
  processing: "Processing...",
  approve: "Approve",
  reject: "Reject",
  membership: "Membership:",
  reason: "Reason: {reason}",
  date: "Date:",
  appliedOn: "Applied {date}",
  joinedOn: "Joined {date}",
  approvedBy: "Approved by:",
  approvedOn: "Approved on:",
  processedBy: "Processed by:",
};

const adminStatusEn = {
  active: "Active",
  pending: "Pending",
  rejected: "Rejected",
  approved: "Approved",
  regular: "Regular",
  none: "None",
};

const adminPagesEn = {
  common: adminCommonEn,
  status: adminStatusEn,
  manageUsersPage: {
    title: "Admin User Management",
    subtitle: "Manage user premium status and account settings",
    cardTitle: "User Premium Status",
    emailLabel: "User Email",
    emailPlaceholder: "user@example.com",
    setPremium: "Set as Premium User",
    setStandard: "Set as Standard User",
    premiumHelp: "Premium User: isActive = true, gets premium features",
    standardHelp: "Standard User: isActive = false, basic features only",
    quickAccess: "Quick Access",
    setAdminUser: "Set Admin User (admin@shebascoffee.com)",
    toasts: {
      emailRequired: "Please enter an email address",
      manageFailed: "Failed to manage user",
      manageError: "Error managing user",
    },
  },
  premiumAccountsPage: {
    title: "Premium Account Management",
    subtitle: "Manage and approve premium account applications",
    emptyTitle: "No Premium Applications",
    emptyDescription: "No premium account applications found.",
    defaultRejectReason: "Application does not meet requirements",
    toasts: {
      fetchFailed: "Failed to fetch premium accounts",
      loadError: "Error loading premium accounts",
      approved: "Premium account approved successfully",
      rejected: "Premium account rejected successfully",
      updateFailed: "Failed to update premium account",
      updateError: "Error updating premium account",
    },
  },
  businessAccountsPage: {
    title: "Business Account Management",
    subtitle: "Manage and approve business account requests",
    emptyTitle: "No Business Accounts",
    emptyDescription: "No business account requests found.",
    toasts: {
      fetchFailed: "Failed to fetch business accounts",
      loadError: "Error loading business accounts",
      approved: "Business account approved successfully",
      rejected: "Business account rejected successfully",
      updateFailed: "Failed to update business account",
      updateError: "Error updating business account",
    },
  },
};

const ordersExtraEn = {
  pagination: {
    previous: "Previous",
    next: "Next",
    previousAria: "Go to previous page",
    nextAria: "Go to next page",
    morePages: "More pages",
    navAria: "pagination",
  },
  dialog: {
    title: "Order Details - {number}",
    customer: "Customer:",
    email: "Email:",
    date: "Date:",
    status: "Status:",
    invoiceNumber: "Invoice Number:",
    viewInvoice: "View Invoice",
    quantity: "Quantity",
    price: "Price",
  },
};

const translations = {
  en: { admin: adminPagesEn, ordersExtra: ordersExtraEn },
  es: {
    admin: {
      common: {
        processing: "Procesando...",
        approve: "Aprobar",
        reject: "Rechazar",
        membership: "Membresía:",
        reason: "Motivo: {reason}",
        date: "Fecha:",
        appliedOn: "Solicitado {date}",
        joinedOn: "Registrado {date}",
        approvedBy: "Aprobado por:",
        approvedOn: "Aprobado el:",
        processedBy: "Procesado por:",
      },
      status: {
        active: "Activo",
        pending: "Pendiente",
        rejected: "Rechazado",
        approved: "Aprobado",
        regular: "Regular",
        none: "Ninguno",
      },
      manageUsersPage: {
        title: "Gestión de usuarios admin",
        subtitle: "Gestiona el estado premium y la configuración de cuentas",
        cardTitle: "Estado premium del usuario",
        emailLabel: "Correo del usuario",
        emailPlaceholder: "usuario@ejemplo.com",
        setPremium: "Establecer como usuario premium",
        setStandard: "Establecer como usuario estándar",
        premiumHelp:
          "Usuario premium: isActive = true, accede a funciones premium",
        standardHelp:
          "Usuario estándar: isActive = false, solo funciones básicas",
        quickAccess: "Acceso rápido",
        setAdminUser: "Establecer admin (admin@shebascoffee.com)",
        toasts: {
          emailRequired: "Introduce una dirección de correo",
          manageFailed: "Error al gestionar el usuario",
          manageError: "Error al gestionar el usuario",
        },
      },
      premiumAccountsPage: {
        title: "Gestión de cuentas premium",
        subtitle: "Gestiona y aprueba solicitudes de cuentas premium",
        emptyTitle: "Sin solicitudes premium",
        emptyDescription: "No se encontraron solicitudes de cuentas premium.",
        defaultRejectReason: "La solicitud no cumple los requisitos",
        toasts: {
          fetchFailed: "Error al obtener cuentas premium",
          loadError: "Error al cargar cuentas premium",
          approved: "Cuenta premium aprobada correctamente",
          rejected: "Cuenta premium rechazada correctamente",
          updateFailed: "Error al actualizar la cuenta premium",
          updateError: "Error al actualizar la cuenta premium",
        },
      },
      businessAccountsPage: {
        title: "Gestión de cuentas business",
        subtitle: "Gestiona y aprueba solicitudes de cuentas business",
        emptyTitle: "Sin cuentas business",
        emptyDescription: "No se encontraron solicitudes de cuentas business.",
        toasts: {
          fetchFailed: "Error al obtener cuentas business",
          loadError: "Error al cargar cuentas business",
          approved: "Cuenta business aprobada correctamente",
          rejected: "Cuenta business rechazada correctamente",
          updateFailed: "Error al actualizar la cuenta business",
          updateError: "Error al actualizar la cuenta business",
        },
      },
    },
    ordersExtra: {
      pagination: {
        previous: "Anterior",
        next: "Siguiente",
        previousAria: "Ir a la página anterior",
        nextAria: "Ir a la página siguiente",
        morePages: "Más páginas",
        navAria: "paginación",
      },
      dialog: {
        title: "Detalles del pedido - {number}",
        customer: "Cliente:",
        email: "Correo:",
        date: "Fecha:",
        status: "Estado:",
        invoiceNumber: "Número de factura:",
        viewInvoice: "Ver factura",
        quantity: "Cantidad",
        price: "Precio",
      },
    },
  },
  ar: {
    admin: {
      common: {
        processing: "جاري المعالجة...",
        approve: "موافقة",
        reject: "رفض",
        membership: "العضوية:",
        reason: "السبب: {reason}",
        date: "التاريخ:",
        appliedOn: "تاريخ التقديم {date}",
        joinedOn: "تاريخ الانضمام {date}",
        approvedBy: "وافق عليه:",
        approvedOn: "تاريخ الموافقة:",
        processedBy: "عالجه:",
      },
      status: {
        active: "نشط",
        pending: "قيد الانتظار",
        rejected: "مرفوض",
        approved: "موافق عليه",
        regular: "عادي",
        none: "لا يوجد",
      },
      manageUsersPage: {
        title: "إدارة مستخدمي المشرف",
        subtitle: "إدارة حالة Premium وإعدادات الحساب",
        cardTitle: "حالة Premium للمستخدم",
        emailLabel: "بريد المستخدم",
        emailPlaceholder: "user@example.com",
        setPremium: "تعيين كمستخدم Premium",
        setStandard: "تعيين كمستخدم عادي",
        premiumHelp: "مستخدم Premium: isActive = true، يحصل على ميزات premium",
        standardHelp: "مستخدم عادي: isActive = false، ميزات أساسية فقط",
        quickAccess: "وصول سريع",
        setAdminUser: "تعيين المشرف (admin@shebascoffee.com)",
        toasts: {
          emailRequired: "يرجى إدخال عنوان البريد الإلكتروني",
          manageFailed: "فشل إدارة المستخدم",
          manageError: "حدث خطأ أثناء إدارة المستخدم",
        },
      },
      premiumAccountsPage: {
        title: "إدارة حسابات Premium",
        subtitle: "إدارة واعتماد طلبات حسابات Premium",
        emptyTitle: "لا توجد طلبات Premium",
        emptyDescription: "لم يتم العثور على طلبات حسابات premium.",
        defaultRejectReason: "الطلب لا يستوفي المتطلبات",
        toasts: {
          fetchFailed: "فشل جلب حسابات Premium",
          loadError: "خطأ في تحميل حسابات Premium",
          approved: "تمت الموافقة على حساب Premium بنجاح",
          rejected: "تم رفض حساب Premium بنجاح",
          updateFailed: "فشل تحديث حساب Premium",
          updateError: "خطأ في تحديث حساب Premium",
        },
      },
      businessAccountsPage: {
        title: "إدارة حسابات Business",
        subtitle: "إدارة واعتماد طلبات حسابات Business",
        emptyTitle: "لا توجد حسابات Business",
        emptyDescription: "لم يتم العثور على طلبات حسابات business.",
        toasts: {
          fetchFailed: "فشل جلب حسابات Business",
          loadError: "خطأ في تحميل حسابات Business",
          approved: "تمت الموافقة على حساب Business بنجاح",
          rejected: "تم رفض حساب Business بنجاح",
          updateFailed: "فشل تحديث حساب Business",
          updateError: "خطأ في تحديث حساب Business",
        },
      },
    },
    ordersExtra: {
      pagination: {
        previous: "السابق",
        next: "التالي",
        previousAria: "الانتقال إلى الصفحة السابقة",
        nextAria: "الانتقال إلى الصفحة التالية",
        morePages: "المزيد من الصفحات",
        navAria: "ترقيم الصفحات",
      },
      dialog: {
        title: "تفاصيل الطلب - {number}",
        customer: "العميل:",
        email: "البريد:",
        date: "التاريخ:",
        status: "الحالة:",
        invoiceNumber: "رقم الفاتورة:",
        viewInvoice: "عرض الفاتورة",
        quantity: "الكمية",
        price: "السعر",
      },
    },
  },
};

for (const [locale, patch] of Object.entries(translations)) {
  const path = join(root, "dictionaries", `${locale}.json`);
  const data = JSON.parse(readFileSync(path, "utf8"));

  data.userDashboard.admin = {
    ...data.userDashboard.admin,
    ...patch.admin,
  };
  data.userDashboard.orders.pagination = patch.ordersExtra.pagination;
  data.userDashboard.orders.dialog = patch.ordersExtra.dialog;

  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

console.log("Patched admin + orders pagination/dialog i18n keys");
