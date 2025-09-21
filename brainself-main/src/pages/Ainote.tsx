import React, { useState } from "react";
import axios from "axios";
import { Sparkles, Check } from "lucide-react";

const ShortnoteGenerator = () => {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const getContentFromResponse = (data: any) => {
    if (!data) return null;
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    if (data.choices?.[0]?.delta?.content) return data.choices[0].delta.content;
    if (data.output_text) return data.output_text;
    if (data.text) return data.text;
    if (typeof data === "string") return data;
    try {
      return JSON.stringify(data).slice(0, 2000);
    } catch {
      return null;
    }
  };

  const maskKey = (k?: string) => {
    if (!k) return "MISSING";
    if (k.length < 8) return "****";
    return `${k.slice(0, 4)}...${k.slice(-4)}`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setDone(false);
    setResult("");

    const apiKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
    console.log("Groq API key loaded?", apiKey ? `Yes (${maskKey(apiKey)})` : "No (MISSING)");
    if (!apiKey) {
      setResult("❌ API key missing. Create .env with VITE_GROQ_API_KEY and restart dev server.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "You are a teacher making short, exam-friendly notes." },
          { role: "user", content: `Generate a clear, short study note about: ${topic}` }
        ],
        temperature: 0.2,
        max_tokens: 600
      };

      console.log("Sending request (payload preview):", {
        model: payload.model,
        messages: payload.messages.map(m => ({ role: m.role, snippet: m.content.slice(0, 80) }))
      });

const apiKey = (import.meta as any).env?.VITE_GROQ_API_KEY;
console.log("Groq API key loaded?", apiKey ? `Yes (${maskKey(apiKey)})` : "No (MISSING)");
if (!apiKey) {
  setResult("❌ API key missing. Create .env with VITE_GROQ_API_KEY and restart dev server.");
  setLoading(false);
  return;
}

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 120000
      });

      console.log("Raw API response:", res?.data);

      const content = getContentFromResponse(res.data);
      if (!content) {
        setResult("⚠️ No content in response. Check console (raw response).");
      } else {
        setResult(content);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }
    } catch (err: any) {
      console.error("API error (see details):", err?.response?.data || err.message || err);
      const serverMsg = err?.response?.data?.error?.message || err?.response?.data || err.message;
      setResult(`❌ Failed to generate notes. ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-black/50 backdrop-blur-lg p-6 rounded-2xl neon-border text-white space-y-4">
      <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
        <Sparkles className="w-6 h-6" /> AI Shortnote Generator
      </h2>
      <li>API key is no longer supportive ...</li>

      <input
        type="text"
        placeholder="Enter a topic (e.g., Photosynthesis)"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        className="w-full p-2 rounded bg-black/70 border border-cyan-400 text-white placeholder-gray-400"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-2 rounded-lg relative neon-glow overflow-hidden group bg-cyan-500 text-black font-bold hover:bg-cyan-400 transition-all duration-300"
      >
        {loading ? "Generating..." : done ? (
          <span className="flex items-center justify-center gap-2 text-green-400">
            <Check className="w-5 h-5" /> Done!
          </span>
        ) : "⚡ Generate Notes"}
        <span className="absolute inset-0 rounded-lg border-2 border-cyan-400 opacity-0 group-hover:opacity-100 animate-pulse"></span>
      </button>

      {result && (
        <div className="mt-4 p-3 rounded bg-gray-900 border border-cyan-700 whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
};

export default ShortnoteGenerator;
