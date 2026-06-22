import Anthropic from "@anthropic-ai/sdk";
import { ParsedExpense, Category, Person, CATEGORIES, PERSONS } from "@/types";
import { format } from "date-fns";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const today = () => format(new Date(), "yyyy-MM-dd");

const SYSTEM_PROMPT = `You are an expense extraction AI for a UAE family financial tracker.
Extract expense data from receipts, SMS messages, bank notifications, or manual text input.

Today's date: ${today()}
Default currency: AED
Family members: Faisal, Wife, Child, Shared

Categories (use exact values):
- HOUSING (rent, utilities, DEWA, internet, maintenance)
- TRANSPORTATION (fuel, Salik, parking, Careem, Uber, taxis, car service)
- FOOD_DINING (restaurants, cafes, Starbucks, McDonald's, groceries, Carrefour, LuLu, Talabat, Noon Food)
- FAMILY (school fees, kids activities, childcare, children's clothing)
- HEALTH (medical, pharmacy, insurance, gym, dentist)
- ENTERTAINMENT (movies, VOX, gaming, streaming, Netflix, Spotify)
- TRAVEL (flights, hotels, visa fees, Airbnb)
- TECHNOLOGY (gadgets, software, ChatGPT, Claude, subscriptions, Apple, Amazon)
- INVESTMENTS (stocks, crypto, gold, savings transfers)
- MISCELLANEOUS (anything else)

Person attribution:
- FAISAL: default if no context
- WIFE: if mentions wife, spouse, or female context
- CHILD: if mentions school, kids, children, toys
- SHARED: if mentions family, household, groceries, utilities
- NEEDS_ATTRIBUTION: if completely unclear

Return ONLY valid JSON, no markdown, no explanation:
{
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "amount": number,
  "currency": "AED",
  "category": "CATEGORY_VALUE",
  "person": "PERSON_VALUE",
  "description": "brief description or null",
  "items": [{"name": "item", "amount": 0.00}] or [],
  "confidence": 0.0-1.0
}`;

function parseClaudeResponse(text: string): ParsedExpense {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const data = JSON.parse(cleaned);

  const category = CATEGORIES.includes(data.category as Category)
    ? (data.category as Category)
    : "MISCELLANEOUS";

  const person = PERSONS.includes(data.person as Person)
    ? (data.person as Person)
    : "NEEDS_ATTRIBUTION";

  return {
    merchant: String(data.merchant || "Unknown"),
    date: String(data.date || today()),
    amount: Number(data.amount || 0),
    currency: String(data.currency || "AED").toUpperCase(),
    category,
    person,
    description: data.description || undefined,
    items: Array.isArray(data.items) ? data.items : [],
    confidence: Math.min(1, Math.max(0, Number(data.confidence || 0.7))),
  };
}

export async function parseExpenseFromImage(
  base64: string,
  mediaType: string = "image/jpeg"
): Promise<ParsedExpense> {
  const validMediaType = (
    ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mediaType)
      ? mediaType
      : "image/jpeg"
  ) as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT.replace("${today()}", today()),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: validMediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract all expense information from this receipt or invoice. Return JSON only.",
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return parseClaudeResponse(text);
}

export async function parseExpenseFromText(text: string): Promise<ParsedExpense> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 512,
    system: SYSTEM_PROMPT.replace("${today()}", today()),
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
  });

  const responseText =
    response.content[0].type === "text" ? response.content[0].text : "";
  return parseClaudeResponse(responseText);
}

export async function generateInsights(spendingData: {
  currentMonth: { category: string; amount: number }[];
  lastMonth: { category: string; amount: number }[];
  threeMonthAvg: { category: string; amount: number }[];
  totalCurrent: number;
  totalLast: number;
  recurringMerchants: { merchant: string; amount: number; count: number }[];
}): Promise<{
  score: number;
  healthLabel: string;
  insights: string[];
  alerts: string[];
  suggestions: string[];
}> {
  const prompt = `Analyze this UAE family's spending data and provide financial insights.

Current month spending by category (AED):
${spendingData.currentMonth.map((c) => `- ${c.category}: ${c.amount.toFixed(0)}`).join("\n")}
Total: ${spendingData.totalCurrent.toFixed(0)} AED

Last month total: ${spendingData.totalLast.toFixed(0)} AED

Recurring merchants detected:
${spendingData.recurringMerchants.map((r) => `- ${r.merchant}: ~${r.amount.toFixed(0)} AED`).join("\n")}

Return ONLY valid JSON:
{
  "score": 0-100,
  "healthLabel": "Excellent|Good|Fair|Needs Attention|Critical",
  "insights": ["insight1", "insight2", "insight3"],
  "alerts": ["alert1", "alert2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]
}`;

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}
