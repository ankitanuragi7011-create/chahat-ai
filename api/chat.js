



module.exports = async (req, res) => {
  console.log("CHAT API STARTED");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const message = req.body?.message;

    console.log("MESSAGE RECEIVED:", typeof message);

    if (typeof message !== "string" || !message.trim()) {
      console.error("MESSAGE MISSING");

      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    console.log("GEMINI KEY PRESENT:", Boolean(apiKey));

    if (!apiKey) {
      console.error("GEMINI_API_KEY IS MISSING");

      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    console.log("SENDING REQUEST TO GEMINI");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/interactions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          model: "gemini-3.5-flash-lite",
          input:
            "तुम्हारा नाम Chahat AI है। हमेशा सरल हिंदी या Hinglish में जवाब देना। यूज़र का संदेश: " +
            message.trim().slice(0, 4000),
          generation_config: {
            max_output_tokens: 500,
            thinking_level: "low"
          }
        })
      }
    );

    console.log("GEMINI STATUS:", response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI API ERROR:", response.status, data);

      return res.status(502).json({
        error: data.error?.message || "Gemini API request failed",
        status: response.status
      });
    }

    const reply = (data.steps || [])
      .filter(step => step.type === "model_output")
      .flatMap(step => step.content || [])
      .filter(item => item.type === "text")
      .map(item => item.text || "")
      .join("");

    return res.status(200).json({
      reply: reply || "AI से जवाब नहीं मिला।"
    });

  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
};
