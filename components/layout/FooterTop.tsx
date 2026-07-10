import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { contactConfig } from "@/config/contact";
import { t } from "@/lib/dictionary-utils";

interface ContactItemData {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href?: string;
}

const FooterTop = ({ dictionary }: { dictionary?: any }) => {
  const data: ContactItemData[] = [
    {
      title: t(dictionary, "footer.contact.visitUs", "Visit Us"),
      subtitle: `${contactConfig.company.address}, ${contactConfig.company.city}`,
      icon: <MapPin className="h-5 w-5" />,
      href: `https://maps.google.com/?q=${encodeURIComponent(`${contactConfig.company.address}, ${contactConfig.company.city}`)}`,
    },
    {
      title: t(dictionary, "footer.contact.callUs", "Call Us"),
      subtitle: contactConfig.company.phone,
      icon: <Phone className="h-5 w-5" />,
      href: `tel:${contactConfig.company.phone.replace(/\D/g, "")}`,
    },
    {
      title: t(dictionary, "footer.contact.workingHours", "Working Hours"),
      subtitle: contactConfig.businessHours.weekday,
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: t(dictionary, "footer.contact.emailUs", "Email Us"),
      subtitle: contactConfig.emails.support,
      icon: <Mail className="h-5 w-5" />,
      href: `mailto:${contactConfig.emails.support}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 border-b border-shop_orange/20 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 lg:py-10">
      {data.map((item) => (
        <ContactItem
          key={item.title}
          icon={item.icon}
          title={item.title}
          content={item.subtitle}
          href={item.href}
        />
      ))}
    </div>
  );
};

interface ContactItemProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  href?: string;
}

const ContactItem = ({ icon, title, content, href }: ContactItemProps) => {
  const Component = href ? "a" : "div";
  const props = href
    ? {
        href,
        target: href.startsWith("http") ? "_blank" : "_self",
        rel: href.startsWith("http") ? "noopener noreferrer" : undefined,
      }
    : {};

  return (
    <Component
      {...props}
      className="group flex items-start gap-3 rounded-xl border border-shop_orange/10 bg-shop_btn_dark_green/30 p-4 transition-colors hover:border-shop_orange/35 hover:bg-shop_btn_dark_green/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-shop_dark_green text-shop_orange ring-1 ring-shop_orange/30 transition-colors group-hover:bg-shop_orange group-hover:text-shop_dark_green">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-shop_light_pink transition-colors group-hover:text-shop_orange">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-shop_light_pink/70 transition-colors group-hover:text-shop_light_pink/90">
          {content}
        </p>
      </div>
    </Component>
  );
};

export default FooterTop;
