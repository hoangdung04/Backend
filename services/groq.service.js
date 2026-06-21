// ===================================================
// Groq AI Service – Gọi Groq Cloud API (Llama-3.1-8b-instant)
// ===================================================
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.1-8b-instant";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Gửi prompt tới Groq và nhận câu trả lời
 * @param {string} prompt - Nội dung prompt đầy đủ
 * @returns {Promise<string>} - Câu trả lời từ Llama 3.1
 */
export const askGroq = async (prompt) => {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY chưa được cấu hình trong file .env");
  }

  const requestBody = {
    model: GROQ_MODEL,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  };

  const maxRetries = 3;
  let delay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Groq API Error (Lần thử ${attempt}/${maxRetries}):`, errorData);

        if (response.status === 503 || response.status === 500) {
          if (attempt < maxRetries) {
            console.log(`Đang thử lại cuộc gọi Groq sau ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
            continue;
          }
        }
        const err = new Error(`Groq API lỗi: ${response.status} ${response.statusText}`);
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      const answer = data?.choices?.[0]?.message?.content;
      if (!answer) {
        throw new Error("Groq không trả về nội dung hợp lệ.");
      }

      return answer.trim();
    } catch (error) {
      if (attempt === maxRetries || error.status === 429 || error.status === 400) {
        throw error;
      }
      console.warn(`Lỗi khi gọi Groq (Lần thử ${attempt}/${maxRetries}):`, error.message);
      console.log(`Đang thử lại cuộc gọi Groq sau ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};
