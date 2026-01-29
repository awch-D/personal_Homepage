import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const body = await request.json()

    // Forward request to backend
    const backendUrl = process.env.BACKEND_URL || 'http://backend:8000'

    const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    // Check if streaming is requested
    if (body.stream) {
        // Create a TransformStream for SSE passthrough
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader()
                if (!reader) {
                    controller.close()
                    return
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read()
                        if (done) break

                        // Pass through the SSE data
                        controller.enqueue(value)
                    }
                } finally {
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        })
    }

    // Non-streaming response
    const data = await response.json()
    return Response.json(data)
}
