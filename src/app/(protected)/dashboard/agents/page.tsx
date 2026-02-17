/**
 * Agents page — displays all configured agents as cards.
 * Client component that fetches agent data from the API route.
 */

"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Network, Loader2 } from "lucide-react"
import Link from "next/link"
import { AgentGrid } from "./_components/agent-grid"
import type { Agent } from "@/lib/types/openclaw"

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch("/api/agents")
            .then((res) => res.json())
            .then((data) => {
                setAgents(Array.isArray(data) ? data : data.agents ?? [])
            })
            .catch(() => setAgents([]))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <>
            <PageHeader
                title="Agents"
                description="All configured OpenClaw agents."
            >
                <Link href="/dashboard/agents/connections">
                    <Button variant="outline" size="sm">
                        <Network className="mr-2 h-4 w-4" />
                        View Connections
                    </Button>
                </Link>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <AgentGrid agents={agents} />
            )}
        </>
    )
}
