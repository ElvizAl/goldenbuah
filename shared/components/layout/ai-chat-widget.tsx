"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import { CategoryList } from "@/modules/orders/components/tool-ui/category-list";
import { ProductList } from "@/modules/orders/components/tool-ui/product-list";
import { ToolLoading } from "@/modules/orders/components/tool-ui/tool-loading";

const SUGGESTIONS = [
  "Buah apa yang bagus untuk anak usia 8 tahun?",
  "Tampilkan kategori buah",
  "Rekomendasi buah untuk diet",
  "Buah apa yang bagus untuk imun tubuh?",
];

type ToolOutput = {
  categories?: Parameters<typeof CategoryList>[0]["categories"];
  products?: Parameters<typeof ProductList>[0]["products"];
};

type ChatPart = {
  type: string;
  text?: string;
  state?: string;
  output?: ToolOutput;
  errorText?: string;
  toolName?: string;
  toolInvocation?: {
    toolName?: string;
    state?: string;
    result?: ToolOutput;
  };
};

function getToolName(part: ChatPart) {
  if (part.toolInvocation?.toolName) return part.toolInvocation.toolName;
  if (part.toolName) return part.toolName;
  if (part.type.startsWith("tool-")) return part.type.slice("tool-".length);
  return null;
}

function getToolOutput(part: ChatPart) {
  return part.output ?? part.toolInvocation?.result;
}

function hasToolOutput(part: ChatPart) {
  return part.state === "output-available" || part.toolInvocation?.state === "result";
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    }
  }, [open, messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function renderToolPart(part: ChatPart, key: number) {
    const toolName = getToolName(part);
    const output = getToolOutput(part);

    if (toolName === "getCategories") {
      if (part.state === "output-error") {
        return (
          <div key={key} className="pl-9 text-xs text-red-500">
            {part.errorText ?? "Gagal mengambil kategori."}
          </div>
        );
      }

      if (hasToolOutput(part) && output?.categories) {
        return (
          <div key={key} className="pl-9">
            <CategoryList
              categories={output.categories}
              onSelect={(slug: string) => send(`Tampilkan produk kategori ${slug}`)}
            />
          </div>
        );
      }

      return (
        <div key={key} className="pl-9">
          <ToolLoading label="Mengambil kategori..." />
        </div>
      );
    }

    if (toolName === "searchProducts") {
      if (part.state === "output-error") {
        return (
          <div key={key} className="pl-9 text-xs text-red-500">
            {part.errorText ?? "Gagal mencari produk."}
          </div>
        );
      }

      if (hasToolOutput(part) && output?.products) {
        return (
          <div key={key} className="pl-9">
            <ProductList products={output.products} />
          </div>
        );
      }

      return (
        <div key={key} className="pl-9">
          <ToolLoading label="Mencari produk..." />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat AI"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 focus:outline-none ${
          open
            ? "bg-neutral-800 scale-95"
            : "bg-gradient-to-br from-green-500 to-emerald-600 hover:scale-110 hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.5)]"
        }`}
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="16" y1="3" x2="16" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="2.5" r="1.5" fill="white" />
            <rect x="5" y="7" width="22" height="17" rx="4" fill="white" fillOpacity="0.93" />
            <rect x="9" y="11" width="5" height="4" rx="1.5" fill="#10b981" />
            <rect x="18" y="11" width="5" height="4" rx="1.5" fill="#10b981" />
            <path d="M10.5 19.5 Q16 23 21.5 19.5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="11" y="24" width="10" height="5" rx="2" fill="white" fillOpacity="0.7" />
            <rect x="2" y="11" width="3" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
            <rect x="27" y="11" width="3" height="5" rx="1.5" fill="white" fillOpacity="0.7" />
          </svg>
        )}
      </button>

      {!open && (
        <span className="pointer-events-none fixed bottom-6 right-6 z-40 flex h-14 w-14 rounded-full">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-25" />
        </span>
      )}

      <div
        className={`fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl transition-all duration-300 origin-bottom-right ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-90 opacity-0 pointer-events-none"
        }`}
        style={{ height: "520px" }}
      >
        <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Asisten Golden Buah</p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-200 animate-pulse" />
              <p className="text-[10px] text-green-100">Online - Siap membantu</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-neutral-100 px-3 py-2 text-sm leading-relaxed text-neutral-800 shadow-sm">
                Halo! Saya asisten Golden Buah. Tanya apa saja seputar buah segar, manfaat, tips memilih, atau rekomendasi produk kami.
              </div>
            </div>
          )}

          {messages.map((message) => {
            const parts = message.parts as ChatPart[];

            if (message.role === "user") {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-none bg-green-600 px-3 py-2 text-sm leading-relaxed text-white shadow-sm">
                    {parts
                      .filter((part) => part.type === "text")
                      .map((part, index) => (
                        <span key={index}>{part.text}</span>
                      ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={message.id} className="flex flex-col gap-2">
                {parts.map((part, index) => {
                  if (part.type === "text") {
                    if (!part.text) return null;
                    return (
                      <div key={index} className="flex items-end gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-neutral-100 px-3 py-2 text-sm leading-relaxed text-neutral-800 shadow-sm whitespace-pre-wrap">
                          {part.text}
                        </div>
                      </div>
                    );
                  }

                  return renderToolPart(part, index);
                })}
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none bg-neutral-100 px-3 py-2.5 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
                <span className="text-xs text-neutral-500">Sedang mengetik...</span>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-bl-none bg-red-50 px-3 py-2 text-sm leading-relaxed text-red-600 shadow-sm">
                {error?.message ?? "Maaf, chat sedang bermasalah. Coba kirim lagi sebentar ya."}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {messages.length === 0 && (
          <div className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => send(suggestion)}
                className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-green-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 flex items-center gap-2 border-t border-neutral-100 px-3 py-2.5"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaanmu..."
            disabled={isStreaming}
            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-white shadow hover:bg-green-700 disabled:opacity-40 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </>
  );
}
