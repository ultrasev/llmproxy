export interface Env { }

export default {
	async fetch(request: Request,
		env: Env,
		ctx: ExecutionContext): Promise<Response> {
		return handleRequest(request);
	},
};

enum Supplier {
	OPENAI = "openai",
	GROQ = "groq",
	GEMINI = "gemini",
}

function parseSupplier(headers: Headers): Supplier {
	const s: string | null = headers.get("supplier")
	switch (s) {
		case "openai":
			return Supplier.OPENAI;
		case "groq":
			return Supplier.GROQ;
		case "gemini":
			return Supplier.GEMINI;
		default:
			return Supplier.OPENAI;
	}
}


function parseKey(headers: Headers): string {
	// parse api key
	const auth: string | null = headers.get("authorization");
	if (auth === null) {
		return "";
	} else if (auth.includes("Bearer")) {
		return auth.split(" ")[1];
	}
	return "";
}

interface Inference {
	supplier: Supplier;
	endpoint: string;
	async handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}

class OpenaiInference implements Inference {
	supplier: Supplier = Supplier.OPENAI;
	endpoint: string = "https://api.openai.com/v1/chat/completions";

	async handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await fetch(this.endpoint, {
			headers: req.headers,
			method: req.method,
			body: req.body,
			redirect: 'follow',
		});
	}
}

class GroqInference implements Inference {
	supplier: Supplier = Supplier.GROQ;
	endpoint: string = "https://vercel.ddot.cc/groq/v1";

	async handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let body = await req.json();
		body['api_key'] = parseKey(req.headers);
		return await fetch(this.endpoint, {
			headers: req.headers,
			method: 'POST',
			redirect: 'follow',
			body: JSON.stringify(body),
		});
	}
}


// ---------------------- Gemini Inferences
interface Message {
	role: string;
	content: string;
}

interface Part {
	text?: string;
	content?: string;
}

interface Content {
	role: string;
	parts: Part[];
}

function reformatInput(messages: Message[]): Content[] {
	return messages.map(message => ({
		role: message.role === "user" ? "user" : "model",
		parts: [{ text: message.content }]
	}));
}



class GeminiInferece implements Inference {
	supplier: Supplier = Supplier.GEMINI;
	endpoint: string = "https://generativelanguage.googleapis.com/v1beta/models";


	async prepareData(msgs: Message[]): Promise<any> {
		let x = reformatInput(msgs);
		if (x.length > 0 && x[0].role !== "user") {
			x.shift();
		}
		return { "contents": x };
	}

	async handle(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const jso = await req.json();
		const model = jso.model || "gemini-1.5-pro-latest";
		const key: string = parseKey(req.headers);
		const url = `${this.endpoint}/${model}:generateContent?key=${key}`;
		const inputData = await this.prepareData(jso.messages);
		console.log(inputData);
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(inputData),
		});

		const responseJson = await response.json();
		console.log(responseJson);
		const _response = {
			choices: [
				{
					message: {
						content: responseJson.candidates[0].content.parts[0].text,
						role: "model"
					}
				}
			]
		}

		return new Response(JSON.stringify(_response), {
			headers: {
				"Content-Type": "application/json",
			},
		});
	}
}


async function handleRequest(request: Request) {
	const llms: Inference[] = [
		new OpenaiInference(),
		new GroqInference(),
		new GeminiInferece(),
	];
	const supplier: Supplier = parseSupplier(request.headers);
	const llm: Inference | undefined = llms.find((llm) => llm.supplier === supplier);
	console.log({ "supplier": supplier, "llm": llm });


	if (llm) {
		return llm.handle(request, {}, {});
	}
	return new Response("Not Found", { status: 404 });
}
