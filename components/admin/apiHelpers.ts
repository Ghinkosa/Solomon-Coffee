// Safe API helper for admin components
export const safeApiCall = async (url: string, options?: RequestInit) => {
  try {
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        ...options?.headers,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });

    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        throw new Error(
          response.ok
            ? `Server returned a non-JSON response (${response.status}). Check that the API route exists and the app was restarted.`
            : `Request failed (${response.status}). ${raw.slice(0, 160).replace(/\s+/g, " ")}`,
        );
      }
    }

    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as { error: unknown }).error === "string"
          ? (data as { error: string }).error
          : `API call failed: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data as Record<string, any>;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `JSON parse error: ${error.message}. This usually means the server returned HTML instead of JSON.`,
      );
    }
    throw error;
  }
};

export const handleApiError = (error: unknown, context: string) => {
  console.error(`${context}:`, error);

  if (error instanceof Error) {
    if (error.message.includes("JSON parse error")) {
      console.error(
        "The server likely returned an HTML error page instead of JSON. Check server logs and API endpoint."
      );
    } else if (error.message.includes("API call failed")) {
      console.error(
        "API request failed. Check network connection and server status."
      );
    }
  }
};
