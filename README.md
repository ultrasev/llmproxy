
一个基于 [cloudflare worker](https://workers.cloudflare.com/) 的 LLM API 反向代理，支持 OpenAI, Gemini, Groq 等平台，接口兼容 OpenAI API 规范，可以直接使用 OpenAI SDK 调用。

<img src="https://s3.bmp.ovh/imgs/2024/04/29/055ddd90de65037e.png" width="50%">

# Quick start
Demo API: `https://llmapi.ultrasev.com`

[Groq API](https://console.groq.com/docs/quickstart) 使用示例：
```python
from openai import OpenAI

api_key = "YOUR_GROQ_API_KEY"
model = "llama3-8b-8192"
supplier = "groq"

BASE_URL = "https://llmapi.ultrasev.com"

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


# 部署自己的 Worker
创建一个新的 cloudflare worker，然后把 [api/llm_api_proxy.js](https://raw.githubusercontent.com/ultrasev/llmproxy/proxy/api/llm_api_proxy.js) 中的代码粘贴进去，然后部署就可以了。

<img src="https://s3.bmp.ovh/imgs/2024/04/29/e64e6a2787183c26.png" width="66%">

## Notes
- `workers.dev` 域名在国内无法直接访问，如果需要在国内直接使用，需要自己配置域名。
- 代码中对 Groq 的代理通过 [vercel.com](https://www.vercel.com) + FastAPI 又套了一层，仅做请求中转，不会保存任何数据，介意的话可以自己部署。
