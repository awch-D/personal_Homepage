'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export default function AiTerminal() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Neural interface established. Welcome, visitor. How can I assist your inquiry today?" }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return

        const userText = input.trim()
        setInput('')
        setIsLoading(true)

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userText }])

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userText,
                    messages: messages, // Send history
                    stream: true
                }),
            })

            if (!response.ok) throw new Error('API error')

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ''

            // Add placeholder assistant message
            setMessages(prev => [...prev, { role: 'assistant', content: '' }])

            while (reader) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data === '[DONE]') break
                        assistantContent += data
                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
                            return updated
                        })
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Neural connection interrupted. Please retry.'
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card rounded-xl flex flex-col overflow-hidden h-[500px]" style={{ gridArea: 'terminal' }}>
            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/50"></div>
                </div>
                <span className="text-[10px] font-mono opacity-50 tracking-widest uppercase">Neural_Terminal_v4.0.1</span>
                <span className="material-symbols-outlined text-sm opacity-50">more_horiz</span>
            </div>
            <div ref={scrollRef} className="p-6 font-mono text-sm flex-1 flex flex-col gap-4 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className="flex gap-3">
                        <span className={msg.role === 'assistant' ? "text-primary shrink-0" : "text-white/40 shrink-0"}>
                            [{msg.role === 'assistant' ? 'SYSTEM' : 'USER'}]:
                        </span>
                        <div className="text-white/80 whitespace-pre-wrap">
                            {msg.content}
                            {/* Blinking cursor effect for last message if loading or empty */}
                            {isLoading && i === messages.length - 1 && msg.role === 'assistant' && (
                                <span className="animate-pulse ml-1">_</span>
                            )}
                        </div>
                    </div>
                ))}

                {/* Fallback for completely empty loading state if needed, though usually covered above */}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex gap-3">
                        <span className="text-primary shrink-0">[SYSTEM]:</span>
                        <span className="animate-pulse">_</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="mt-auto flex gap-3 border-t border-white/5 pt-4 p-4">
                <span className="text-primary animate-pulse">_</span>
                <input
                    className="bg-transparent border-none outline-none ring-0 focus:ring-0 p-0 w-full text-white placeholder-white/20 font-mono"
                    placeholder="Ask me about my neural network projects..."
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                />
                <button
                    className="flex items-center justify-center text-primary transition-all duration-300 hover:scale-125 disabled:opacity-30 disabled:hover:scale-100 p-2 min-w-[40px] min-h-[40px]"
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    aria-label="Send message"
                >
                    <span className="material-symbols-outlined text-2xl font-bold leading-none">send</span>
                </button>
            </div>
        </div>
    )
}
