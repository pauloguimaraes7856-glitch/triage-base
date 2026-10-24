import { client, MODEL } from "./llm";
import { SYSTEM_PROMPT } from "./prompt";
import { TriageSchema, type TriageResult } from "./schema";

export async function triageTicket(ticket: string) {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `<ticket>\n${ticket}\n</ticket>` },
    ],
  });

  const text = (completion.choices[0]?.message.content ?? "")
    .replace(/```json|```/g, "")
    .trim();

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("The model did not return valid JSON.");
  }

  const parsed = TriageSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("The model response does not match the triage schema.");
  }

  const triage: TriageResult = parsed.data;
  const usage = {
    input: completion.usage?.prompt_tokens ?? 0,
    output: completion.usage?.completion_tokens ?? 0,
    total: completion.usage?.total_tokens ?? 0,
  };

  return { triage, usage };
}
