/**
 * Tasks page — shows session-based tasks in three categories.
 */

"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { TaskBoard } from "./_components/task-board"
import type { Session } from "@/lib/types/openclaw"

export default function TasksPage() {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch("/api/sessions?messageLimit=1")
            .then((res) => res.json())
            .then((data) => {
                setSessions(Array.isArray(data) ? data : data.sessions ?? [])
            })
            .catch(() => setSessions([]))
            .finally(() => setIsLoading(false))
    }, [])

    return (
        <>
            <PageHeader
                title="Tasks"
                description="Track upcoming, ongoing, and completed tasks derived from sessions."
            />
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <TaskBoard sessions={sessions} />
            )}
        </>
    )
}
