import { computed, nextTick, onScopeDispose, ref, shallowReactive, shallowRef, toRaw, useId, watchEffect, type EmitFn, type Ref } from 'vue'
import { acceptsFile, finishFile, maxBytes, requestFile, toUploadFile } from './request'
import type { SharedUploadProps, UploadFile, UploadFileEvent, UploadValidation } from './types'

export type UploadEvents = {
  'update:modelValue': [files: UploadFile[]]
  change: [files: UploadFile[]]
  remove: [context: UploadFileEvent]
  success: [context: UploadFileEvent]
  fail: [context: UploadFileEvent]
  progress: [context: { file: UploadFile; percent: number }]
  validate: [context: UploadValidation]
}

interface UploadBehavior {
  acceptsFile?: (file: File, accept: string) => boolean
  replaceSingle?: boolean
  noun?: '图片' | '文件'
}

export function useUpload(props: SharedUploadProps, emit: EmitFn<UploadEvents>, input: Readonly<Ref<HTMLInputElement | null>>, behavior: UploadBehavior = {}) {
  const local = shallowRef<UploadFile[]>(props.defaultValue?.slice() ?? [])
  const files = computed(() => props.modelValue ?? local.value)
  const limit = computed(() => props.multiple ? props.max || Infinity : 1)
  const replace = computed(() => !props.multiple && behavior.replaceSingle !== false)
  const canChoose = computed(() => replace.value || files.value.length < limit.value)
  const configured = computed(() => !!(props.requestMethod || props.action))
  const message = ref('')
  const dragDepth = ref(0)
  const accepts = behavior.acceptsFile ?? acceptsFile
  const noun = behavior.noun ?? '文件'
  const prefix = useId()
  let sequence = 0
  const identities = new WeakMap<object, string>()
  function keyFor(file: UploadFile) {
    if (file.id != null) return 'id-' + file.id
    const identity = toRaw(file.raw ?? file)
    let key = identities.get(identity)
    if (!key) {
      key = 'file-' + ++sequence
      identities.set(identity, key)
    }
    return key
  }

  const jobs = shallowReactive(new Map<string, { controller: AbortController; raw: File; initialStatus: UploadFile['status']; percent: number }>())
  const entries = computed(() => {
    const visible = props.multiple ? files.value : files.value.slice(0, 1)
    return visible.map(file => {
      const key = keyFor(file)
      const job = jobs.get(key)
      return { file, key, status: job ? 'progress' as const : file.status, percent: job?.percent ?? file.percent ?? 0 }
    })
  })
  const waiting = computed(() => entries.value.filter(({ file, status }) => file.raw && (status === 'waiting' || status === 'fail')))
  const canUpload = computed(() => configured.value && waiting.value.length > 0)

  function cancel(key: string) {
    const job = jobs.get(key)
    jobs.delete(key)
    job?.controller.abort()
  }
  watchEffect(() => {
    if (!jobs.size) return
    const current = new Map(files.value.map(file => [keyFor(file), file]))
    for (const [key, job] of jobs) {
      const file = current.get(key)
      if (!file || file.raw !== job.raw || file.status !== job.initialStatus) cancel(key)
    }
  })
  let disposed = false
  onScopeDispose(() => {
    disposed = true
    for (const key of jobs.keys()) cancel(key)
  })

  function publish(next: UploadFile[]) {
    if (props.modelValue === undefined) local.value = next
    emit('update:modelValue', next)
    emit('change', next)
  }

  // 并发请求可能在同一轮完成，逐次等待父级应用 v-model 后再合并结果。
  let commits = Promise.resolve()
  async function upload(file: UploadFile) {
    const key = keyFor(file)
    if (disposed || props.disabled || !file.raw || !configured.value || jobs.has(key)) return
    const job = shallowReactive({ controller: new AbortController(), raw: file.raw, initialStatus: file.status, percent: 0 })
    jobs.set(key, job)
    const result = await requestFile(file, props, {
      signal: job.controller.signal,
      onProgress(percent) {
        if (jobs.get(key) !== job) return
        job.percent = percent
        emit('progress', { file: { ...file, status: 'progress', percent }, percent })
      },
    })
    commits = commits.then(async () => {
      await nextTick()
      if (jobs.get(key) !== job) return
      jobs.delete(key)
      const index = files.value.findIndex(item => keyFor(item) === key && item.raw === job.raw)
      if (index < 0) return
      const updated = finishFile(files.value[index], result, job.percent)
      const next = files.value.slice()
      next[index] = updated
      publish(next)
      const event = { file: updated, index }
      if (updated.status === 'fail') emit('fail', event)
      else emit('success', event)
    })
    return commits
  }

  function uploadFiles() {
    return Promise.all(waiting.value.map(({ file }) => upload(file)))
  }

  async function select(selection: File[]) {
    if (props.disabled || !selection.length) return
    const base = replace.value ? [] : files.value
    const added: UploadFile[] = []
    message.value = ''
    for (const raw of selection) {
      let reason: UploadValidation['reason'] | undefined
      if (!accepts(raw, props.accept ?? '')) reason = 'type'
      else if (raw.size > maxBytes(props.sizeLimit)) reason = 'size'
      else if (base.length + added.length >= limit.value) reason = 'max'
      if (reason) {
        if (reason === 'max') message.value = `最多可选择 ${limit.value} ${noun === '图片' ? '张图片' : '个文件'}`
        else message.value = raw.name + (reason === 'type' ? ` 的${noun}格式不支持` : ' 超过大小限制')
        emit('validate', { file: raw, reason })
        continue
      }
      added.push({ ...toUploadFile(raw), id: `${prefix}-${++sequence}` })
    }
    if (!added.length) return
    publish([...base, ...added])
    await nextTick()
    if (props.autoUpload && configured.value) {
      const keys = new Set(added.map(keyFor))
      for (const file of files.value) {
        if (keys.has(keyFor(file)) && file.status === 'waiting') void upload(file)
      }
    }
  }

  function choose() {
    if (!props.disabled && canChoose.value) input.value?.click()
  }
  function changeInput(event: Event) {
    const field = event.currentTarget as HTMLInputElement
    const selection = Array.from(field.files ?? [])
    field.value = ''
    void select(selection)
  }
  function remove(file: UploadFile, index: number) {
    if (props.disabled) return
    message.value = ''
    publish(files.value.filter((_, i) => i !== index))
    emit('remove', { file, index })
  }
  function dragEvent(event: DragEvent) {
    if (!props.draggable || !event.dataTransfer?.types.includes('Files')) return
    event.preventDefault()
    if (props.disabled) return
    if (event.type === 'dragenter') dragDepth.value++
    if (event.type === 'dragleave') dragDepth.value = Math.max(0, dragDepth.value - 1)
    if (event.type === 'drop') {
      dragDepth.value = 0
      void select(Array.from(event.dataTransfer.files))
    }
  }
  return {
    files, entries, limit, configured, canChoose, canUpload, message, dragDepth, keyFor,
    upload, uploadFiles, choose, changeInput, dragEvent, remove,
  }
}
