export interface SSEFrame {
  event: string
  data: string
  id: string
}

export async function readEventStream(
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onEvent: (frame: SSEFrame) => void | false,
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  const data: string[] = []
  let event = ''
  let id = ''
  let partialLine = ''
  let previousCR = false
  let ended = false

  function processLine(line: string) {
    if (line === '') {
      if (data.length) {
        const result = onEvent({ event: event || 'message', data: data.join('\n'), id })
        signal.throwIfAborted()
        if (result === false) return false
      }
      data.length = 0
      event = ''
      return
    }

    const colon = line.indexOf(':')
    if (colon === 0) return
    const field = colon < 0 ? line : line.slice(0, colon)
    let value = colon < 0 ? '' : line.slice(colon + 1)
    if (value.startsWith(' ')) value = value.slice(1)
    switch (field) {
      case 'data':
        data.push(value)
        break
      case 'event':
        event = value
        break
      case 'id':
        if (!value.includes('\0')) id = value
        break
    }
  }

  function cancel() {
    void reader.cancel(signal.reason).catch(() => {})
  }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    signal.throwIfAborted()
    while (true) {
      const { value, done } = await reader.read()
      signal.throwIfAborted()
      if (done) {
        // 只有空行能结束事件，EOF 时丢弃还在缓冲的行与数据。
        ended = true
        return
      }
      let chunk = decoder.decode(value, { stream: true })
      if (!chunk) continue
      // CR 本身即可结束行。若下块以 LF 开始，它属于同一个换行符。
      if (previousCR && chunk.startsWith('\n')) chunk = chunk.slice(1)
      previousCR = chunk.endsWith('\r')
      let start = 0
      for (const match of chunk.matchAll(/\r\n|[\r\n]/g)) {
        if (processLine(partialLine + chunk.slice(start, match.index)) === false) return
        partialLine = ''
        start = match.index + match[0].length
      }
      partialLine += chunk.slice(start)
    }
  } finally {
    signal.removeEventListener('abort', cancel)
    if (!ended) cancel()
    reader.releaseLock()
  }
}
