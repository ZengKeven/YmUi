import type { ChatAttachmentContent, ChatMessageStatus, ChatSearchContent, ChatSuggestionContent,
  ChatToolCallContent, ChatToolCallValue } from '../components/chat-message/types'
import type { ChatStreamContent } from './types'

export function copyToolValue(value: ChatToolCallValue): ChatToolCallValue {
  return value !== null && typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value
}

/** 汇总单轮回复。已交给消息列表的快照不再随新分片变化。 */
export function createReplyContent() {
  const blocks: Exclude<ChatStreamContent, ChatSuggestionContent>[] = []
  let suggestions: ChatSuggestionContent | undefined

  function finishThinking() {
    const last = blocks.at(-1)
    if (last?.type === 'thinking' && last.status !== 'complete') {
      blocks[blocks.length - 1] = { ...last, status: 'complete' }
    }
  }

  function updateListBlock(chunk: ChatSearchContent | ChatAttachmentContent) {
    const index = blocks.findIndex(block => block.type === chunk.type)
    let next: ChatSearchContent | ChatAttachmentContent
    if (chunk.type === 'attachment') {
      next = { type: 'attachment', data: chunk.data.map(item => ({ ...item })) }
    } else {
      const previous = blocks[index]
      const search = previous?.type === 'search' ? previous : undefined
      next = {
        type: 'search',
        data: {
          title: chunk.data.title ?? search?.data.title,
          references: chunk.data.references?.map(item => ({ ...item })) ?? search?.data.references,
        },
        status: chunk.status ?? search?.status,
      }
    }
    if (index >= 0) {
      blocks[index] = next
    } else {
      finishThinking()
      blocks.push(next)
    }
  }

  function updateToolCall(chunk: ChatToolCallContent) {
    const { toolCallId, toolCallName, args, result } = chunk.data
    const index = blocks.findIndex(block => block.type === 'toolcall' && block.data.toolCallId === toolCallId)
    const previous = blocks[index]
    const call = previous?.type === 'toolcall' ? previous : undefined
    // 同一调用只接受一个终态，延迟到达的进度帧不能覆盖最终结果。
    if ((call?.status === 'complete' || call?.status === 'error' || call?.status === 'stop')
      && chunk.status && chunk.status !== call.status) return

    const data = { ...call?.data, toolCallId }
    if (toolCallName !== undefined) data.toolCallName = toolCallName
    if (args !== undefined) data.args = copyToolValue(args)
    if (result !== undefined) data.result = copyToolValue(result)
    const next: ChatToolCallContent = { type: 'toolcall', status: chunk.status ?? call?.status ?? 'executing', data }
    if (call) {
      blocks[index] = next
    } else {
      finishThinking()
      blocks.push(next)
    }
  }

  function append(chunk: ChatStreamContent) {
    const last = blocks.at(-1)
    if (chunk.type === 'suggestion') {
      suggestions = { ...chunk, data: chunk.data.map(item => ({ ...item })) }
    } else if (chunk.type === 'search' || chunk.type === 'attachment') {
      updateListBlock(chunk)
    } else if (chunk.type === 'toolcall') {
      updateToolCall(chunk)
    } else if (chunk.type === 'markdown') {
      if (last?.type === 'markdown') {
        blocks[blocks.length - 1] = { type: 'markdown', data: last.data + chunk.data }
      } else {
        finishThinking()
        blocks.push({ type: 'markdown', data: chunk.data })
      }
    } else if (last?.type === 'thinking') {
      blocks[blocks.length - 1] = {
        type: 'thinking',
        data: {
          title: chunk.data.title ?? last.data.title,
          text: (last.data.text ?? '') + (chunk.data.text ?? ''),
        },
        status: chunk.status ?? (last.status === 'complete' ? 'complete' : 'streaming'),
      }
    } else {
      blocks.push({ type: 'thinking', data: { ...chunk.data }, status: chunk.status ?? 'streaming' })
    }
  }

  function snapshot(status: ChatMessageStatus): ChatStreamContent[] {
    if (status !== 'pending' && status !== 'streaming') {
      finishThinking()
      blocks.forEach((block, index) => {
        if (block.type === 'toolcall' && (block.status === 'executing' || block.status === 'awaiting-input')) {
          blocks[index] = { ...block, status: 'stop' }
        }
      })
    }
    return status === 'complete' && suggestions ? [...blocks, suggestions] : blocks.slice()
  }

  function hasAwaitingInput() {
    return blocks.some(block => block.type === 'toolcall' && block.status === 'awaiting-input')
  }

  function isAwaitingInput(block: ChatToolCallContent) {
    return block.status === 'awaiting-input' && blocks.includes(block)
  }

  return { append, snapshot, hasAwaitingInput, isAwaitingInput }
}
