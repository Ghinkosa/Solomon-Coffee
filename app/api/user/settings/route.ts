import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from "@/actions/subscriptionActions";
import {
  isSettingsPatchKey,
  type NotificationChannelPreference,
  type SettingsPatchKey,
} from "@/lib/userPreferences";
import {
  getUserPreferencesByClerkId,
  updateUserNotificationPreferences,
} from "@/lib/userPreferences.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await getUserPreferencesByClerkId(userId);
    if (!record) {
      return NextResponse.json(
        { error: "Store profile not found. Complete account setup first." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      preferences: record.preferences,
    });
  } catch (error) {
    console.error("Error loading user settings:", error);
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const patch: Partial<NotificationChannelPreference> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!isSettingsPatchKey(key)) {
        return NextResponse.json(
          { error: `Unsupported setting: ${key}` },
          { status: 400 },
        );
      }
      if (typeof value !== "boolean") {
        return NextResponse.json(
          { error: `Setting ${key} must be a boolean` },
          { status: 400 },
        );
      }
      patch[key as SettingsPatchKey] = value;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided" },
        { status: 400 },
      );
    }

    let result: Awaited<ReturnType<typeof updateUserNotificationPreferences>>;
    try {
      result = await updateUserNotificationPreferences(userId, patch);
    } catch (error) {
      if (error instanceof Error && error.message === "USER_NOT_FOUND") {
        return NextResponse.json(
          { error: "Store profile not found. Complete account setup first." },
          { status: 404 },
        );
      }
      throw error;
    }

    // Keep marketing list in sync when marketing preference changes
    if (result.marketingChanged && result.email) {
      try {
        if (result.preferences.marketingEmails) {
          const sub = await subscribeToNewsletter({
            email: result.email,
            source: "user_settings",
          });
          if (sub.success && !sub.alreadySubscribed) {
            const { sendNewsletterWelcomeEmail } = await import(
              "@/lib/emails/newsletterEmails"
            );
            await sendNewsletterWelcomeEmail(result.email);
          }
        } else {
          await unsubscribeFromNewsletter(result.email);
          const { sendNewsletterUnsubscribedEmail } = await import(
            "@/lib/emails/newsletterEmails"
          );
          await sendNewsletterUnsubscribedEmail(result.email);
        }
      } catch (emailError) {
        console.error("Marketing preference email sync failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      preferences: result.preferences,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
