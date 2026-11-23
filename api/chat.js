





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

    const msg = message.trim().toLowerCase();

    // Name feature
    if (
      /mera naam|my name|naam kya|name kya|what is my name|who am i/.test(msg)
    ) {
      return res.status(200).json({
        reply: "Ankit ❤️ तुम्हारा नाम Ankit है।"
      });
    }

    // India date and time
    const now = new Date();

    const date = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full"
    }).format(now);

    const time = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(now);

    if (/samay|time|kitne baje|वक्त/.test(msg)) {
      return res.status(200).json({
        reply: `Ankit ❤️ अभी भारत में ${time} बजे हैं।`
      });
    }

    if (/tarikh|date|tareekh|तारीख/.test(msg)) {
      return res.status(200).json({
        reply: `Ankit ❤️ आज ${date} है।`
      });
    }

    if (/kaun sa din|aaj ka din|which day|day today/.test(msg)) {
      return res.status(200).json({
        reply: `Ankit ❤️ आज ${date} है।`
      });
    }

    // Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    const prompt = `
तुम Chahat AI हो।
यूज़र का नाम Ankit है।
उसे प्यार से Ankit बुलाओ।
सरल हिंदी या Hinglish में जवाब दो।
आज की तारीख: ${date}
भारत का समय: ${time}

यूज़र का संदेश: ${message.trim().slice(0, 4000)}
`;

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
          input: prompt,
          generation_config: {
            max_output_tokens: 500,
            thinking_level: "low"
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GEMINI API ERROR:", response.status, data);

      return res.status(200).json({
        reply: response.status === 503
          ? "Ankit ❤️ Gemini अभी व्यस्त है। थोड़ी देर बाद फिर कोशिश करना।"
          : "Ankit ❤️ अभी जवाब नहीं मिल पाया। कृपया थोड़ी देर बाद कोशिश करो।"
      });
    }

    const reply = (data.steps || [])
      .filter(step => step.type === "model_output")
      .flatMap(step => step.content || [])
      .filter(item => item.type === "text")
      .map(item => item.text || "")
      .join("");

    return res.status(200).json({
      reply: reply || "Ankit ❤️ अभी जवाब नहीं मिला।"
    });

  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
};
