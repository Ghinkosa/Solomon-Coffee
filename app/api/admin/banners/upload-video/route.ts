import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/lib/client";
import { requireAdminUser } from "@/lib/adminAuth";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_DURATION_SECONDS = 15;
const ALLOWED = new Set(["video/mp4", "video/webm"]);

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    if (admin.error) return admin.error;

    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported video type. Use MP4 or WebM." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Video must be 8MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name || "banner-video.mp4",
      contentType: file.type,
    });

    const meta = await writeClient.fetch(
      `*[_id == $id][0]{
        size,
        mimeType,
        "duration": metadata.duration,
        url
      }`,
      { id: asset._id },
    );

    if (meta?.mimeType && !meta.mimeType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files are allowed" },
        { status: 400 },
      );
    }

    if (
      typeof meta?.duration === "number" &&
      meta.duration > MAX_DURATION_SECONDS
    ) {
      return NextResponse.json(
        {
          error: `Video must be ${MAX_DURATION_SECONDS} seconds or shorter`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      video: {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
        url: meta?.url || asset.url,
        mimeType: meta?.mimeType || file.type,
        size: meta?.size || file.size,
        duration: meta?.duration ?? null,
      },
    });
  } catch (error) {
    console.error("Banner video upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 },
    );
  }
}
