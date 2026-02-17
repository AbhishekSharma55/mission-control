/**
 * Agents API route — lists all configured agents via the gateway.
 *
 * Uses the `agents_list` tool.
 * Response shape from gateway: { requester, allowAny, agents: [...] }
 *
 * @returns Agent[]
 */

import { NextResponse } from "next/server"
import { invokeGatewayTool } from "@/lib/openclaw"

interface AgentsListResult {
    requester: string
    allowAny: boolean
    agents: Array<{
        id: string
        name?: string
        configured: boolean
    }>
}

export async function GET(): Promise<NextResponse> {
    try {
        const data = await invokeGatewayTool<AgentsListResult>("agents_list", {})
        return NextResponse.json(data.agents ?? [])
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch agents"
        console.error("[API /agents]:", message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
