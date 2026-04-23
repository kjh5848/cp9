const key = process.env.PERPLEXITY_API_KEY;

async function testChat() {
  console.log("Key first 5 chars:", key?.substring(0, 5));
  console.log("Testing Chat Completions...");
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: "안녕하세요?" }]
    })
  });
  console.log("Chat Status:", res.status);
  console.log("Chat Response:", await res.text());
}

testChat();
