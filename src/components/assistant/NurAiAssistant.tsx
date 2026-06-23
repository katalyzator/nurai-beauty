"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  CalendarCheck2,
  LoaderCircle,
  MessageCircle,
  Minus,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useTelegramAuth } from "@/components/auth/useTelegramAuth";
import {
  formatAssistantMessage,
  type AssistantTextPart,
} from "@/lib/domain/assistant";
import { buildBishkekSlotIso } from "@/lib/domain/booking-calendar";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantBookingDraft = {
  salonId: string;
  salonSlug: string;
  salonName: string;
  serviceId: string;
  serviceName: string;
  staffId: string | null;
  staffName: string | null;
  clientName: string;
  clientPhone: string;
  date: string;
  time: string;
  notes?: string;
};

type AssistantResponse = {
  intent: "book" | "browse" | "own_bookings" | "platform_help" | "boundary";
  reply: string;
  bookingDraft: AssistantBookingDraft | null;
  suggestions: string[];
};

const quickPrompts = [
  "Хочу записаться на маникюр сегодня",
  "Покажи ближайший салон",
  "Какие у меня записи?",
];

export function NurAiAssistant({
  compact = false,
  floating = false,
}: {
  compact?: boolean;
  floating?: boolean;
}) {
  const { authenticated, loading: authLoading, user } = useTelegramAuth();
  const [isOpen, setIsOpen] = useState(!floating);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Я помогу выбрать салон, услугу, мастера и время. По личным записям отвечаю только после Telegram-подтверждения.",
    },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState(quickPrompts);
  const [draft, setDraft] = useState<AssistantBookingDraft | null>(null);
  const [status, setStatus] = useState<
    "idle" | "thinking" | "booking" | "booked" | "error"
  >("idle");
  const history = useMemo(() => messages.slice(-6), [messages]);

  async function sendMessage(nextMessage = input) {
    const trimmed = nextMessage.trim();
    if (!trimmed || status === "thinking") return;

    setInput("");
    setStatus("thinking");
    setDraft(null);
    setMessages((current) => [...current, { role: "user", content: trimmed }]);

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: trimmed,
        history,
      }),
    });
    const data = (await response.json().catch(() => null)) as
      | AssistantResponse
      | null;

    if (!response.ok || !data) {
      setStatus("error");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "AI-помощник сейчас не ответил. Можно выбрать салон ниже и записаться через форму.",
        },
      ]);
      return;
    }

    setDraft(data.bookingDraft);
    setSuggestions(data.suggestions.length ? data.suggestions : quickPrompts);
    setMessages((current) => [
      ...current,
      { role: "assistant", content: data.reply },
    ]);
    setStatus("idle");
  }

  async function confirmDraft() {
    if (!draft || status === "booking" || authLoading) return;

    setStatus("booking");
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        salonId: draft.salonId,
        serviceId: draft.serviceId,
        staffId: draft.staffId,
        clientName: draft.clientName,
        clientPhone: draft.clientPhone,
        startAt: buildBishkekSlotIso(draft.date, draft.time),
        source: authenticated ? "telegram" : "web",
        notes: draft.notes,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setStatus("error");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data?.error ??
            "Не получилось создать запись. Проверьте имя, телефон и время.",
        },
      ]);
      return;
    }

    setStatus("booked");
    setDraft(null);
    setMessages((current) => [
      ...current,
      {
        role: "assistant",
        content: `Запись создана: ${draft.salonName}, ${draft.serviceName}, ${draft.date} в ${draft.time}. Салон увидит ее в кабинете.`,
      },
    ]);
  }

  const panel = (
    <section
      className={`border border-[var(--rose-line)] bg-white shadow-[var(--shadow-subtle)] ${
        compact || floating ? "rounded-[20px] p-4" : "rounded-[24px] p-4 sm:p-5"
      } ${floating ? "max-h-[calc(100vh-2rem)] overflow-y-auto" : ""}`}
      aria-label="nurAI Assistant"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand-plum)] text-white">
            <Bot aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-black leading-tight text-[var(--ink)]">
              nurAI Assistant
            </h2>
            <p className="mt-1 text-xs font-bold text-[var(--muted)]">
              Только запись, салоны и ваши данные nurAI
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-fog)] px-3 py-1 text-xs font-extrabold text-[var(--brand-plum)]">
            <ShieldCheck aria-hidden className="h-3.5 w-3.5" />
            {authenticated ? user?.firstName ?? "Telegram" : "guarded"}
          </span>
          {floating ? (
            <button
              type="button"
              aria-label="Свернуть nurAI Assistant"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--rose-line)] bg-white text-[var(--brand-plum)] hover:bg-[var(--blush-soft)]"
            >
              <Minus aria-hidden className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid max-h-[310px] gap-3 overflow-y-auto pr-1">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[92%] rounded-[18px] px-4 py-3 text-sm font-semibold leading-6 ${
              message.role === "assistant"
                ? "justify-self-start bg-[var(--porcelain)] text-[var(--ink)]"
                : "justify-self-end bg-[var(--brand-plum)] text-white"
            }`}
          >
            {message.role === "assistant" ? (
              <AssistantMessageContent content={message.content} />
            ) : (
              message.content
            )}
          </div>
        ))}
        {status === "thinking" ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--porcelain)] px-4 py-2 text-sm font-bold text-[var(--muted)]">
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            Думаю по доступным слотам...
          </div>
        ) : null}
      </div>

      {draft ? (
        <div className="mt-4 rounded-[18px] border border-[var(--petal-line)] bg-[var(--blush-soft)] p-4">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-[var(--rose-deep)]">
            <CalendarCheck2 aria-hidden className="h-4 w-4" />
            Черновик записи
          </p>
          <div className="mt-2 grid gap-1 text-sm font-bold text-[var(--ink)]">
            <span>{draft.salonName}</span>
            <span>
              {draft.serviceName} · {draft.date} в {draft.time}
            </span>
            <span className="text-[var(--muted)]">
              {draft.staffName ? `Мастер: ${draft.staffName}` : "Любой мастер"}
            </span>
          </div>
          <button
            type="button"
            onClick={confirmDraft}
            disabled={status === "booking" || authLoading}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-plum)] px-4 text-sm font-black text-white shadow-[var(--shadow-cta)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "booking" ? (
              <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <CalendarCheck2 aria-hidden className="h-4 w-4" />
            )}
            {status === "booking" ? "Создаем запись..." : "Подтвердить запись"}
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {(suggestions.length ? suggestions : quickPrompts).map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            className="rounded-full border border-[var(--rose-line)] bg-white px-3 py-1.5 text-xs font-extrabold text-[var(--muted)] hover:border-[var(--rose)] hover:text-[var(--rose-deep)]"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="mt-4 grid grid-cols-[minmax(0,1fr)_44px] gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Например: маникюр завтра после 14:00"
          className="min-h-11 min-w-0 rounded-full border border-[var(--rose-line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--soft)]"
        />
        <button
          type="submit"
          disabled={!input.trim() || status === "thinking"}
          aria-label="Отправить"
          className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-plum)] text-white shadow-[var(--shadow-cta)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "thinking" ? (
            <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <Send aria-hidden className="h-4 w-4" />
          )}
        </button>
      </form>
    </section>
  );

  if (!floating) {
    return panel;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div className="w-[min(420px,calc(100vw-2rem))]">{panel}</div>
      ) : (
        <button
          type="button"
          aria-label="Открыть nurAI Assistant"
          onClick={() => setIsOpen(true)}
          className="inline-flex min-h-14 items-center gap-3 rounded-full bg-[var(--brand-plum)] px-4 text-sm font-black text-white shadow-[var(--shadow-cta)] hover:-translate-y-0.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/12">
            <MessageCircle aria-hidden className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">AI запись</span>
        </button>
      )}
    </div>
  );
}

function AssistantMessageContent({ content }: { content: string }) {
  const blocks = formatAssistantMessage(content);

  return (
    <div className="grid gap-2">
      {blocks.map((block, index) => {
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              key={`${block.type}-${index}`}
              className={`grid gap-1.5 ${
                block.ordered
                  ? "list-decimal pl-5"
                  : "list-disc pl-5 marker:text-[var(--rose-deep)]"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <AssistantInline parts={item} />
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={`${block.type}-${index}`}>
            <AssistantInline parts={block.parts} />
          </p>
        );
      })}
    </div>
  );
}

function AssistantInline({ parts }: { parts: AssistantTextPart[] }) {
  return (
    <>
      {parts.map((part, index) =>
        part.strong ? (
          <strong key={index} className="font-black text-[var(--brand-plum)]">
            {part.text}
          </strong>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}
