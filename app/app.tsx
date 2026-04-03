'use client'

import { useEffect, useRef, useState } from 'react'
import { fetchCreateAgentTaskClientToken } from '@/lib/fetchCreateAgentTaskClientToken'
import { AgentTaskProgress } from '@fencyai/react'
import { useChat } from '@/hooks/useChat'

export default function App() {
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)
    const { agentTasks, isSubmitting, sendMessage } = useChat({
        fetchCreateAgentTaskClientToken,
        model: 'openai/gpt-4.1-mini',
    })

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
    }, [agentTasks])

    useEffect(() => {
        if (!isSubmitting) return
        const id = setInterval(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
        }, 100)
        return () => clearInterval(id)
    }, [isSubmitting])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || isSubmitting) return
        const text = input
        setInput('')
        await sendMessage(text)
    }

    return (
        <div className="mx-auto flex h-screen max-w-5xl flex-col">
            <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto p-4"
            >
                <div className="mb-6 flex flex-col items-center text-center">
                    <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                        This example uses Memory Chat Completion to answer
                        questions about a sample contract. The AI has access to
                        the document and can cite sources from it.
                    </p>
                    <a
                        href="/SampleContract-Shuttle.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-sm font-medium text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        View sample contract (PDF)
                    </a>
                </div>

                {agentTasks.map((task) => {
                    if (task.params.type !== 'MemoryChatCompletion') return null
                    return (
                    <div key={task.taskKey} className="mb-4">
                        <div className="mb-2 ml-auto w-fit max-w-[80%] rounded-lg bg-blue-500 px-3 py-2 text-right text-white dark:bg-blue-800">
                            {task.params.messages.at(-1)?.content}
                        </div>
                        <div className="mb-2 mr-auto max-w-[80%]">
                            {task.error ? (
                                <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                    {task.error.message}
                                </div>
                            ) : (
                                <AgentTaskProgress agentTask={task} />
                            )}
                        </div>
                    </div>
                    )
                })}
            </div>
            <form
                onSubmit={handleSubmit}
                className="flex shrink-0 gap-2 border-t border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950"
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSubmitting}
                    className="min-w-0 flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-600 dark:focus:border-neutral-400"
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !input.trim()}
                    className="rounded border border-neutral-300 bg-neutral-100 px-4 py-2 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800"
                >
                    Submit
                </button>
            </form>
        </div>
    )
}
