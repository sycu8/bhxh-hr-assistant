import { ApiError } from "@/lib/api/errors";

type OpenAiImageResponse = {
  data?: Array<{ url?: string; revised_prompt?: string }>;
  error?: { message?: string };
};

export async function openAiGenerateImageUrl(
  apiKey: string,
  prompt: string,
): Promise<{ url: string; revisedPrompt?: string }> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: prompt.slice(0, 3500),
      n: 1,
      size: "1024x1024",
      quality: "standard",
    }),
  });
  const json = (await res.json()) as OpenAiImageResponse;
  if (!res.ok) {
    throw ApiError.serviceUnavailable(
      json.error?.message ?? `OpenAI images API lỗi (${res.status}).`,
    );
  }
  const url = json.data?.[0]?.url;
  if (!url) {
    throw ApiError.internal("OpenAI không trả về URL ảnh.");
  }
  return { url, revisedPrompt: json.data?.[0]?.revised_prompt };
}
