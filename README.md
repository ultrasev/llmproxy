一个基于 [cloudflare worker](https://workers.cloudflare.com/) 的 LLM API 反向代理，支持 OpenAI, Gemini, Groq 等平台。接口兼容 OpenAI API 规范，可以直接使用 OpenAI SDK 调用。

<img src="https://s3.bmp.ovh/imgs/2024/04/29/055ddd90de65037e.png" width="789">

# Quick start

Demo API: `https://llmapi.ultrasev.com`

## 通过 `supplier` 指定平台

[Groq API](https://console.groq.com/docs/quickstart) 使用示例：

```python
from openai import OpenAI

api_key = "YOUR_GROQ_API_KEY"
model = "llama3-8b-8192"
supplier = "groq"

BASE_URL = "https://llmapi.ultrasev.com/v1"
# 或者 BASE_URL = "https://llmapi.ultrasev.com/". 如果不指定版本号，则默认使用 v1 版本，v1 版本通过 headers 中的 supplier 区分平台。

client = OpenAI(base_url=BASE_URL, api_key=api_key)
response = client.chat.completions.create(
    model=model,
    messages=[
        {"role": "system", "content": "You are a helpful assistant。"},
        {"role": "user", "content": "what is the meaning of life?"}
    ],
    extra_headers={"supplier": supplier},
)
print(response.choices[0].message.content)
```

OpenAI, Gemini 等平台的使用方法与 Groq 类似，只需要修改平台 `supplier` 即可。

```python
supplier_list = ["openai", "gemini", "groq"]
```

## 通过路由参数指定平台

可以通过 `/v2/openai`, `/v2/gemini`, `/v2/groq` 等路由参数指定平台，不需要在 `headers` 中指定 `supplier`。可结合 `chatbox`、[`沉浸式翻译`](https://immersivetranslate.com/en/) 等插件使用。

```python
from openai import OpenAI
api_key = "YOUR_GEMINI_API_KEY"
model = "gemini-1.5-flash"

BASE_URL = "https://llmapi.ultrasev.com/v2/gemini"

client = OpenAI(base_url=BASE_URL, api_key=api_key)
response = client.chat.completions.create(
    model=model,
    messages=[
        {"role": "system", "content": "You are a helpful assistant。"},
        {"role": "user", "content": "what is the meaning of life?"}
    ],
    temperature=0.7,
    top_p=1,
    max_tokens=1024,
    top_logprobs=32 # topK
)
print(response.choices[0].message.content)
```

# 部署自己的 Worker

创建一个新的 cloudflare worker，把 [api/llm_api_proxy.js](./api/llm_api_proxy.js) 中的代码粘贴进去，然后部署就可以。

配置自定义域名：设置 -> Triggers -> Custom Domains，把你的域名填进去，然后点击 add custom domain 即可。

<img src="https://s3.bmp.ovh/imgs/2024/04/29/e64e6a2787183c26.png" width="789">

## YouTuBe 教程

- 使用 Cloudflare Worker 搭建 LLM API 反向代理

<a href="https://www.youtube.com/watch?v=rfn3lBC11Dk">
    <img src="https://img.youtube.com/vi/rfn3lBC11Dk/0.jpg" alt="使用 Cloudflare Worker 搭建反向代理" width="320" height=200 style="border-radius: 15px;">
</a>

## Notes

- `workers.dev` 域名在国内无法直接访问，如果要在国内直接使用，需要自己配置域名。
- 代码中对 Groq 的代理通过 [vercel.com](https://www.vercel.com) + FastAPI 又套了一层，仅做请求中转，不会保存任何数据，介意的话可以自己部署。
- 暂不支持流式输出，有大佬空闲了修改完可以 pull request。

# 更新日志

请访问 [CHANGELOG](CHANGELOG.md)
