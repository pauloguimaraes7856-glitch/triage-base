import { client, MODEL } from "../../../lib/llm";

type Message = {
  role: "user" | "assistant";
  text: string;
};

function isMessage(value: unknown): value is Message {
  return (
    typeof value === "object" &&
    value !== null &&
    "role" in value &&
    "text" in value &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.text === "string" &&
    value.text.trim() !== ""
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("messages" in body) ||
    !Array.isArray(body.messages) ||
    body.messages.length === 0 ||
    !body.messages.every(isMessage)
  ) {
    return Response.json(
      { error: "Please provide a non-empty list of messages." },
      { status: 400 },
    );
  }

  const messages: Message[] = body.messages;

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a helpful support assistant." },
        ...messages.map((m) =>
          m.role === "user"
            ? { role: "user" as const, content: m.text }
            : { role: "assistant" as const, content: m.text },
        ),
      ],
    });

    return Response.json({
      answer: completion.choices[0]?.message.content ?? "",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "The assistant is unavailable. Please try again." },
      { status: 502 },
    );
  }
}
