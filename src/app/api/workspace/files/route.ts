/**
 * Workspace files API route — reads report/feedback files from agent workspaces.
 *
 * Query params:
 * - type: "report" | "feedback" (required)
 * - agentId: agent identifier (default "main")
 * - file: specific file path to read content (optional)
 *
 * Without `file` → returns list of available files
 * With `file` → returns the file content
 *
 * @returns WorkspaceFile[] | { content: string }
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { invokeGatewayTool } from "@/lib/openclaw"

export async function GET(req: NextRequest): Promise<NextResponse> {
    const { searchParams } = req.nextUrl

    const type = searchParams.get("type")
    if (!type || !["report", "feedback"].includes(type)) {
        return NextResponse.json(
            { error: "type must be 'report' or 'feedback'" },
            { status: 400 },
        )
    }

    const agentId = searchParams.get("agentId") ?? "main"
    const file = searchParams.get("file")

    try {
        if (file) {
            /* Read specific file content */
            const data = await invokeGatewayTool<Record<string, unknown>>("read_file", {
                path: file,
                agentId,
            })

            const content = typeof data === "string"
                ? data
                : (data as Record<string, unknown>)?.content ?? ""

            return NextResponse.json({ content: String(content) })
        }

        /* List files in the report/feedback directory */
        const data = await invokeGatewayTool<Record<string, unknown>>("list_directory", {
            path: type,
            agentId,
        })

        /* Normalise: may be an array of strings or objects */
        const raw = Array.isArray(data)
            ? data
            : Array.isArray((data as Record<string, unknown>)?.files)
                ? (data as Record<string, unknown>).files
                : Array.isArray((data as Record<string, unknown>)?.entries)
                    ? (data as Record<string, unknown>).entries
                    : []

        const files = (raw as Array<string | Record<string, unknown>>).map(
            (entry) => {
                const name = typeof entry === "string" ? entry : String((entry as Record<string, unknown>).name ?? entry)
                const path = typeof entry === "string"
                    ? `${type}/${entry}`
                    : String((entry as Record<string, unknown>).path ?? `${type}/${name}`)

                /* Try to extract date from filename like 17-02-2026.md */
                const dateMatch = name.match(/(\d{2}-\d{2}-\d{4})/)
                const date = dateMatch ? dateMatch[1] : name

                return { name, path, date, agentId }
            },
        )

        return NextResponse.json(files)
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to read workspace files"
        return NextResponse.json([], { status: 200, headers: { "x-error": message } })
    }
}
