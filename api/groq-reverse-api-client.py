import os

from openai import OpenAI

# change the base_url to your own
client = OpenAI(base_url="https://groqapi.tpz.workers.dev/openai/v1",
                api_key=os.environ["GROQ_API_KEY"])

response = client.chat.completions.create(
    model="llama3-8b-8192",
    messages=[{
        "role": "system",
        "content": "You are a helpful assistant."
    }, {
        "role": "user",
        "content": "Who won the world series in 2020?"
    }, {
        "role":
        "assistant",
        "content":
        "The Los Angeles Dodgers won the World Series in 2020."
    }, {
        "role": "user",
        "content": "鲁迅为什么打周树人？"
    }])

print(response.choices[0].message.content)
