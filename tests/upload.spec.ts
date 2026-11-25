import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    uploadForTest: typeof import('ym-ui-vapor').uploadFiles
  }
}

const file = (name: string, mimeType: string, content = 'sample') => ({
  name, mimeType, buffer: Buffer.from(content),
})

test.beforeEach(async ({ page }) => {
  await page.goto('/tests/fixture/upload.html')
})

test('single selection validates before replacing an active upload and ignores its late response', async ({ page }) => {
  const single = page.locator('#single')
  const input = single.locator('input[type=file]')
  const selection = single.locator('output')
  const events = page.locator('#events')
  await expect(input).not.toHaveAttribute('multiple')
  const chooser = page.waitForEvent('filechooser')
  await single.getByRole('button', { name: '上传文件' }).press('Enter')
  await (await chooser).setFiles(file('first.csv', 'text/csv'))
  await expect(events).toContainText('start first.csv')
  await expect(single.getByRole('button', { name: '重新选择' })).toBeEnabled()
  await input.setInputFiles(file('wrong.txt', 'text/plain'))
  await expect(events).toContainText('invalid wrong.txt type')
  await input.setInputFiles(file('large.csv', 'text/csv', 'x'.repeat(21)))
  await expect(events).toContainText('invalid large.csv size')
  await expect(selection).toContainText('first.csv')
  await expect(events).not.toContainText('abort first.csv')
  await input.setInputFiles(file('second.csv', 'text/csv'))
  await expect(events).toContainText('abort first.csv')
  await expect(events).toContainText('start second.csv')
  await page.getByRole('button', { name: '完成新文件' }).click()
  await expect(single.getByRole('link', { name: 'second.csv' })).toHaveAttribute('href', '/documents/second.csv')
  await page.getByRole('button', { name: '完成旧文件' }).click()
  await expect(selection).toHaveText('second.csv:success')
  await expect(events).not.toContainText('success first.csv')
  const controlled = page.locator('#controlled')
  await controlled.locator('input[type=file]').setInputFiles(file('rejected.txt', 'text/plain'))
  await expect(controlled.getByRole('link', { name: 'approved.pdf' })).toBeVisible()
  await expect(events).not.toContainText('start rejected.txt')
})

test('multiple selection appends arbitrary files, limits capacity and retries individual manual uploads', async ({ page }) => {
  const multiple = page.locator('#multiple')
  const input = multiple.locator('input[type=file]')
  const add = multiple.getByRole('button', { name: '上传文件', exact: true })
  const events = page.locator('#events')
  await expect(input).toHaveAttribute('multiple')
  await input.setInputFiles(file('note.txt', 'text/plain'))
  const transfer = await page.evaluateHandle(() => {
    const drop = new DataTransfer()
    drop.items.add(new File(['%PDF'], 'brief.pdf', { type: 'application/pdf' }))
    drop.items.add(new File(['archive'], 'extra.zip', { type: 'application/zip' }))
    return drop
  })
  await multiple.locator('.ym-upload').dispatchEvent('drop', { dataTransfer: transfer })
  await transfer.dispose()
  await expect(multiple.locator('output')).toHaveText('note.txt:waiting,brief.pdf:waiting')
  await expect(events).toContainText('invalid extra.zip max')
  await expect(add).toBeDisabled()
  await expect(events).not.toContainText('start ')
  await multiple.getByRole('button', { name: '开始上传' }).click()
  await expect(events).toContainText('progress note.txt 25')
  await expect(events).toContainText('progress brief.pdf 25')
  await page.getByRole('button', { name: '文档成功' }).click()
  await page.getByRole('button', { name: '文本失败' }).click()
  await expect(multiple.locator('output')).toHaveText('note.txt:fail,brief.pdf:success')
  await multiple.getByRole('button', { name: '重试 note.txt' }).click()
  await page.getByRole('button', { name: '文本成功' }).click()
  await expect(multiple.locator('output')).toHaveText('note.txt:success,brief.pdf:success')
  await multiple.getByRole('button', { name: '删除 brief.pdf' }).click()
  await expect(events).toContainText('remove brief.pdf 1')
  await expect(add).toBeEnabled()
  await page.getByLabel('禁用多选').check()
  await expect(input).toBeDisabled()
  await expect(add).toBeDisabled()
  await expect(multiple.getByRole('button', { name: '删除 note.txt', disabled: false })).toHaveCount(0)
})

test('the standalone single-file upload sends the original bytes and maps the response', async ({ page }) => {
  await page.route('**/api/file-case', route => route.fulfill({ json: { download: '/downloads/part.bin' } }))
  const sending = page.waitForRequest('**/api/file-case')
  const completed = page.evaluate(async () => {
    const source = new File([new Uint8Array([0, 1, 254, 255])], 'part.bin', { type: 'application/octet-stream' })
    const results = await window.uploadForTest(source, {
      action: '/api/file-case', name: 'attachment', headers: { 'X-File-Case': 'package-api' },
      formatResponse: body => ({ url: (body as { download: string }).download }),
    })
    return results.map(item => ({ name: item.name, status: item.status, url: item.url, original: item.raw === source }))
  })
  const request = await sending
  expect(request.method()).toBe('POST')
  expect(request.headers()['x-file-case']).toBe('package-api')
  const multipart = await new Response(new Uint8Array(request.postDataBuffer()!), {
    headers: { 'Content-Type': request.headers()['content-type'] },
  }).formData()
  const uploaded = multipart.get('attachment') as File
  expect(uploaded.name).toBe('part.bin')
  expect(Array.from(new Uint8Array(await uploaded.arrayBuffer()))).toEqual([0, 1, 254, 255])
  expect(await completed).toEqual([{ name: 'part.bin', status: 'success', url: '/downloads/part.bin', original: true }])
})

test('standalone batch results preserve input order and report each independent failure', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const sources = ['slow.dat', 'failed.dat', 'broken.dat'].map(name => new File([name], name))
    const progress: string[] = []
    let release!: () => void
    const slower = new Promise<void>(resolve => { release = resolve })
    const rows = await window.uploadForTest(sources, {
      onProgress: (item, percent) => progress.push(item.name + ':' + percent),
      async requestMethod(item, context) {
        context.onProgress(45)
        if (item.name === 'failed.dat') return { status: 'fail', error: 'quota' }
        if (item.name === 'broken.dat') {
          release()
          throw new Error('offline')
        }
        await slower
        return { status: 'success', response: { url: '/files/slow' } }
      },
    })
    return {
      progress: progress.sort(), originals: rows.every((row, i) => row.raw === sources[i]),
      rows: rows.map(row => [row.name, row.status, row.response?.error ?? row.url]),
    }
  })
  expect(result.originals).toBe(true)
  expect(result.progress).toEqual(['broken.dat:45', 'failed.dat:45', 'slow.dat:45'])
  expect(result.rows).toEqual([
    ['slow.dat', 'success', '/files/slow'], ['failed.dat', 'fail', 'quota'], ['broken.dat', 'fail', 'offline'],
  ])
})

test('the standalone API handles an empty selection and propagates cancellation to in-flight requests', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const source = new File(['content'], 'notes.txt')
    const empty = await window.uploadForTest([], {})
    const unconfigured = await window.uploadForTest(source, {}).then(() => 'resolved', () => 'rejected')
    const controller = new AbortController()
    let ready!: () => void
    const started = new Promise<void>(resolve => { ready = resolve })
    let cancelled = false
    const operation = window.uploadForTest(source, {
      signal: controller.signal,
      requestMethod: (_, { signal }) => new Promise(resolve => {
        signal.addEventListener('abort', () => {
          cancelled = true
          resolve({ status: 'success' })
        }, { once: true })
        ready()
      }),
    })
    await started
    controller.abort()
    const outcome = await operation.then(() => 'resolved', error => error.name)
    return { empty, cancelled, outcome, unconfigured }
  })
  expect(result).toEqual({ empty: [], cancelled: true, outcome: 'AbortError', unconfigured: 'rejected' })
})

test('upload controls follow nested size, palette, mode and radius and support a local size', async ({ page }) => {
  const inherited = page.locator('#inherited .ym-upload__trigger')
  const override = page.locator('#override .ym-upload__trigger')
  await expect(override).toHaveText('添加单据')
  await expect(override).toHaveCSS('height', '20px')
  await expect(inherited).toHaveCSS('height', '40px')
  await expect(inherited).toHaveCSS('border-radius', '9px')
  await expect(inherited).toHaveCSS('border-top-color', 'rgb(38, 76, 124)')
  await expect(inherited).toHaveCSS('background-color', 'rgb(242, 246, 250)')
  await page.getByLabel('强调色').fill('#ba2942')
  await expect(inherited).toHaveCSS('border-top-color', 'rgb(186, 41, 66)')
  await page.getByLabel('深色', { exact: true }).check()
  await expect(inherited).toHaveCSS('background-color', 'rgb(40, 34, 56)')
  await expect(inherited).toHaveCSS('border-top-color', 'rgb(209, 195, 250)')
  await page.getByLabel('小尺寸直角').check()
  await expect(inherited).toHaveCSS('height', '24px')
  await expect(inherited).toHaveCSS('border-radius', '0px')
  await expect(override).toHaveCSS('height', '20px')
})
