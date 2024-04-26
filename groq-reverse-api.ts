export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request);
	},
};

async function handleRequest(request: Request) {
	const groq_endpoint = "https://api.groq.com/openai/v1/chat/completions";
	const url = new URL(groq_endpoint);
	console.log(url.toString());
	console.log(request.body);

	const modifiedRequest = new Request(url.toString(), {
		headers: request.headers,
		method: request.method,
		body: request.body,
		redirect: 'follow',
	});

	modifiedRequest.headers.set('CF-Ipcountry', "US");

	const response = await fetch(modifiedRequest);
	console.log(response);
	const modifiedResponse = new Response(response.body, response);

	modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');

	return modifiedResponse;
}
