"use client";

import { useRef, useState } from "react";
import {
  defineSchema,
  EditorProvider,
  PortableTextEditable,
  useEditor,
  useEditorSelector,
  keyGenerator,
  type PortableTextBlock,
  type RenderBlockFunction,
  type RenderDecoratorFunction,
  type RenderListItemFunction,
  type RenderStyleFunction,
  type RenderAnnotationFunction,
} from "@portabletext/editor";
import { EventListenerPlugin } from "@portabletext/editor/plugins";
import * as selectors from "@portabletext/editor/selectors";
import {
  Bold,
  Italic,
  Link2,
  List,
  ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Pilcrow,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { urlFor } from "@/sanity/lib/image";

const schemaDefinition = defineSchema({
  decorators: [{ name: "strong" }, { name: "em" }],
  styles: [
    { name: "normal" },
    { name: "h1" },
    { name: "h2" },
    { name: "h3" },
    { name: "h4" },
    { name: "blockquote" },
  ],
  lists: [{ name: "bullet" }],
  annotations: [
    {
      name: "link",
      fields: [{ name: "href", type: "string" }],
    },
  ],
  inlineObjects: [],
  blockObjects: [
    {
      name: "image",
      fields: [
        { name: "alt", type: "string" },
        { name: "assetRef", type: "string" },
        // Editor-only preview URL; stripped before Sanity write
        { name: "previewUrl", type: "string" },
      ],
    },
  ],
});

const STYLE_META: Record<string, { label: string; icon: typeof Pilcrow }> = {
  normal: { label: "Paragraph", icon: Pilcrow },
  h1: { label: "Heading 1", icon: Heading1 },
  h2: { label: "Heading 2", icon: Heading2 },
  h3: { label: "Heading 3", icon: Heading3 },
  h4: { label: "Heading 4", icon: Heading4 },
  blockquote: { label: "Quote", icon: Quote },
};

/** Keep selection when clicking toolbar buttons */
function keepSelection(e: React.MouseEvent) {
  e.preventDefault();
}

function toolBtnClass(active: boolean, disabled?: boolean) {
  return cn(
    "h-8 px-2 text-xs",
    active &&
      "bg-shop_dark_green text-white hover:bg-shop_btn_dark_green hover:text-white",
    disabled && "opacity-40",
  );
}

const renderStyle: RenderStyleFunction = (props) => {
  switch (props.schemaType.value) {
    case "h1":
      return (
        <h1 className="mb-3 text-3xl font-bold text-shop_dark_green">
          {props.children}
        </h1>
      );
    case "h2":
      return (
        <h2 className="mb-3 text-2xl font-bold text-shop_dark_green">
          {props.children}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mb-2 text-xl font-semibold text-shop_dark_green">
          {props.children}
        </h3>
      );
    case "h4":
      return (
        <h4 className="mb-2 text-lg font-semibold text-shop_dark_green">
          {props.children}
        </h4>
      );
    case "blockquote":
      return (
        <blockquote className="my-3 border-l-4 border-shop_light_green bg-shop_light_bg/80 py-2 pl-4 italic text-shop_dark_green/80">
          {props.children}
        </blockquote>
      );
    default:
      return (
        <p className="mb-3 leading-relaxed text-shop_dark_green/90">
          {props.children}
        </p>
      );
  }
};

const renderDecorator: RenderDecoratorFunction = (props) => {
  if (props.value === "strong") return <strong>{props.children}</strong>;
  if (props.value === "em") return <em>{props.children}</em>;
  return <>{props.children}</>;
};

const renderAnnotation: RenderAnnotationFunction = (props) => {
  if (props.schemaType.name === "link") {
    const href =
      typeof props.value?.href === "string" ? props.value.href : "#";
    return (
      <a
        href={href}
        className="text-shop_light_green underline underline-offset-2"
      >
        {props.children}
      </a>
    );
  }
  return <>{props.children}</>;
};

const renderListItem: RenderListItemFunction = (props) => (
  <li className="ml-5 list-disc">{props.children}</li>
);

const renderBlock: RenderBlockFunction = (props) => {
  if (props.schemaType.name === "image") {
    const value = props.value as {
      asset?: { _ref?: string; _type?: string };
      assetRef?: string;
      alt?: string;
      previewUrl?: string;
    };
    let src = value.previewUrl || "";
    const ref = value.assetRef || value.asset?._ref;
    if (!src && ref) {
      try {
        src = urlFor({
          asset: { _ref: ref, _type: "reference" },
        } as Parameters<typeof urlFor>[0]).width(640).url();
      } catch {
        src = "";
      }
    }
    return (
      <div
        contentEditable={false}
        className="my-4 overflow-hidden rounded-lg border border-shop_dark_green/10 bg-shop_light_bg/50"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={value.alt || ""}
            className="max-h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Image
          </div>
        )}
        {props.children}
      </div>
    );
  }
  return <div className="min-h-[1.5em]">{props.children}</div>;
};

function DecoratorBtn({ name }: { name: "strong" | "em" }) {
  const editor = useEditor();
  const active = useEditorSelector(editor, selectors.isActiveDecorator(name));
  const Icon = name === "strong" ? Bold : Italic;
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={toolBtnClass(active)}
      onMouseDown={keepSelection}
      onClick={() => {
        editor.send({ type: "decorator.toggle", decorator: name });
        editor.send({ type: "focus" });
      }}
      title={name === "strong" ? "Bold" : "Italic"}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function StyleBtn({ style }: { style: string }) {
  const editor = useEditor();
  const active = useEditorSelector(editor, selectors.isActiveStyle(style));
  const meta = STYLE_META[style] || STYLE_META.normal;
  const Icon = meta.icon;
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={toolBtnClass(active)}
      onMouseDown={keepSelection}
      onClick={() => {
        editor.send({ type: "style.toggle", style });
        editor.send({ type: "focus" });
      }}
      title={meta.label}
    >
      <Icon className="h-4 w-4" />
      <span className="ml-1 hidden xl:inline">{meta.label}</span>
    </Button>
  );
}

function ListBtn({ listItem }: { listItem: string }) {
  const editor = useEditor();
  const active = useEditorSelector(
    editor,
    selectors.isActiveListItem(listItem),
  );
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      className={toolBtnClass(active)}
      onMouseDown={keepSelection}
      onClick={() => {
        editor.send({ type: "list item.toggle", listItem });
        editor.send({ type: "focus" });
      }}
      title="Bullet list"
    >
      <List className="h-4 w-4" />
    </Button>
  );
}

function LinkBtn() {
  const editor = useEditor();
  const active = useEditorSelector(
    editor,
    selectors.isActiveAnnotation("link"),
  );
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("https://");

  return (
    <div className="relative flex items-center gap-1">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className={toolBtnClass(active)}
        onMouseDown={keepSelection}
        onClick={() => {
          if (active) {
            editor.send({
              type: "annotation.remove",
              annotation: { name: "link" },
            });
            editor.send({ type: "focus" });
            setOpen(false);
          } else {
            setOpen(true);
          }
        }}
        title="Link"
      >
        <Link2 className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute top-9 left-0 z-20 flex w-72 gap-1 rounded-md border bg-white p-2 shadow-md">
          <Input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <Button
            type="button"
            size="sm"
            className="h-8 bg-shop_dark_green hover:bg-shop_btn_dark_green"
            onMouseDown={keepSelection}
            onClick={() => {
              editor.send({
                type: "annotation.add",
                annotation: {
                  name: "link",
                  value: { href: href.trim() || "https://" },
                },
              });
              editor.send({ type: "focus" });
              setHref("https://");
              setOpen(false);
            }}
          >
            Add
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8"
            onMouseDown={keepSelection}
            onClick={() => setOpen(false)}
          >
            ✕
          </Button>
        </div>
      )}
    </div>
  );
}

function ImageBtn() {
  const editor = useEditor();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadAndInsert = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      const assetRef = data.image?.asset?._ref as string | undefined;
      const previewUrl = (data.image?.url as string | undefined) || "";
      if (!assetRef) throw new Error("No asset returned");

      editor.send({
        type: "insert.block object",
        blockObject: {
          name: "image",
          value: {
            assetRef,
            alt: file.name.replace(/\.[^.]+$/, ""),
            previewUrl,
          },
        },
        placement: "auto",
      });
      editor.send({ type: "focus" });
      toast.success("Image inserted");
    } catch (error) {
      console.error("Image insert failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to insert image",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadAndInsert(file);
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={uploading}
        className={toolBtnClass(false, uploading)}
        onMouseDown={keepSelection}
        onClick={() => inputRef.current?.click()}
        title="Insert image"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}

function Toolbar() {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-shop_dark_green/10 bg-shop_light_bg/40 p-2">
      {schemaDefinition.styles.map((style) => (
        <StyleBtn key={style.name} style={style.name} />
      ))}
      <span className="mx-1 h-5 w-px bg-shop_dark_green/15" />
      {schemaDefinition.decorators.map((decorator) => (
        <DecoratorBtn
          key={decorator.name}
          name={decorator.name as "strong" | "em"}
        />
      ))}
      <LinkBtn />
      <span className="mx-1 h-5 w-px bg-shop_dark_green/15" />
      {schemaDefinition.lists.map((list) => (
        <ListBtn key={list.name} listItem={list.name} />
      ))}
      <ImageBtn />
    </div>
  );
}

/** Map Sanity image blocks into editor-friendly fields for reload. */
export function hydratePortableTextForEditor(
  blocks: PortableTextBlock[] | undefined | null,
): PortableTextBlock[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    const b = block as Record<string, unknown>;
    if (b._type !== "image") return block;

    const assetRef =
      (typeof b.assetRef === "string" && b.assetRef) ||
      (b.asset &&
      typeof b.asset === "object" &&
      b.asset !== null &&
      typeof (b.asset as { _ref?: string })._ref === "string"
        ? (b.asset as { _ref: string })._ref
        : "");

    let previewUrl =
      typeof b.previewUrl === "string" ? b.previewUrl : "";
    if (!previewUrl && assetRef) {
      try {
        previewUrl = urlFor({
          asset: { _ref: assetRef, _type: "reference" },
        } as Parameters<typeof urlFor>[0])
          .width(640)
          .url();
      } catch {
        previewUrl = "";
      }
    }

    return {
      _type: "image",
      _key: (b._key as string) || keyGenerator(),
      alt: typeof b.alt === "string" ? b.alt : "",
      assetRef,
      previewUrl,
    } as PortableTextBlock;
  });
}
export function normalizePortableText(
  blocks: PortableTextBlock[] | undefined | null,
): PortableTextBlock[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block) => {
    const b = { ...block } as Record<string, unknown>;
    if (!b._key) b._key = keyGenerator();
    if (!b._type) b._type = "block";

    if (b._type === "image") {
      const assetRef =
        (typeof b.assetRef === "string" && b.assetRef) ||
        (b.asset &&
        typeof b.asset === "object" &&
        b.asset !== null &&
        typeof (b.asset as { _ref?: string })._ref === "string"
          ? (b.asset as { _ref: string })._ref
          : "");

      const next: Record<string, unknown> = {
        _type: "image",
        _key: b._key,
        alt: typeof b.alt === "string" ? b.alt : "",
      };

      if (assetRef) {
        next.asset = {
          _type: "reference",
          _ref: assetRef,
        };
      }

      return next as PortableTextBlock;
    }

    if (Array.isArray(b.children)) {
      b.children = (b.children as Array<Record<string, unknown>>).map(
        (child) => {
          const c = { ...child };
          if (!c._key) c._key = keyGenerator();
          if (!c._type) c._type = "span";
          return c;
        },
      );
    }

    if (!Array.isArray(b.markDefs)) {
      b.markDefs = [];
    } else {
      b.markDefs = (b.markDefs as Array<Record<string, unknown>>).map((def) => {
        const d = { ...def };
        if (!d._key) d._key = keyGenerator();
        return d;
      });
    }

    return b as PortableTextBlock;
  });
}

type BlogBodyEditorProps = {
  editorKey: string;
  initialValue?: PortableTextBlock[];
  onChange: (value: PortableTextBlock[]) => void;
};

export default function BlogBodyEditor({
  editorKey,
  initialValue,
  onChange,
}: BlogBodyEditorProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-shop_dark_green/15 bg-white">
      <EditorProvider
        key={editorKey}
        initialConfig={{
          schemaDefinition,
          initialValue: initialValue?.length ? initialValue : undefined,
        }}
      >
        <EventListenerPlugin
          on={(event) => {
            if (event.type === "mutation") {
              onChange((event.value as PortableTextBlock[]) || []);
            }
          }}
        />
        <Toolbar />
        <PortableTextEditable
          className="min-h-[280px] max-h-[480px] overflow-y-auto px-4 py-3 outline-none focus:outline-none"
          renderStyle={renderStyle}
          renderDecorator={renderDecorator}
          renderAnnotation={renderAnnotation}
          renderBlock={renderBlock}
          renderListItem={renderListItem}
        />
      </EditorProvider>
    </div>
  );
}

export type { PortableTextBlock };
