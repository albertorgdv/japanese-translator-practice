I want to keep it close to the original program: export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "https://albertor.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
  
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    try {
      const { text } = req.body || {};
      if (!text) {
        return res.status(400).json({ error: "Missing text" });
      }
  
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content:
                        "You translate English to natural Japanese. Use kanji when appropriate, hiragana or katakana where appropriate, and also provide romaji.",
                },
                {
                    role: "user",
                    content: `Translate the following English text to Japanese. Provide both Japanese and romaji.\n\nEnglish:\n${text}\n\nFormat exactly like this:\nJapanese: <text>\nRomaji: <text>`,
                },
            ],
          }),
        }
      );
  
      const data = await response.json();
  
      // 🔴 THIS IS THE KEY
      if (!response.ok) {
        console.error("OpenAI error:", data);
        return res.status(500).json({
          error: data.error?.message || "OpenAI request failed",
        });
      }
  
      const output = data.choices?.[0]?.message?.content;
      if (!output) {
        return res.status(500).json({
          error: "No output returned from OpenAI",
        });
      }
  
      return res.status(200).json({ output });
    } catch (err) {
      console.error("Server error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }