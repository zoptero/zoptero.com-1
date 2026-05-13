"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAction } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  role: "user" | "model";
  content: string;
};

function buildWelcomeMessage(name?: string): Message {
  const greeting = name?.trim()
    ? `Sveiki, ${name}! Es esmu tavs profila palīgs. Varu palīdzēt aizpildīt jebkuru lauku - tikai jautā!`
    : "Sveiki! Es esmu tavs profila palīgs. Varu palīdzēt aizpildīt jebkuru lauku - tikai jautā!";

  return {
    role: "model",
    content: greeting,
  };
}

export default function ProfileAssistantChat({
  focusedField,
}: {
  focusedField?: string;
}) {
  const { user } = useUser();
  const userName = user?.firstName ?? user?.fullName ?? undefined;
  const TYPEWRITER_STEP_CHARS = 2;
  const TYPEWRITER_STEP_MS = 16;
  const welcomeMessage = buildWelcomeMessage(userName);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typewriterTimerRef = useRef<number | null>(null);
  const chat = useAction(api.ai.profileAssistantChat);

  useEffect(() => {
    return () => {
      if (typewriterTimerRef.current !== null) {
        window.clearInterval(typewriterTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0]?.role === "model") {
        return [welcomeMessage];
      }
      return prev;
    });
  }, [welcomeMessage.content]);

  async function appendModelMessageWithTypewriter(fullText: string): Promise<void> {
    setMessages((prev) => [...prev, { role: "model", content: "" }]);

    await new Promise<void>((resolve) => {
      let index = 0;

      typewriterTimerRef.current = window.setInterval(() => {
        index = Math.min(fullText.length, index + TYPEWRITER_STEP_CHARS);

        setMessages((prev) => {
          if (prev.length === 0) {
            return prev;
          }

          const next = [...prev];
          const last = next[next.length - 1];
          if (!last || last.role !== "model") {
            return prev;
          }

          next[next.length - 1] = { role: "model", content: fullText.slice(0, index) };
          return next;
        });

        if (index >= fullText.length) {
          if (typewriterTimerRef.current !== null) {
            window.clearInterval(typewriterTimerRef.current);
            typewriterTimerRef.current = null;
          }
          resolve();
        }
      }, TYPEWRITER_STEP_MS);
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const historyForApi = nextMessages
        .slice(0, -1)
        .filter((_, index) => index !== 0)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const reply = await chat({
        message: text,
        fieldContext: focusedField,
        history: historyForApi,
      });

      await appendModelMessageWithTypewriter(reply);
    } catch (err) {
      console.error("ProfileAssistantChat error:", err);
      await appendModelMessageWithTypewriter(
        `Kļūda: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-1 flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <div 
            className="size-8 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: "url(https://media.zoptero.com/img/chat-help-avatar.webp)" }}
            role="img"
            aria-label="Palīgs"
          />
          Profila palīgs
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-4 pt-0">
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={
                  msg.role === "user"
                    ? "ml-4 self-end rounded-xl bg-primary px-3 py-2 text-xs text-primary-foreground"
                    : "mr-4 self-start rounded-xl bg-muted px-3 py-2 text-xs text-foreground"
                }
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            ))}
            {loading && (
              <div className="mr-4 self-start rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="animate-pulse">Domā...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </div>

        <div className="flex shrink-0 items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jautā par kādu lauku…"
            rows={2}
            className="resize-none text-sm"
            disabled={loading}
          />
          <Button
            type="button"
            size="icon"
            onClick={() => void send()}
            disabled={!input.trim() || loading}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
