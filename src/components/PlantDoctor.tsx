import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Trash2, Sprout, MessageSquare, AlertCircle } from "lucide-react";
import { ChatMessage } from "../types";

const SUGGESTED_PROMPTS = [
  "Why are my tomato leaves turning yellow?",
  "How can I treat powdery mildew organically?",
  "What is the best fertilizer schedule for winter wheat?",
  "How do I balance high soil pH in my garden beds?"
];

export default function PlantDoctor() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am **Dr. Sage**, your AI Plant Doctor and Agronomist. 🌾\n\nI can help you troubleshoot weird leaf spots, design fertilizing checklists, cure pest problems, or optimize crop irrigation. What seems to be the issue in your garden or field today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsgId = "user_" + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Map ChatMessage structure to server expectation
      const chatHistoryForAPI = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistoryForAPI
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to reach AI Plant Doctor. Check your Gemini API Key.");
      }

      const data = await response.json();
      const botMsgId = "bot_" + Date.now();
      const newBotMessage: ChatMessage = {
        id: botMsgId,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected issue occurred while chatting with Dr. Sage.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear this chat history?")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I am **Dr. Sage**, your AI Plant Doctor and Agronomist. 🌾\n\nHow is your crop growing? Send me some symptoms or questions and we can resolve it together.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setError(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-14rem)] min-h-[500px]" id="plant-doctor">
      {/* Suggestions Rail */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-stone-800">Agronomist Tips</h3>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Dr. Sage is trained to assist with soil chemistry, crop diagnostics, botanical classifications, watering rotations, and biological pest controls.
          </p>

          <div className="mt-2 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Suggested Questions</span>
            <div className="flex flex-col gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  id={`suggested-prompt-${index}`}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="p-3 bg-stone-50 hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-50 text-left rounded-xl text-xs text-stone-600 border border-stone-150 transition-all hover:border-emerald-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] text-stone-400 font-mono">Status: ACTIVE</span>
            <button
              id="clear-chat-btn"
              onClick={handleClearHistory}
              className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-semibold"
              title="Clear Conversational Memory"
            >
              <Trash2 className="w-4 h-4" />
              Reset Memory
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="lg:col-span-8 flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-800">Dr. Sage, Expert Agronomist</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">AI Crop Specialist</span>
            </div>
          </div>
        </div>

        {/* Scrollable Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-semibold ${
                  msg.role === "user"
                    ? "bg-stone-100 border-stone-200 text-stone-700"
                    : "bg-emerald-50 border-emerald-100 text-emerald-800"
                }`}
              >
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="flex flex-col gap-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-stone-850 text-white rounded-tr-none"
                      : "bg-stone-50 border border-stone-150 text-stone-700 rounded-tl-none"
                  }`}
                >
                  {/* Basic parsing for simple markdown headings or lists */}
                  {msg.content.split("\n\n").map((para, i) => {
                    if (para.startsWith("**") && para.endsWith("**")) {
                      return <h5 key={i} className="font-bold text-stone-800 mt-2 mb-1">{para.replace(/\*\*/g, "")}</h5>;
                    }
                    if (para.startsWith("###")) {
                      return <h5 key={i} className="font-bold text-stone-800 mt-3 mb-1 text-sm">{para.replace(/###/g, "").trim()}</h5>;
                    }
                    if (para.startsWith("- ") || para.startsWith("* ")) {
                      return (
                        <ul key={i} className="list-disc pl-5 my-1 space-y-1">
                          {para.split("\n").map((item, idx) => (
                            <li key={idx}>{item.replace(/^[-*]\s+/, "")}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={i} className="mb-2 last:mb-0">{para}</p>;
                  })}
                </div>
                <span className="text-[10px] text-stone-400 self-end font-mono mt-0.5">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-emerald-800">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-50 border border-stone-150 px-4 py-3 rounded-2xl rounded-tl-none text-sm text-stone-500 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span>Sage is drafting recommendations...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex gap-2 items-start mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              id="chat-input-field"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dr. Sage about plant deficiencies, pests, crop calendars..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-white border border-stone-250 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-stone-800 disabled:bg-stone-50"
            />
            <button
              type="submit"
              id="send-chat-message-btn"
              disabled={!input.trim() || isLoading}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-semibold flex items-center justify-center transition-colors shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
