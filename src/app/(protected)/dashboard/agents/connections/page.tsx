/**
 * Multi-agent connections page — shows which agents are connected.
 */

"use client"

import { useEffect, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { ConnectionGraph } from "./_components/connection-graph"
import type { Agent } from "@/lib/types/openclaw"

export default function ConnectionsPage() {
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
                title="Agent Connections"
                description="Visualize how agents are connected through bindings and channels."
            >
                <Link href="/dashboard/agents">
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Agents
                    </Button>
                </Link>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <ConnectionGraph agents={agents} />
            )}
        </>
    )
}
