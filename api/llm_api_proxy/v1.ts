import { Env } from "./types";
import {
    OpenaiInference, GeminiInferece, GroqInference,
    Inference, Supplier, parseSupplier
} from "./models";

export async function fetch(req: Request,
    env: Env,
    ctx: ExecutionContext): Promise<Response> {
    const llms: Inference[] = [
        new OpenaiInference(),
        new GroqInference(),
        new GeminiInferece(),
    ];
    const supplier: Supplier = parseSupplier(req.headers);
    const llm: Inference | undefined = llms.find((llm) => llm.supplier === supplier);
    console.log({ "supplier": supplier, "llm": llm });

    if (llm) {
        return llm.handle(req, env, ctx);
    } else {
        return new Response("supplier not found", { status: 404 });
    }
}
