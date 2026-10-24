import { triageTicket } from "../../../lib/triage";
import { PROMPT_VERSION } from "../../../lib/prompt";

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
    !("ticket" in body) ||
    typeof body.ticket !== "string" ||
    !body.ticket.trim()
  ) {
    return Response.json(
      { error: "Please provide a non-empty ticket string." },
      { status: 400 },
    );
  }

  if (body.ticket.length > 5000) {
    return Response.json(
      { error: "The ticket is too long (max 5000 characters)." },
      { status: 400 },
    );
  }

  try {
    const result = await triageTicket(body.ticket);
    return Response.json({ version: PROMPT_VERSION, ...result });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to classify this ticket.",
      },
      { status: 502 },
    );
  }
}
