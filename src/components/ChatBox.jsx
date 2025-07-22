import React, { useState } from "react";

function ChatApp() {
  const [apiKey, setApiKey] = useState("");
  const [userInput, setUserInput] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!apiKey || !userInput) return alert("Please enter API Key and message!");
    setLoading(true);
    setChatResponse("");

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "AI Chat App",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [
            {
              role: "user",
              content: userInput,
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "No response";
      setChatResponse(content);
    } catch (err) {
      console.error(err);
      setChatResponse("Error fetching response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center text-purple-700">🤖 AI Chat with DeepSeek</h1>

        <input
          type="text"
          placeholder="🔑 Enter OpenRouter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <textarea
          rows="4"
          placeholder="💬 Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></textarea>

        <button
          onClick={handleSend}
          disabled={loading}
          className="mt-4 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all"
        >
          {loading ? "Thinking..." : "Send"}
        </button>

        {chatResponse && (
          <div className="mt-6 p-4 bg-gray-100 border-l-4 border-purple-500 rounded-md">
            <p className="font-semibold text-gray-700">🧠 AI:</p>
            <p className="mt-2 text-gray-800 whitespace-pre-wrap">{chatResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatApp;
