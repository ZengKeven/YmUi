import { isToolCallValue, type ChatToolCallMessage } from '../../chat-engine'
import { copyToolValue, type createReplyContent } from '../../chat-engine/reply-content'
import type { ChatToolCallContent, ChatToolCallRendererProps } from '../chat-message'

/** 在同一轮中串行发送选择，首个流结束前的点击也会保留。 */
export function createToolResponses(reply: ReturnType<typeof createReplyContent>, isCurrent: () => boolean,
  publish: () => void) {
  const choices: ChatToolCallMessage[] = []
  let wake: (() => void) | undefined

  function getResponder(block: ChatToolCallContent): ChatToolCallRendererProps['respond'] {
    const { toolCallId, toolCallName } = block.data
    if (!toolCallName || !reply.isAwaitingInput(block)) return
    return value => {
      if (!isCurrent() || !reply.isAwaitingInput(block) || !isToolCallValue(value)) return
      const choice = { toolCallId, toolCallName, result: copyToolValue(value) }
      choices.push(choice)
      reply.append({ type: 'toolcall', status: 'complete', data: choice })
      wake?.()
      publish()
    }
  }

  async function next(stopped: Promise<void>) {
    if (isCurrent() && !choices.length && reply.hasAwaitingInput()) {
      await Promise.race([new Promise<void>(resolve => { wake = resolve }), stopped])
      wake = undefined
    }
    if (isCurrent()) return choices.shift()
  }

  return { getResponder, next }
}
