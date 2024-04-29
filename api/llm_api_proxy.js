var src_default = {
    async fetch(request, env, ctx) {
        return handleRequest(request);
    }
};

function parseSupplier(headers) {
    const s = headers.get("supplier");
    switch (s) {
        case "openai":
            return "openai" /* OPENAI */;
        case "groq":
            return "groq" /* GROQ */;
        case "gemini":
            return "gemini" /* GEMINI */;
        default:
            return "openai" /* OPENAI */;
    }
}
function parseKey(headers) {
    const auth = headers.get("authorization");
    if (auth === void 0) {
        return "";
    } else if (auth.includes("Bearer")) {
        return auth.split(" ")[1];
    }
    return "";
}
var OpenaiInference = class {
    supplier = "openai" /* OPENAI */;
    endpoint = "https://api.openai.com/v1/chat/completions";
    async handle(req, env, ctx) {
        return await fetch(this.endpoint, {
            headers: req.headers,
            method: req.method,
            body: req.body,
            redirect: "follow"
        });
    }
};
var GroqInference = class {
    supplier = "groq" /* GROQ */;
    endpoint = "https://vercel.ddot.cc/groq/v1";
    async handle(req, env, ctx) {
        let body = await req.json();
        body["api_key"] = parseKey(req.headers);
        return await fetch(this.endpoint, {
            headers: req.headers,
            method: "POST",
            redirect: "follow",
            body: JSON.stringify(body)
        });
    }
};
function reformatInput(messages) {
    return messages.map((message) => ({
        role: message.role === "user" ? "user" : "model",
        parts: [{ text: message.content }]
    }));
}
var GeminiInferece = class {
    supplier = "gemini" /* GEMINI */;
    endpoint = "https://generativelanguage.googleapis.com/v1beta/models";
    async prepareData(msgs) {
        let x = reformatInput(msgs);
        if (x.length > 0 && x[0].role !== "user") {
            x.shift();
        }
        return { "contents": x };
    }
    async handle(req, env, ctx) {
        const jso = await req.json();
        const model = jso.model || "gemini-1.5-pro-latest";
        const key = parseKey(req.headers);
        const url = `${this.endpoint}/${model}:generateContent?key=${key}`;
        const inputData = await this.prepareData(jso.messages);
        console.log(inputData);
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(inputData)
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
        };
        return new Response(JSON.stringify(_response), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
};
async function handleRequest(request) {
    const llms = [
        new OpenaiInference(),
        new GroqInference(),
        new GeminiInferece()
    ];
    const supplier = parseSupplier(request.headers);
    const llm = llms.find((llm2) => llm2.supplier === supplier);
    console.log({ "supplier": supplier, "llm": llm });
    if (llm) {
        return llm.handle(request, {}, {});
    }
    return new Response("Not Found", { status: 404 });
}
export {
    src_default as default
};
