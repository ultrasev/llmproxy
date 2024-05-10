/*Here is a revised version of the Cloudflare Workers script
for llm proxying, which includes:
- support for specific API routes (e.g., /openai, /groq, /gemini)
     without needing to parse the supplier from headers
- caching of responses based on the request body
*/
import { sha256 } from './utils';
import { Env } from './types';
import {
    OpenaiInference, GeminiInferece, GroqInference,
    Inference, Supplier, parseSupplier
} from "./models";


async function cached(
    req: Request,
    env: Env,
    ctx: ExecutionContext,
    infer: Inference
): Promise<Response> {

    const body = await req.clone().text();
    const hash = await sha256(body);
    const cacheUrl = new URL(req.url);
    const supplier: Supplier = parseSupplier(req.headers);
    cacheUrl.pathname = `/post${cacheUrl.pathname}/${supplier}/${hash}`;
    console.log(cacheUrl.toString());
    const cacheKey = new Request(cacheUrl.toString(), {
        method: "GET",
    });

    const cache = caches.default;
    let response: Response | undefined = await cache.match(cacheKey);
    console.log('response header', response?.headers);
    if (!response) {
        response = await infer.handle(req, env, ctx);
        const clonedResponse = response.clone();
        const newHeaders = new Headers({
            'content-type': 'application/json',
            'cache-control': 'max-age=300',
        });
        const cachedResponse = new Response(clonedResponse.body, {
            status: clonedResponse.status,
            statusText: clonedResponse.statusText,
            headers: newHeaders,
        });
        ctx.waitUntil(cache.put(cacheKey, cachedResponse.clone()));
        return response;
    } else {
        console.log("Cache hit", response);
        return response.clone();
    }
}

export async function fetch(req: Request,
    env: Env,
    ctx: ExecutionContext): Promise<Response> {
    const pathname = new URL(req.url).pathname;
    const supplier = pathname.split("/")[2];
    switch (supplier) {
        case "openai":
            return cached(req, env, ctx, new OpenaiInference());
        case "groq":
            return cached(req, env, ctx, new GroqInference());
        case "gemini":
            return cached(req, env, ctx, new GeminiInferece());
        default:
            return new Response("supported suppliers: openai, groq, gemini.", { status: 404 });
    }
}