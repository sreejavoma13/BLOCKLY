// GeminiChatbot.jsx
import React, { useState } from "react";
import axios from "axios";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function GeminiChatbot() {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const GEMINI_PROXY_URL = "http://localhost:5000/gemini";

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await axios.post(GEMINI_PROXY_URL, { question });

      const aiResponse =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      setAnswer(aiResponse);
    } catch (error) {
      console.error("❌ Error calling Gemini API:", error);
      setAnswer("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChatbot}
        className={`fixed bottom-6 right-6 w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-colors z-50
          ${darkMode 
            ? "bg-gray-800 text-white border border-gray-100 hover:bg-gray-700 " 
            : "bg-purple-600 text-white hover:bg-purple-700 border border-black"
          }`}
      >
        {isOpen ? "X" : "✨"}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 w-80 rounded-xl shadow-2xl p-4 flex flex-col z-50
            ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"}`}
        >
          <h2
            className={`text-lg font-bold mb-2 
              ${darkMode ? "text-blue-400" : "text-blue-600"}`}
          >
            <span className="text-lg">Hi,Iam your AI Bot🤖</span>
          </h2>

          {/* AI Response */}
          <div
            className={`border rounded-lg p-3 h-40 overflow-y-auto mb-3
              ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-700"}`}
          >
            {loading ? (
              <p className="italic text-gray-400">Thinking...</p>
            ) : answer ? (
              <p className="whitespace-pre-wrap">{answer}</p>
            ) : (
              <p className="text-gray-400">Ask me anything!</p>
            )}
          </div>

          {/* Input + Ask Button */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className={`flex-1 rounded-lg p-2 focus:outline-none focus:ring-2
                ${darkMode
                  ? "bg-gray-800 border border-gray-600 text-gray-100 focus:ring-blue-500"
                  : "bg-white border border-gray-300 text-gray-800 focus:ring-blue-400"}`}
            />
            <button
              onClick={askAI}
              className={`px-3 rounded-lg transition-colors
                ${darkMode ? "bg-purple-500 text-white hover:bg-purple-600 border border-gray-700 rounded-md" : "bg-purple-600 text-white hover:bg-purple-700 border border-gray-100 rounded-md"}`}
            >
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
}
