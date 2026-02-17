/**
 * Agent card grid with rich animations and visual effects.
 * Each agent card features gradient icons, animated stats,
 * and staggered entrance animations via Framer Motion.
 *
 * @param agents - Array of Agent objects from the gateway
 */

"use client"

import { motion } from "framer-motion"
import { Bot, Folder, Cpu, Sparkles, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { AnimatedCard, AnimatedContainer } from "@/components/animated-card"
import { GradientIcon } from "@/components/gradient-icon"
import type { Agent } from "@/lib/types/openclaw"

interface AgentGridProps {
    agents: Agent[]
}

export function AgentGrid({ agents }: AgentGridProps) {
    if (!agents.length) {
        return (
            <EmptyState
                icon={Bot}
                title="No agents found"
                description="No agents are configured in the gateway. Check your connection or add agents via the CLI."
            />
        )
    }

    return (
        <AnimatedContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, index) => (
                <AnimatedCard key={agent.id} index={index}>
                    {/* Top gradient accent stripe */}
                    <div className="h-1 w-full bg-gradient-to-r from-primary/60 via-secondary/40 to-primary/60" />

                    <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <GradientIcon
                                    icon={Bot}
                                    variant={agent.default ? "primary" : "secondary"}
                                    size="lg"
                                    pulse={agent.default}
                                />
                                <div>
                                    <h3 className="text-base font-semibold tracking-tight">
                                        {agent.id}
                                    </h3>
                                    {agent.default && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <Badge className="mt-1 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground text-[10px] border-0">
                                                <Sparkles className="mr-1 h-2.5 w-2.5" />
                                                Default
                                            </Badge>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Status dot */}
                            <div className="relative">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500/60" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                        {/* Details */}
                        <div className="space-y-2.5">
                            {agent.workspace && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08 + 0.2 }}
                                    className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-xs"
                                >
                                    <Folder className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                                    <span className="truncate text-muted-foreground font-mono">
                                        {agent.workspace}
                                    </span>
                                </motion.div>
                            )}

                            {agent.model && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.08 + 0.3 }}
                                    className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2 text-xs"
                                >
                                    <Cpu className="h-3.5 w-3.5 shrink-0 text-secondary/70" />
                                    <span className="truncate text-muted-foreground font-medium">
                                        {agent.model}
                                    </span>
                                </motion.div>
                            )}
                        </div>

                        {/* Bindings */}
                        {agent.bindings && agent.bindings.length > 0 && (
                            <motion.div
                                className="mt-4 flex flex-wrap gap-1.5"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.08 + 0.4 }}
                            >
                                <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" />
                                {agent.bindings.map((binding, i) => (
                                    <Badge
                                        key={`${binding.agentId}-${i}`}
                                        variant="outline"
                                        className="text-[10px] border-primary/20 bg-primary/5"
                                    >
                                        {binding.match?.channel ?? "any"}
                                    </Badge>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </AnimatedCard>
            ))}
        </AnimatedContainer>
    )
}
