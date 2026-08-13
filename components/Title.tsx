import { ReactNode, isValidElement } from "react";
import { twMerge } from "tailwind-merge";
import { toDisplayText } from "@/lib/locale-content";

interface Props {
  children: ReactNode;
  className?: string;
}

function asSafeChild(children: ReactNode): ReactNode {
  if (children == null || typeof children === "string" || typeof children === "number") {
    return children;
  }
  if (typeof children === "boolean") return null;
  if (isValidElement(children) || Array.isArray(children)) return children;
  // Locale maps ({ en, ar }) or other plain objects must never reach React.
  if (typeof children === "object") {
    return toDisplayText(children);
  }
  return null;
}

const Title = ({ children, className }: Props) => {
  return (
    <h2 className={twMerge("text-2xl font-semibold", className)}>
      {asSafeChild(children)}
    </h2>
  );
};

export default Title;
