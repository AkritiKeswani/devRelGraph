import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { nodeLabel, nodeDescription, existingKeywords, newKeyword, allGraphKeywords } =
    await req.json();

  if (!nodeLabel || !newKeyword) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const contextualKeywords = allGraphKeywords?.length
    ? `\nExisting keywords already in this graph: ${allGraphKeywords.join(", ")}`
    : "";

  const prompt = `You are helping build a knowledge graph. A node called "${nodeLabel}"${
    nodeDescription ? ` (${nodeDescription})` : ""
  } just received the keyword "${newKeyword}".${
    existingKeywords?.length
      ? ` It already has these keywords: ${existingKeywords.join(", ")}.`
      : ""
  }${contextualKeywords}

Find the 8 to 12 most semantically related keywords or concepts that are contextually close to "${newKeyword}" for a node like "${nodeLabel}". These should be short tags (1-3 words each) that could meaningfully connect this node to other entities in a knowledge graph — think industry categories, funding stages, founders, regions, technical domains, communities, themes.

Prioritize keywords that are likely shared across multiple real-world entities, not just unique to "${nodeLabel}".

Return ONLY a valid JSON array of strings. No explanation, no markdown, just the array.
Example: ["Series A","B2B","SaaS","enterprise","APIs"]`;

  const response = await client.messages.create({
    model: "claude-opus-4-7",
    max_tokens: 512,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as Anthropic.TextBlock).text)
    .join("");

  let suggestions: string[] = [];
  try {
    const match = text.match(/\[.*\]/s);
    if (match) suggestions = JSON.parse(match[0]);
  } catch {
    suggestions = [];
  }

  // Filter out keywords already on the node
  const existing = new Set([
    ...(existingKeywords ?? []).map((k: string) => k.toLowerCase()),
    newKeyword.toLowerCase(),
  ]);
  suggestions = suggestions.filter((s) => !existing.has(s.toLowerCase()));

  return NextResponse.json({ suggestions });
}
