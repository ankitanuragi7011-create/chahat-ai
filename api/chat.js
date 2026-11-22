
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: message.trim().slice(0, 4000),
          max_output_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, data);

      return res.status(502).json({
        error: data.error?.message ||
          "OpenAI API request failed",
        status: response.status
      });
    }

    return res.status(200).json({
      reply: data.output_text || "AI से जवाब नहीं मिला।"
    });

  } catch (error) {
    console.error("Chat API error:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
};



