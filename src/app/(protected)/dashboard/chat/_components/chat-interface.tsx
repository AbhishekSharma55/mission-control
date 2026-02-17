/**
 * Chat interface — real-time messaging with the main agent.
 *
 * Features:
 * - Message history loaded via /api/sessions/history
 * - Sends messages via /api/sessions/send
 * - Auto-refresh every 3s when active
 * - Handles content as string OR array of typed parts
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send, Bot, User, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { SessionMessage, MessageContentPart } from "@/lib/types/openclaw"

const SESSION_KEY = "main"
const POLL_INTERVAL_MS = 3000

/**
 * Extracts text from message content (handles both string and array formats).
 */
function getMessageText(content: string | MessageContentPart[]): string {
    if (typeof content === "string") return content

    if (Array.isArray(content)) {
        return content
            .filter((part) => part.type === "text" && part.text)
            .map((part) => part.text)
            .join("\n")
    }

    return String(content)
}

export function ChatInterface() {
    const [messages, setMessages] = useState<SessionMessage[]>([])
    const [input, setInput] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)

    const fetchHistory = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/sessions/history?sessionKey=${SESSION_KEY}&limit=50`,
            )
            const data = await res.json()
            if (Array.isArray(data)) {
                setMessages(data)
            }
        } catch {
            /* silently fail — will retry on next poll */
        } finally {
            setIsLoading(false)
        }
    }, [])

    /* Initial load + polling */
    useEffect(() => {
        fetchHistory()
        const id = setInterval(fetchHistory, POLL_INTERVAL_MS)
        return () => clearInterval(id)
    }, [fetchHistory])

    /* Auto-scroll on new messages */
    useEffect(() => {
        scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth",
        })
    }, [messages.length])

    const handleSend = async () => {
        const trimmed = input.trim()
        if (!trimmed || isSending) return

        setInput("")
        setIsSending(true)

        /* Optimistic update */
        const optimistic: SessionMessage = {
            role: "user",
            content: trimmed,
            timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, optimistic])

        try {
            const res = await fetch("/api/sessions/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    sessionKey: SESSION_KEY,
                }),
            })

            const data = await res.json()
            if (!data.ok) {
                /* Remove optimistic message on failure */
                setMessages((prev) => prev.filter((m) => m !== optimistic))
            }
        } catch {
            setMessages((prev) => prev.filter((m) => m !== optimistic))
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border">
            {/* Messages area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3"
            >
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isLoading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Bot className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">
                            No messages yet. Start a conversation!
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const isUser = msg.role === "user"
                    const text = getMessageText(msg.content)

                    return (
                        <div
                            key={i}
                            className={cn(
                                "flex gap-3",
                                isUser ? "flex-row-reverse" : "flex-row",
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                                    isUser
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted",
                                )}
                            >
                                {isUser ? (
                                    <User className="h-3.5 w-3.5" />
                                ) : (
                                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                            </div>
                            <Card
                                className={cn(
                                    "max-w-[75%]",
                                    isUser && "bg-primary text-primary-foreground",
                                )}
                            >
                                <CardContent className="p-3">
                                    <p className="whitespace-pre-wrap text-sm">{text}</p>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>

            {/* Input area */}
            <div className="border-t p-4">
                <div className="flex items-end gap-2">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message…"
                        className="min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                    />
                    <div className="flex gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={fetchHistory}
                            className="shrink-0"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={!input.trim() || isSending}
                            className="shrink-0"
                        >
                            {isSending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
