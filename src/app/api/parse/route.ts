import { NextRequest, NextResponse } from "next/server";
import { parseExpenseFromImage, parseExpenseFromText } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const image = formData.get("image") as File | null;
      const text = formData.get("text") as string | null;

      if (image) {
        const arrayBuffer = await image.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const result = await parseExpenseFromImage(base64, image.type);
        return NextResponse.json(result);
      }

      if (text) {
        const result = await parseExpenseFromText(text);
        return NextResponse.json(result);
      }
    } else {
      const body = await req.json();
      const { type, content, mediaType } = body;

      if (type === "image") {
        const result = await parseExpenseFromImage(content, mediaType);
        return NextResponse.json(result);
      }

      if (type === "text") {
        const result = await parseExpenseFromText(content);
        return NextResponse.json(result);
      }
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    console.error("Parse error:", err);
    const message = err instanceof Error ? err.message : "Parsing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
