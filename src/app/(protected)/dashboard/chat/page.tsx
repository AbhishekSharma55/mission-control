/**
 * Chat page — communicate with the main agent.
 * Uses `sessions_send` for sending and `sessions_history` for loading messages.
 */

import { PageHeader } from "@/components/page-header"
import { ChatInterface } from "./_components/chat-interface"

export default function ChatPage() {
    return (
        <>
            <PageHeader
                title="Chat"
                description="Communicate with your main agent."
            />
            <ChatInterface />
        </>
    )
}
