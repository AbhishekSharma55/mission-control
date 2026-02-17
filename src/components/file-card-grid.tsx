/**
 * Shared file card grid for reports and feedback pages.
 *
 * Displays date-wise cards for workspace files.
 * Clicking a card fetches the file content and shows it in a dialog.
 *
 * @param files - Array of WorkspaceFile objects
 * @param type  - "report" | "feedback"
 */

"use client"

import { useState } from "react"
import { FileText, Lightbulb, Calendar, User, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/empty-state"
import { MarkdownViewer } from "@/components/markdown-viewer"
import type { WorkspaceFile } from "@/lib/types/openclaw"

interface FileCardGridProps {
    files: WorkspaceFile[]
    type: "report" | "feedback"
}

export function FileCardGrid({ files, type }: FileCardGridProps) {
    const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null)
    const [content, setContent] = useState<string>("")
    const [isLoading, setIsLoading] = useState(false)

    const Icon = type === "report" ? FileText : Lightbulb

    if (!files.length) {
        return (
            <EmptyState
                icon={Icon}
                title={`No ${type === "report" ? "reports" : "feedback"} found`}
                description={`No ${type} files found in the agent workspace.`}
            />
        )
    }

    const handleOpen = async (file: WorkspaceFile) => {
        setSelectedFile(file)
        setIsLoading(true)
        setContent("")

        try {
            const res = await fetch(
                `/api/workspace/files?type=${type}&file=${encodeURIComponent(file.path)}&agentId=${encodeURIComponent(file.agentId)}`,
            )
            const data = await res.json()
            setContent(data.content ?? "No content available.")
        } catch {
            setContent("Failed to load file content.")
        } finally {
            setIsLoading(false)
        }
    }

    /* Sort by date descending (newest first) */
    const sorted = [...files].sort((a, b) => b.date.localeCompare(a.date))

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((file) => (
                    <Card
                        key={file.path}
                        className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/20"
                        onClick={() => handleOpen(file)}
                    >
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
                                <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <CardTitle className="truncate text-sm font-medium">
                                    {file.name.replace(".md", "")}
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{file.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{file.agentId}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detail dialog */}
            <Dialog
                open={!!selectedFile}
                onOpenChange={(open) => { if (!open) setSelectedFile(null) }}
            >
                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {selectedFile?.name.replace(".md", "")}
                            <Badge variant="outline" className="ml-2 text-[10px]">
                                {selectedFile?.agentId}
                            </Badge>
                        </DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : (
                        <MarkdownViewer content={content} />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
