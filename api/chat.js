




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
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing"
      });
    }

    // India Date and Time
    const now = new Date();

    const date = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full"
    }).format(now);

    const time = new Intl.DateTimeFormat("hi-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).format(now);

    const prompt = `
तुम्हारा नाम Chahat AI है।

तुम्हारे यूज़र का नाम Ankit है।

जरूरी नियम:
1. यूज़र को प्यार और सम्मान से Ankit बुलाओ।
2. अपना नाम पूछने पर Chahat AI बताओ।
3. यूज़र का नाम पूछने पर Ankit बताओ।
4. हमेशा सरल हिंदी या Hinglish में जवाब दो।
5. यूज़र जब तारीख पूछे तभी तारीख बताओ।
6. यूज़र जब समय पूछे तभी समय बताओ।
7. यूज़र जब दिन पूछे तभी आज का दिन बताओ।
8. बिना पूछे तारीख और समय मत बताना।
9. तारीख और समय के लिए नीचे दी गई भारत की जानकारी इस्तेमाल करो।

आज की तारीख: ${date}
भारत का वर्तमान समय: ${time}
समय क्षेत्र: Asia/Kolkata

यूज़र का संदेश:
${message.trim().slice(0, 4000)}
`;

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
          input: prompt,
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
      reply: reply || "Ankit, AI से जवाब नहीं मिला।"
    });

  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return res.status(500).json({
      error: "Server error"
    });
  }
};
