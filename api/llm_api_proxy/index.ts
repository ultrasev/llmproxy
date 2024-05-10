import { fetch as fetchV1 } from "./v1";
import { fetch as fetchV2 } from "./v2";
import { Env } from "./types";

export default {
	async fetch(
		req: Request,
		env: Env,
		ctx: ExecutionContext): Promise<Response> {
		const version = new URL(req.url).pathname.split("/")[1];
		switch (version) {
			case "v2":
				return await fetchV2(req, env, ctx);
			default:
				return await fetchV1(req, env, ctx);
		}
	}
}