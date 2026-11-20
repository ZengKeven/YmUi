import { expect, test } from '@playwright/test'

test('every component page lists the five documentation sections in order', async ({ page }) => {
  await page.goto('/button/')
  const menu = page.locator('#VPSidebarNav').getByRole('link')
  await expect(menu.first()).toBeVisible()
  const paths = await menu.evaluateAll(links => links.map(link => (link as HTMLAnchorElement).pathname))
  const outline = page.getByRole('navigation', { name: '本页目录' })
  for (const path of paths) {
    await page.goto(path)
    await expect(outline.getByRole('link')).toHaveText(['交互示例', '属性', '事件', '插槽', '使用指南'])
  }
})

test('theme settings carry between component pages and respect local overrides', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/button/')
  const primary = page.getByRole('button', { name: '主要', exact: true })
  const white = 'rgb(255, 255, 255)'
  await page.getByText('全局设置', { exact: true }).click()
  const swatches = [
    ['主要', 'rgb(0, 110, 255)'], ['成功', 'rgb(10, 191, 91)'],
    ['危险', 'rgb(229, 69, 69)'], ['警告', 'rgb(255, 114, 0)'],
  ] as const
  const modes = [
    { mode: 'auto', surface: 'rgb(24, 27, 32)', text: white },
    { mode: 'dark', surface: 'rgb(24, 27, 32)', text: white },
    { mode: 'light', surface: white, text: 'rgb(35, 40, 49)' },
  ] as const
  for (const { mode, surface, text } of modes) {
    await page.getByRole('combobox', { name: '显示模式' }).selectOption(mode)
    await expect(page.locator('.playground')).toHaveCSS('background-color', surface)
    await expect(page.locator('.playground')).toHaveCSS('color', text)
    await expect(page.getByRole('button', { name: '默认', exact: true })).toHaveCSS('color', text)
    await expect(page.getByRole('button', { name: '确定', exact: true }).locator('.ym-button__text')).toHaveCSS('color', white)
    await expect(page.getByRole('button', { name: '添加一次' }).locator('.ym-button__icon')).toHaveCSS('color', white)
    for (const [name, color] of swatches) {
      const button = page.getByRole('button', { name, exact: true })
      await expect(button).toHaveCSS('background-color', color)
      await expect(button.locator('.ym-button__text')).toHaveCSS('color', white)
    }
  }
  await expect(page.getByLabel('浅色品牌色')).toHaveValue('#006eff')
  await expect(page.getByLabel('深色品牌色')).toHaveValue('#006eff')
  await page.getByLabel('浅色品牌色').fill('#34652e')
  await expect(primary).toHaveCSS('background-color', 'rgb(52, 101, 46)')
  await page.getByLabel('默认尺寸').selectOption('large')
  await expect(primary).toHaveCSS('height', '40px')
  await expect(page.getByRole('button', { name: '中', exact: true })).toHaveCSS('height', '32px')
  await page.getByRole('slider').fill('14')
  await expect(primary).toHaveCSS('border-radius', '14px')
  await page.getByRole('button', { name: '添加一次' }).click()
  await expect(page.getByText('已点击 1 次')).toBeVisible()
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'ConfigProvider 全局配置' }).click()
  const save = page.locator('.demo-canvas').getByRole('button', { name: '保存' })
  await expect(save).toHaveCSS('background-color', 'rgb(52, 101, 46)')
  await expect(save).toHaveCSS('border-radius', '14px')
  await expect(save).toHaveCSS('height', '40px')
  const local = page.getByRole('button', { name: '局部小尺寸' })
  await expect(local).toHaveCSS('height', '24px')
  await expect(local).toHaveCSS('border-radius', '0px')
  await expect(page.getByRole('button', { name: '显式大尺寸' })).toHaveCSS('height', '40px')
  await expect(page.getByRole('button', { name: '胶囊形状' })).toHaveCSS('border-radius', '9999px')
  await page.getByRole('combobox', { name: '显示模式' }).selectOption('dark')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmLoading 加载' }).click()
  await expect(page.locator('.demo-canvas').getByRole('status')).toHaveCSS('color', white)
})

test('desktop navigation opens Markdown pages, section links and working Vapor demos', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('/')
  await expect(page).toHaveURL(/\/button\/$/)
  const menu = page.locator('#VPSidebarNav')
  const buttonPage = menu.getByRole('link', { name: 'YmButton 按钮' })
  await expect(buttonPage).toHaveAttribute('aria-current', 'page')
  await buttonPage.hover()
  await expect(buttonPage.locator('.text')).toHaveCSS('color', 'rgb(255, 255, 255)')
  const preview = page.locator('.demo-canvas').getByRole('button', { name: '确定' })
  await page.getByRole('checkbox', { name: 'disabled', exact: true }).check()
  await expect(preview).toBeDisabled()
  await page.getByRole('checkbox', { name: 'disabled', exact: true }).uncheck()
  await page.getByRole('combobox', { name: 'theme', exact: true }).selectOption('success')
  await expect(preview).toHaveAttribute('data-theme', 'success')
  await page.getByRole('combobox', { name: 'size', exact: true }).selectOption('large')
  await expect(preview).toHaveCSS('height', '40px')
  await page.getByRole('link', { name: '禁用链接' }).dispatchEvent('click')
  await expect(page).toHaveURL(/\/button\/$/)
  await expect(page.getByRole('navigation', { name: '组件详情快捷导航' })).toHaveCount(0)
  const outline = page.getByRole('navigation', { name: '本页目录' })
  await outline.getByRole('link', { name: '属性', exact: true }).click()
  await expect(page).toHaveURL('/button/#属性')
  const propsHeading = page.locator('h2#属性')
  await expect(propsHeading).toBeInViewport()
  await page.reload()
  await expect(propsHeading).toBeVisible()
  await menu.getByRole('link', { name: 'YmLoading 加载' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'YmLoading 加载' })).toBeVisible()
  const loading = page.locator('.demo-canvas').getByRole('status')
  await page.getByRole('textbox', { name: 'text', exact: true }).fill('同步中')
  await expect(loading).toHaveText('同步中')
  await page.getByRole('checkbox', { name: '显示遮罩' }).check()
  await expect(page.locator('.demo-row').getByRole('status')).toHaveText('正在加载')
  await page.goBack()
  await expect(buttonPage).toHaveAttribute('aria-current', 'page')
  await expect(page).toHaveURL('/button/#属性')
  expect(errors).toEqual([])
})

test('the layout preview keeps its sidebar controls and brand in sync', async ({ page }) => {
  await page.goto('/button/')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmLayout 布局' }).click()
  await expect(page).toHaveURL('/layout/')
  const preview = page.locator('.demo-canvas')
  const collapsed = page.getByRole('checkbox', { name: '收起侧栏' })
  const name = preview.getByText('采购管理', { exact: true })
  await page.getByRole('textbox', { name: '系统名称' }).fill('采购管理')
  await expect(name).toBeVisible()
  await preview.getByRole('button', { name: '收起侧栏' }).click()
  await expect(collapsed).toBeChecked()
  await expect(name).toBeHidden()
  await page.getByRole('combobox', { name: '顶栏高度' }).selectOption({ label: '64 px' })
  await expect(preview.locator('aside')).toHaveCSS('width', '48px')
  await page.getByRole('combobox', { name: '收起宽度' }).selectOption({ label: '72 px' })
  await expect(preview.locator('aside')).toHaveCSS('width', '72px')
  await expect(preview.locator('header')).toHaveCSS('height', '64px')
  await expect(preview.locator('.ym-layout__brand')).toHaveCSS('height', '64px')
  await collapsed.uncheck()
  await expect(name).toBeVisible()
})

test('the menu preview selects pages from the collapsed layout sidebar', async ({ page }) => {
  await page.goto('/button/')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmMenu 导航菜单' }).click()
  await expect(page).toHaveURL('/menu/')
  const demo = page.locator('.demo-canvas')
  await page.getByRole('checkbox', { name: '收起侧栏' }).check()
  await expect(demo.locator('nav > ul')).toHaveCSS('padding-inline-start', '0px')
  await demo.getByRole('button', { name: '采购管理' }).hover()
  await demo.getByRole('button', { name: '采购订单' }).click()
  await expect(demo.locator('output')).toHaveText('采购订单')
  await demo.getByRole('button', { name: '展开侧栏' }).click()
  await expect(demo.getByText('采购管理', { exact: true })).toBeVisible()
})

test('the pagination demo updates its record range when navigating and resizing pages', async ({ page }) => {
  await page.goto('/button/')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmPagination 分页' }).click()
  await expect(page).toHaveURL('/pagination/')
  const demo = page.locator('.demo-canvas')
  const range = demo.locator('output')
  await expect(range).toHaveText('显示第 1–10 条')
  await demo.getByRole('button', { name: '尾页' }).click()
  await expect(range).toHaveText('显示第 131–137 条')
  await demo.getByRole('combobox', { name: '每页条数' }).selectOption('50')
  await expect(range).toHaveText('显示第 101–137 条')
  await page.getByRole('combobox', { name: '总条数' }).selectOption('0')
  await expect(range).toHaveText('暂无记录')
  await expect(demo.getByRole('button', { name: '下一页' })).toBeDisabled()
})

test('the space preview changes direction, gaps and separators from its controls', async ({ page }) => {
  await page.goto('/button/')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmSpace 间距' }).click()
  await expect(page).toHaveURL('/space/')
  const space = page.locator('.demo-canvas .ym-space')
  await expect(space.getByText('质量验收')).toBeVisible()
  await page.getByRole('combobox', { name: '间距', exact: true }).selectOption('pair')
  await expect(space).toHaveCSS('gap', '8px 24px')
  await page.getByRole('combobox', { name: '分隔符' }).selectOption('icon')
  await expect(space.locator('svg[data-name="chevron-right"]')).toHaveCount(2)
  await page.getByRole('combobox', { name: '排列方向' }).selectOption('vertical')
  await expect(space).toHaveCSS('flex-direction', 'column')
  await page.getByRole('combobox', { name: '分隔符' }).selectOption('none')
  await expect(space.locator('.ym-space__separator')).toHaveCount(0)
})

test('the icon gallery previews the user icon and switches glyphs, size and color', async ({ page }) => {
  await page.goto('/button/')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmIcon 图标' }).click()
  await expect(page).toHaveURL('/icon/')
  const preview = page.locator('.demo-canvas').getByRole('img')
  await expect(preview).toHaveAccessibleName('用户／个人中心')
  await expect(preview).toHaveAttribute('data-name', 'user')
  const galleryIcon = page.locator('.icon-tile svg').first()
  await expect(galleryIcon).toHaveCSS('width', '30px')
  await page.getByRole('button', { name: '加载中 · loading' }).click()
  await expect(preview).toHaveAccessibleName('加载中')
  const size = page.getByRole('combobox', { name: 'size', exact: true })
  for (const value of ['16px', '20px', '32px']) {
    await size.selectOption(value)
    await expect(preview).toHaveCSS('width', value)
    await expect(galleryIcon).toHaveCSS('width', value)
  }
  await size.selectOption({ label: '继承' })
  await expect(galleryIcon).toHaveCSS('width', '16px')
  await page.getByRole('combobox', { name: 'color', exact: true }).selectOption('var(--ym-color-success)')
  await expect(preview.locator('path')).toHaveCSS('fill', 'rgb(10, 191, 91)')
  await page.getByRole('combobox', { name: 'name', exact: true }).selectOption('add')
  await expect(preview).toHaveAccessibleName('新增')
})

test('all icon silhouettes use their optical size and leave room around the painted edges', async ({ page }) => {
  await page.goto('/icon/')
  const gallery = page.locator('.icon-tile svg')
  await expect(gallery).toHaveCount(208)
  const invalid = await gallery.evaluateAll(async icons => {
    // 将实际 SVG 放大四倍绘制，包含方形端点、转角和实色细节。
    const scale = 4
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 24 * scale
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    const invalid: string[] = []
    for (const icon of icons) {
      const name = icon.getAttribute('data-name')!
      const svg = icon.cloneNode(true) as SVGSVGElement
      svg.setAttribute('width', String(canvas.width))
      svg.setAttribute('height', String(canvas.height))
      const image = new Image()
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg))
      await image.decode()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(image, 0, 0)
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      let left = canvas.width, right = -1, top = canvas.height, bottom = -1
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (data[(y * canvas.width + x) * 4 + 3] < 48) continue
          left = Math.min(left, x)
          right = Math.max(right, x)
          top = Math.min(top, y)
          bottom = Math.max(bottom, y)
        }
      }
      const longEdge = (Math.max(right - left, bottom - top) + 1) / scale
      const padding = Math.min(left, top, canvas.width - 1 - right, canvas.height - 1 - bottom) / scale
      const compact = /^(arrow-|chevron-)|^(add|minus|close|more|drag-handle|minimize)$/.test(name)
      if (longEdge < (compact ? 18 : 21.5) || longEdge > 22.5 || padding < 0.75) invalid.push(name)
    }
    return invalid
  })
  expect(invalid).toEqual([])
})

test('the confirmed icon catalog renders in category order and can be searched in both languages', async ({ page }) => {
  await page.goto('/icon/')
  const groups = page.locator('.icon-group')
  const categories = ['系统通用', '常用工具', '后台操作', '一级菜单', '行业后台']
  await expect(groups).toHaveCount(categories.length)
  const catalog = await groups.evaluateAll(sections => sections.map(section => ({
    category: section.getAttribute('aria-label'),
    names: Array.from(section.querySelectorAll('svg'), svg => svg.dataset.name),
  })))
  expect(catalog.map(group => group.category)).toEqual(categories)
  expect(catalog.map(group => group.names.length)).toEqual([100, 54, 25, 13, 16])
  expect(new Set(catalog.flatMap(group => group.names)).size).toBe(208)

  const search = page.getByRole('searchbox', { name: '查找图标' })
  await search.fill('打印')
  await expect(groups).toHaveCount(1)
  await expect(groups.getByRole('button')).toHaveCount(5)
  await search.fill('WAREHOUSE')
  await expect(groups).toHaveCount(2)
  await groups.getByRole('button', { name: '库区 · warehouse-zone' }).click()
  await expect(page.locator('.demo-canvas').getByRole('img')).toHaveAccessibleName('库区')
  await search.fill('not-an-icon')
  await expect(page.locator('.icon-gallery').getByRole('status')).toHaveText('没有匹配的图标')
  await search.fill('')
  await expect(groups).toHaveCount(5)
})

test('existing demo anchors and local search link to the requested content', async ({ page }) => {
  await page.goto('/#form-demo')
  await expect(page).toHaveURL(/\/button\/#form-demo$/)
  await expect(page.getByRole('button', { name: '模拟保存' })).toBeInViewport()
  await page.getByRole('button', { name: '搜索文档' }).click()
  await page.getByRole('searchbox').fill('YmLoading')
  await page.getByRole('option', { name: 'YmLoading 加载 > 属性', exact: true }).click()
  await expect(page).toHaveURL('/loading/#属性')
  await expect(page.locator('h2#属性')).toBeInViewport()
})

test('the mobile component menu opens, follows a link and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/button/')
  const toggle = page.getByRole('button', { name: '组件目录' })
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.locator('#VPSidebarNav').getByRole('link', { name: 'YmLoading 加载' }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page).toHaveURL(/\/loading\/$/)
  await expect(page.locator('.demo-canvas').getByRole('status')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
