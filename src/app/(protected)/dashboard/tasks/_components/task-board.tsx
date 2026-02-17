/**
 * Animated task board — three-column layout: Upcoming, Ongoing, Done.
 * Features gradient column headers, animated card entrances,
 * and status-based visual indicators.
 *
 * @param sessions - Array of Session objects
 */

"use client"

import { motion } from "framer-motion"
import { Clock, Loader2, CheckCircle2, CalendarClock, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { AnimatedCard } from "@/components/animated-card"
import { GradientIcon } from "@/components/gradient-icon"
import { formatRelativeTime } from "@/lib/format"
import type { Session } from "@/lib/types/openclaw"
import type { GradientVariant } from "@/components/gradient-icon"
import type { LucideIcon } from "lucide-react"

interface TaskBoardProps {
    sessions: Session[]
}

const THIRTY_MINUTES_MS = 30 * 60 * 1000

function categorise(sessions: Session[]) {
    const now = Date.now()
    const upcoming: Session[] = []
    const ongoing: Session[] = []
    const done: Session[] = []

    for (const session of sessions) {
        if (session.kind === "cron") {
            upcoming.push(session)
        } else if (session.updatedAt && now - session.updatedAt < THIRTY_MINUTES_MS) {
            ongoing.push(session)
        } else {
            done.push(session)
        }
    }

    return { upcoming, ongoing, done }
}

interface ColumnConfig {
    gradient: string
    accentGradient: string
    variant: GradientVariant
    emptyBorder: string
}

const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
    upcoming: {
        gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
        accentGradient: "from-blue-500/60 via-blue-500/30 to-blue-500/60",
        variant: "info",
        emptyBorder: "border-blue-500/20",
    },
    ongoing: {
        gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
        accentGradient: "from-amber-500/60 via-amber-500/30 to-amber-500/60",
        variant: "warning",
        emptyBorder: "border-amber-500/20",
    },
    done: {
        gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
        accentGradient: "from-emerald-500/60 via-emerald-500/30 to-emerald-500/60",
        variant: "success",
        emptyBorder: "border-emerald-500/20",
    },
}

const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (colIndex: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            delay: colIndex * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
        },
    }),
}

function TaskColumn({
    title,
    icon,
    sessions,
    variant,
    colIndex,
}: {
    title: string
    icon: LucideIcon
    sessions: Session[]
    variant: "upcoming" | "ongoing" | "done"
    colIndex: number
}) {
    const config = COLUMN_CONFIGS[variant]

    return (
        <motion.div
            className="flex flex-col gap-3"
            custom={colIndex}
            initial="hidden"
            animate="visible"
            variants={columnVariants}
        >
            {/* Column header */}
            <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
                <GradientIcon icon={icon} variant={config.variant} size="sm" />
                <h3 className="text-sm font-semibold">{title}</h3>
                <Badge
                    className="ml-auto border-0 bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground text-[10px]"
                >
                    {sessions.length}
                </Badge>
            </div>

            {/* Top accent line */}
            <div className={`h-0.5 w-full rounded-full bg-gradient-to-r ${config.accentGradient}`} />

            {/* Cards */}
            <div className="space-y-2">
                {sessions.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={`rounded-xl border border-dashed ${config.emptyBorder} p-6 text-center text-xs text-muted-foreground`}
                    >
                        No tasks
                    </motion.div>
                )}
                {sessions.map((session, index) => (
                    <AnimatedCard key={session.key} index={index}>
                        <div className="p-3.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate text-sm font-medium">
                                            {session.displayName || session.key}
                                        </p>
                                        {variant === "ongoing" && (
                                            <motion.div
                                                animate={{ opacity: [1, 0.4, 1] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                <Activity className="h-3 w-3 text-amber-500" />
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <Badge
                                            className="bg-gradient-to-r from-primary/10 to-secondary/10 text-foreground border-0 text-[10px]"
                                        >
                                            {session.kind}
                                        </Badge>
                                        {session.channel && session.channel !== "unknown" && (
                                            <Badge variant="outline" className="text-[10px] border-primary/20">
                                                {session.channel}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {session.updatedAt && (
                                    <span className="shrink-0 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                        {formatRelativeTime(session.updatedAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </AnimatedCard>
                ))}
            </div>
        </motion.div>
    )
}

export function TaskBoard({ sessions }: TaskBoardProps) {
    if (!sessions.length) {
        return (
            <EmptyState
                icon={CalendarClock}
                title="No tasks found"
                description="No sessions available to derive tasks from."
            />
        )
    }

    const { upcoming, ongoing, done } = categorise(sessions)

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <TaskColumn title="Upcoming" icon={Clock} sessions={upcoming} variant="upcoming" colIndex={0} />
            <TaskColumn title="Ongoing" icon={Loader2} sessions={ongoing} variant="ongoing" colIndex={1} />
            <TaskColumn title="Done" icon={CheckCircle2} sessions={done} variant="done" colIndex={2} />
        </div>
    )
}
