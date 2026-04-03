import type { AgentTaskModel } from '@fencyai/js'
import type { AgentTask, UseAgentTasksProps } from '@fencyai/react'
import { useAgentTasks } from '@fencyai/react'
import { useRef, useState } from 'react'

interface UseChatProps extends UseAgentTasksProps {
    model: AgentTaskModel
}

interface UseChat {
    agentTasks: AgentTask[]
    isSubmitting: boolean
    sendMessage: (text: string) => Promise<void>
}

export function useChat({ model, ...agentTasksProps }: UseChatProps): UseChat {
    const { agentTasks, createAgentTask } = useAgentTasks(agentTasksProps)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const lastAssistantRef = useRef<{
        role: 'ASSISTANT'
        content: string
    } | null>(null)

    async function sendMessage(text: string) {
        const trimmed = text.trim()
        if (!trimmed || isSubmitting) return

        setIsSubmitting(true)

        let nextMessages: {
            role: 'USER' | 'ASSISTANT' | 'SYSTEM'
            content: string
        }[]
        const lastTask = agentTasks.at(-1)
        const newUserMsg = { role: 'USER' as const, content: trimmed }

        const priorMessages =
            lastTask && lastTask.params.type === 'MemoryChatCompletion'
                ? lastTask.params.messages
                : []

        const assistantMsg = lastAssistantRef.current
        if (assistantMsg) {
            nextMessages = [...priorMessages, assistantMsg, newUserMsg]
            lastAssistantRef.current = null
        } else {
            nextMessages = [...priorMessages, newUserMsg]
        }

        try {
            const response = await createAgentTask({
                type: 'MemoryChatCompletion',
                messages: nextMessages,
                model,
            })
            if (
                response.type === 'success' &&
                response.response.taskType === 'MemoryChatCompletion'
            ) {
                lastAssistantRef.current = {
                    role: 'ASSISTANT',
                    content: response.response.response.textResponse,
                }
            }
        } catch {
            // Task error will be surfaced via task.error
        } finally {
            setIsSubmitting(false)
        }
    }

    return { agentTasks, isSubmitting, sendMessage }
}
