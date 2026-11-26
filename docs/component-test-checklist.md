# YmUi 组件测试清单

本清单包含 41 个 Playground 组件文档页、7 个公开子组件和 3 个服务或函数，共 146 条用例。每条用例给出前置条件、操作、预期结果和自动化覆盖依据。 [包入口](../src/index.ts)

## 执行说明

1. 在仓库根目录运行 `npm run dev`，从终端显示的地址打开 Playground。按组件标题下的路由进入交互示例。除用例另有说明，使用本页默认状态，每条用例独立执行。
2. 用例提到「夹具」时，先运行 `npm run build`，再运行 `npx vite --host 127.0.0.1 --port 4186 --strictPort`。在 `http://127.0.0.1:4186` 下访问组件列出的夹具路径。通过链接中的测试代码查找触发器名称、请求模拟与事件断言。夹具需要模拟时间或网络时可直接运行对应 Playwright 测试。
3. 执行整套自动化测试用 `npm run test:browser`。执行单个文件可用 `npm run test:browser -- tests/button.spec.ts`。验收时按用例编号记录实际结果和备注。

| 覆盖状态 | 判定依据 |
| --- | --- |
| 已自动化 | 链接的现有测试断言了该用例的行为或等价配置。 |
| 部分自动化 | 链接的测试只断言了部分预期，剩余内容需要手工验收。 |
| 待手工验收 | 用例指定的行为需要按步骤执行并记录结果。 |

## 组件索引

| 分类 | 组件 |
| --- | --- |
| 基础组件 | [徽标](#ymbadge-徽标)、[按钮](#ymbutton-按钮)、[描述列表](#ymdescriptions-描述列表)、[图标](#ymicon-图标)、[图片](#ymimage-图片)、[布局](#ymlayout-布局)、[二维码](#ymqrcode-二维码)、[间距](#ymspace-间距)、[统计数值](#ymstatistic-统计数值)、[标签](#ymtag-标签) |
| 反馈组件 | [对话框](#ymdialog-对话框)、[加载](#ymloading-加载)、[全局提示](#ymmessage-全局提示)、[消息通知](#ymnotification-消息通知)、[浮层](#ympopup-浮层)、[进度条](#ymprogress-进度条)、[文字提示](#ymtooltip-文字提示) |
| 全局配置 | [全局配置](#configprovider-全局配置) |
| 表单组件 | [日历](#ymcalendar-日历)、[复选框](#ymcheckbox-复选框)、[颜色选择器](#ymcolorpicker-颜色选择器)、[日期选择器](#ymdatepicker-日期选择器)、[表单](#ymform-表单)、[图片上传](#ymimageupload-图片上传)、[输入框](#yminput-输入框)、[数字输入框](#yminputnumber-数字输入框)、[单选框](#ymradio-单选框)、[评分](#ymrate-评分)、[选择器](#ymselect-选择器)、[开关](#ymswitch-开关)、[多行文本框](#ymtextarea-多行文本框)、[时间选择器](#ymtimepicker-时间选择器)、[树选择器](#ymtreeselect-树选择器)、[文件上传](#ymupload-文件上传) |
| 导航组件 | [下拉操作菜单](#ymdropdown-下拉操作菜单)、[导航菜单](#ymmenu-导航菜单)、[分页](#ympagination-分页)、[步骤条](#ymsteps-步骤条)、[轮播框](#ymswiper-轮播框)、[选项卡](#ymtabs-选项卡)、[树形控件](#ymtree-树形控件) |

## 基础组件

### YmBadge 徽标

Playground 路由 `/badge/`，浏览器夹具 `/tests/fixture/badge.html`。 [组件文档](../src/components/badge/index.md) · [Playwright 测试](../tests/badge.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| BADGE-01 | 收件箱示例，关闭「圆点模式」 | 把「徽标内容」切到 128，「封顶数值」先设 99，再设 9。切换到 NEW 和 0 | 依次显示 99+、9+、NEW。计数为 0 时隐藏徽标，收件箱仍可见 | 已自动化 · [badge 测试](../tests/badge.spec.ts#L7)、[Playground 测试](../tests/playground.spec.ts#L201) |
| BADGE-02 | 「徽标内容」设为 0 | 打开「显示零值」，再打开「圆点模式」，最后关闭「显示零值」 | 依次显示 0、无文字的圆点、隐藏徽标 | 已自动化 · [badge 测试](../tests/badge.spec.ts#L7) |
| BADGE-03 | 设置 `offset=[0, 0]`，默认插槽放一个按钮 | 观察徽标位置，再将偏移改为 `[10, '-8px']` | 徽标中心最初与按钮右上角重合，改动后向左 10px、向上 8px | 已自动化 · [badge 测试](../tests/badge.spec.ts#L55) |
| BADGE-04 | Playground 关闭圆点模式，计数选 128，封顶数值为 99 | 切换「徽标形状」的胶囊和圆角矩形，再将徽标颜色设为「成功」 | 同一 `99+` 徽标在两端圆弧和圆角矩形之间切换，显式改色后背景使用成功色 | 部分自动化 · 已断言局部颜色和圆角覆盖，需比较两种形状。[badge 测试](../tests/badge.spec.ts#L68) |

### YmButton 按钮

Playground 路由 `/button/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/button/index.md) · [Playwright 测试](../tests/button.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| BUTTON-01 | 重新打开「插槽与交互」示例，计数为 0 | 连续点击两次「添加一次」 | 「已点击」依次显示 1 次、2 次 | 部分自动化 · 已断言首次点击。[Playground 测试](../tests/playground.spec.ts#L840) |
| BUTTON-02 | 预览按钮设为 `theme="primary"` | 依次切换 `base`、`outline`、`dashed`、`text`，再查看下方幽灵按钮 | 依次显示填充、实线描边、虚线描边和文字样式。幽灵按钮背景透明，预览按钮文案保持「确定」 | 待手工验收 |
| BUTTON-03 | 「原生表单」示例中保存计数为 0，聚焦「模拟保存」 | 按 Enter 启动保存，显示「保存中」时立刻再次点击并按 Enter | 加载状态保留焦点，保存结束后计数为 1，按钮恢复为「模拟保存」 | 部分自动化 · 已断言原生提交与加载时的焦点和拦截。[button 测试](../tests/button.spec.ts#L3) |
| BUTTON-04 | 在「尺寸与形状」查看四档尺寸和块级示例 | 比较 `rectangle`、`square`、`round`、`circle`，并查看块级按钮 | 矩形跟随全局圆角，方形和圆形等宽高，圆形为圆，胶囊两端为圆弧。块级按钮铺满所在行 | 待手工验收 |
| BUTTON-05 | 浏览器夹具加载链接 `#link` | 开启 `disabled` 并尝试激活链接，再关闭禁用并点击 | 禁用时地址和事件计数保持原值。恢复后跳转到 `#destination`，点击计数增加 1 | 已自动化 · [button 测试](../tests/button.spec.ts#L26) |
| BUTTON-06 | Playground 使用填充样式，指针移出按钮 | 依次切换默认、主要、成功、警告和危险，再用 Tab 聚焦按钮 | 各主题使用配置的语义色。键盘聚焦时有可见焦点环，按钮仍可激活 | 部分自动化 · 已断言主题的填充色和文字色，需验收键盘焦点环。[Playground 测试](../tests/playground.spec.ts#L840) |

### YmDescriptions 描述列表

Playground 路由 `/descriptions/`，浏览器夹具 `/tests/fixture/descriptions.html`。 [组件文档](../src/components/descriptions/index.md) · [Playwright 测试](../tests/descriptions.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| DESCRIPTIONS-01 | 浏览器夹具中使用默认两列的描述列表 | 查看供应商、机构和日期的标签和值 | 供应商文案对应「杭州青禾纸业有限公司」。供应商和机构同排，日期在下一排并与第一列对齐 | 已自动化 · [descriptions 测试](../tests/descriptions.spec.ts#L14) |
| DESCRIPTIONS-02 | 在 Playground 选择三列，把「供应商占列」设为两列、「供应商占行」设为两行 | 观察相邻项目的位置，再切到一列 | 供应商占两列两行，其右侧两行均可排入其他项。切成一列后占列限制为一列，列表没有横向溢出 | 已自动化 · [descriptions 测试](../tests/descriptions.spec.ts#L32) |
| DESCRIPTIONS-03 | 在 Playground 保留至少两列 | 把「标签宽度」切到 80 px 和 6 rem | 标签分别使用 80px 和 6rem。跨列项目的值区占满该项目扣除标签后的可用宽度 | 已自动化 · [descriptions 测试](../tests/descriptions.spec.ts#L68) |
| DESCRIPTIONS-04 | `YmDescriptionsItem` 同时设置标签属性、标签插槽和值内容，值插槽用按钮显示送货次数 | 点击按钮一次 | 使用插槽文字「送货次数」，值区按钮从「送货 0」变为「送货 1」 | 已自动化 · [descriptions 测试](../tests/descriptions.spec.ts#L114) |

### YmIcon 图标

Playground 路由 `/icon/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/icon/index.md) · [Playwright 测试](../tests/icon.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| ICON-01 | 先打开浏览器夹具，再启用离线模式，使用系统默认动效偏好 | 把图标名称从 `add` 改为 `user`、`loading`，再回到 `add` | 每个名称显示对应的内置 SVG。仅 `loading` 图案循环旋转 | 已自动化 · [icon 测试](../tests/icon.spec.ts#L3) |
| ICON-02 | 浏览器夹具全局尺寸为大号，勾选「命名图标」，图标尺寸为「继承」 | 查看操作图标尺寸，再依次选择 `small`、`28`、`2em` | 继承时图标宽 24px。显式尺寸分别为 14px、28px、32px | 已自动化 · [icon 测试](../tests/icon.spec.ts#L40) |
| ICON-03 | 浏览器夹具的图标点击计数为 0 | 点击绑定 `click` 的 SVG 一次 | 计数为 1，事件上下文包含原生 `MouseEvent` | 已自动化 · [icon 测试](../tests/icon.spec.ts#L40) |

### YmImage 图片

Playground 路由 `/image/`，浏览器夹具 `/tests/fixture/image.html`。 [组件文档](../src/components/image/index.md) · [Playwright 测试](../tests/image.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| IMAGE-01 | Playground 中图片已加载，关闭「点击预览」 | 点击图片，打开「点击预览」后点击同一张图，再按 Esc | 第一次点击时预览保持关闭。开启后显示同一张大图，Esc 关闭并把焦点还给预览触发器 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L538)、[image 测试](../tests/image.spec.ts#L14) |
| IMAGE-02 | Playground 中图片固定在 240px × 240px 的区域内 | 切换「填充方式」为「完整显示」和「裁剪填满」，再切换直角和圆形 | 完整显示保留整幅图，裁剪填满铺满区域。直角无圆角，等宽高的圆形示例显示为圆 | 部分自动化 · 已断言 cover 和局部形状。[image 测试](../tests/image.spec.ts#L14)、[image 测试](../tests/image.spec.ts#L130) |
| IMAGE-03 | 向 `src` 传入加载失败的地址，向 `fallback` 传入可加载的备用图片，开启预览 | 等备用图显示后打开预览，再让原图和备用图均加载失败 | 预览显示实际加载的备用图。两者加载均失败时显示失败内容，预览入口隐藏 | 已自动化 · [image 测试](../tests/image.spec.ts#L52)、[image 测试](../tests/image.spec.ts#L74) |

### YmLayout 布局

Playground 路由 `/layout/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/layout/index.md) · [Playwright 测试](../tests/layout.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| LAYOUT-01 | 浏览器夹具中的布局展开宽 232px，收起宽 56px，顶栏高 48px | 点击「收起侧栏」，再点击「展开侧栏」 | 侧栏宽度在 232px 和 56px 间切换，Logo 一直可见，系统名只在展开时显示。顶栏和主内容填满剩余空间 | 已自动化 · [layout 测试](../tests/layout.spec.ts#L18) |
| LAYOUT-02 | 父级绑定 `collapsed` 为 true 并记录更新请求 | 点击展开，先让父级忽略请求，再由父级设为 false | 收到一次值为 false 的请求。父级修改前保持收起，修改后展开 | 已自动化 · [layout 测试](../tests/layout.spec.ts#L58) |
| LAYOUT-03 | 启用水印，内容区可滚动且有可编辑控件 | 将水印第一行设为「内部资料」，第二行设为 `仓库 <A> & B`，滚动内容区并尝试编辑控件 | 两行按字面显示，水印始终覆盖主内容可视区，控件正常接收输入 | 已自动化 · [layout 测试](../tests/layout.spec.ts#L81)、[layout 测试](../tests/layout.spec.ts#L110) |

### YmQRCode 二维码

Playground 路由 `/qrcode/`，浏览器夹具 `/tests/fixture/qrcode.html`。 [组件文档](../src/components/qrcode/index.md) · [Playwright 测试](../tests/qrcode.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| QRCODE-01 | 扫码器可用，示例状态为「可扫描」 | 输入「采购单-二〇二六」，分别切换到 Canvas 和 SVG 并扫描 | 两种渲染均解码为「采购单-二〇二六」，二维码四周保留扫码留白 | 已自动化 · 解码断言需要浏览器支持 `BarcodeDetector`。[qrcode 测试](../tests/qrcode.spec.ts#L75)、[qrcode 测试](../tests/qrcode.spec.ts#L97) |
| QRCODE-02 | 浏览器夹具显示一张有效二维码 | 清空内容，点击「超长内容」填入 4000 个 `a`，再恢复有效短文本 | 依次提示「暂无二维码」「内容超出二维码容量」，两种状态均移除旧码。恢复有效内容后重新显示二维码 | 已自动化 · [qrcode 测试](../tests/qrcode.spec.ts#L112) |
| QRCODE-03 | Playground 的「扫码状态」设为「已过期」 | 点击「刷新」 | 过期提示消失，码面重新进入可扫描状态，保留原扫码内容 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L149) |

### YmSpace 间距

Playground 路由 `/space/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/space/index.md) · [Playwright 测试](../tests/space.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| SPACE-01 | 使用 Playground 的「间距」和「排列方向」 | 横向时设置「行 8px / 列 24px」并开启换行，在窄屏使子项折行。再切为垂直 | 横向换行后行距 8px、列距 24px。垂直排列时相邻项上下间距 8px | 已自动化 · [space 测试](../tests/space.spec.ts#L21) |
| SPACE-02 | 同一配置区的全局尺寸为中号，`YmSpace` 无显式尺寸 | 将全局改为大号，再给组件依次设置 `size="extra-small"` 和数字 `0` | 间距依次为 16px、24px、4px、0px | 已自动化 · [space 测试](../tests/space.spec.ts#L3) |
| SPACE-03 | 浏览器夹具的动态子项依次是「首项」「可选」「甲」「乙」，分隔符为 · | 在甲中输入「保留输入」，隐藏「可选」并反转甲乙顺序 | 显示「首项 · 乙 · 甲」，首尾没有多余分隔符，甲保留原输入 | 已自动化 · [space 测试](../tests/space.spec.ts#L41) |

### YmStatistic 统计数值

Playground 路由 `/statistic/`，浏览器夹具 `/tests/fixture/statistic.html`。 [组件文档](../src/components/statistic/index.md) · [Playwright 测试](../tests/statistic.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| STATISTIC-01 | `value` 设为 -1234567.895，保留默认分组 | 设置两位小数，再将千位分隔符改为下划线 | 先显示 -1,234,567.90，再显示 -1_234_567.90，负号和末尾的零保留 | 已自动化 · [statistic 测试](../tests/statistic.spec.ts#L13) |
| STATISTIC-02 | `animation` 从 25 数到 125，关闭自动开始 | 调用 `start()` 并等待结束，再调用一次 | 每次都从 25 开始，期间出现 25 至 125 之间的值，最终显示 125 | 已自动化 · [statistic 测试](../tests/statistic.spec.ts#L60) |
| STATISTIC-03 | 提供标题「昨日订单」、底部说明「已确认」及数值 120 | 开启再关闭 `loading` | 加载时数值区显示占位，标题和说明仍可见。关闭后恢复显示 120 | 已自动化 · [statistic 测试](../tests/statistic.spec.ts#L30) |

### YmTag 标签

Playground 路由 `/tag/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/tag/index.md) · [Playwright 测试](../tests/tag.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TAG-01 | 开启 `closable`，父级根据 `close` 移除条目 | 点击启用标签的关闭按钮一次，再尝试关闭一个已禁用标签 | 启用项发出一次关闭事件并被移除。禁用项没有关闭事件，仍在列表中 | 已自动化 · [tag 测试](../tests/tag.spec.ts#L23) |
| TAG-02 | Playground 的「标签形状」展示三种形状 | 比较「直角」「两端圆角」「右端圆角」，把全局圆角依次设为 0 和 9px | 始终分别呈现全直角、两端圆角和左直右圆。标签形状与全局圆角变化独立 | 已自动化 · [tag 测试](../tests/tag.spec.ts#L57) |
| TAG-03 | 标签含长文案、仓库图标和关闭按钮 | 将 `maxWidth` 设为 90px，再点击关闭按钮 | 整个标签宽 90px，长文字截断并显示省略号，图标和关闭按钮可见且可操作 | 已自动化 · [tag 测试](../tests/tag.spec.ts#L42) |
| TAG-04 | 预览主题固定为「主要」，图标关闭 | 依次切换实心、浅色、描边和浅色描边 | 分别显示实底、浅底、透明底带边框、浅底带边框，标签文字保持一致 | 待手工验收 |

## 反馈组件

### YmDialog 对话框

Playground 路由 `/dialog/`，浏览器夹具 `/tests/fixture/dialog.html`。 [组件文档](../src/components/dialog/index.md) · [Playwright 测试](../tests/dialog.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| DIALOG-01 | 浏览器夹具使用居中确认框，保留默认遮罩设置 | 点击「打开确认框」，先点击遮罩，再按 Enter。重新打开后按 Esc | 对话框位于视口中心，默认点击遮罩时保持打开。Enter 确认一次并关闭，焦点回到打开按钮。Esc 产生取消记录并关闭 | 已自动化 · [dialog 测试](../tests/dialog.spec.ts#L5) |
| DIALOG-02 | Playground 打开「模拟下次保存失败」，再点「编辑收货信息」 | 输入收货人「林悦」并套用备注模板，点击「保存」，出现错误后在收货人输入框按 Enter | 首次出现「保存失败，请重试。」并保留输入。再次保存成功，对话框关闭，页面显示收货信息已保存 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L66) |
| DIALOG-03 | Playground 视口足以显示整个对话框，关闭状态下设置弹出位置 | 先选择「居中」并打开，关闭后选择「靠上」并再次打开 | 面板第一次在视口中心，第二次在视口上方，关闭后都能回到触发按钮继续操作 | 部分自动化 · 已断言居中和关闭后焦点。[dialog 测试](../tests/dialog.spec.ts#L5) |

### YmLoading 加载

Playground 路由 `/loading/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/loading/index.md) · [Playwright 测试](../tests/loading.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| LOADING-01 | Playground 顶部为独立加载提示 | 保持 `loading` 开启，将 `text` 改为「同步中」，依次关闭 `indicator` 和 `loading` | 先显示图标及「同步中」，关闭图标后保留文字，关闭加载后整条提示隐藏 | 部分自动化 · 已断言默认图标、文字更新和加载关闭。[loading 测试](../tests/loading.spec.ts#L3)、[Playground 测试](../tests/playground.spec.ts#L894) |
| LOADING-02 | 浏览器夹具的局部遮罩带延时，内容区有可编辑输入框 | 先输入 `unsaved edits`，开始加载并观察延时前后，再关闭加载 | 延时前无加载提示，延时后提示覆盖内容，关闭后原输入仍为 `unsaved edits` | 已自动化 · [loading 测试](../tests/loading.spec.ts#L3) |
| LOADING-03 | 在夹具中开启 `fullscreen` 并保留 `preventScrollThrough` | 确认全屏遮罩出现，再关闭加载 | 遮罩使用视口定位，加载时页面滚动被锁定，关闭后解除锁定 | 已自动化 · [loading 测试](../tests/loading.spec.ts#L49) |

### YmMessage 全局提示

Playground 路由 `/message/`，浏览器夹具 `/tests/fixture/message.html`。 [组件文档](../src/components/message/index.md) · [Playwright 测试](../tests/message.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| MESSAGE-01 | 夹具中用插槽自定义警告图标、正文和关闭按钮，开启事件日志 | 查看「库存不足」，聚焦「确认」并按 Enter | 显示自定义图标和正文。关闭后消息隐藏，关闭按钮事件和 `close-click` 各记录一次 | 已自动化 · [message 测试](../tests/message.spec.ts#L6) |
| MESSAGE-02 | 默认 3 秒的限时消息带关闭按钮 | 在超时前把指针移入，停留超过 3 秒，聚焦关闭按钮后移出指针，再移走焦点 | 悬停或消息内有焦点时消息保持显示。两者均离开后重新计时，约 3 秒后自动关闭一次 | 已自动化 · [message 测试](../tests/message.spec.ts#L25) |
| MESSAGE-03 | 浏览器夹具的「批量提示」通过 `Message` 在顶部和右下角发布消息 | 点击「批量提示」，再依次点击「关闭首条」和「全部关闭」 | 顶部消息按调用顺序堆叠，底部提示出现在右下区域。关闭首条保留其他消息，全部关闭后消息栈移除 | 已自动化 · [message 测试](../tests/message.spec.ts#L50) |

### YmNotification 消息通知

Playground 路由 `/notification/`，浏览器夹具 `/tests/fixture/notification.html`。 [组件文档](../src/components/notification/index.md) · [Playwright 测试](../tests/notification.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| NOTIFICATION-01 | 夹具的通知提供标题、正文和页脚插槽 | 用键盘激活「查看差异」，再激活「已阅」 | 标题显示「收货异常」，查看差异动作计数增加 1，已阅关闭通知 | 已自动化 · [notification 测试](../tests/notification.spec.ts#L6) |
| NOTIFICATION-02 | 点击夹具的「显示计时通知」 | 在 3 秒内悬停通知，超过 3 秒后把焦点移到「关闭通知」，移出指针，再移走焦点 | 只要指针或焦点仍在通知内，通知保持显示。两者均移开才重新等待 3 秒，并产生一次超时关闭 | 已自动化 · [notification 测试](../tests/notification.spec.ts#L25) |
| NOTIFICATION-03 | 夹具中还有一个独立的全局提示 | 点击「发布四角通知」，再用 `Notification` 句柄关闭第一条，最后关闭全部通知 | 四个视口角均可显示通知，同角通知纵向堆叠。关闭第一条保留同角第二条，清空通知后全局提示仍可见 | 已自动化 · [notification 测试](../tests/notification.spec.ts#L49) |

### YmPopup 浮层

Playground 路由 `/popup/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/popup/index.md) · [Playwright 测试](../tests/popup.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| POPUP-01 | Playground 将「触发方式」设为「点击」 | 点击「配送说明」打开，点「知道了」关闭。再次打开后点浮层外 | 两种关闭方式均使说明消失。打开时触发器的 `aria-expanded` 为 `true` | 已自动化 · [popup 测试](../tests/popup.spec.ts#L7)、[Playground 测试](../tests/playground.spec.ts#L378) |
| POPUP-02 | 打开夹具中的「悬停查看备注」用例 | 悬停锚点并移入面板。再从锚点用 Tab 进入「查看备注详情」，按 Esc | 移入面板时浮层保持打开。Esc 关闭浮层并把焦点还给锚点 | 已自动化 · [popup 测试](../tests/popup.spec.ts#L54) |
| POPUP-03 | 点击夹具的「打开定位用例」，触发器在视口底部且容器会裁切溢出 | 点击「视口边缘触发器」，再在容器中横向滚动 40px | 浮层翻到触发器上方，保持在视口内且可命中。容器滚动后浮层随锚点移动 40px | 已自动化 · [popup 测试](../tests/popup.spec.ts#L72) |

### YmProgress 进度条

Playground 路由 `/progress/`，浏览器夹具 `/tests/fixture/progress.html`。 [组件文档](../src/components/progress/index.md) · [Playwright 测试](../tests/progress.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| PROGRESS-01 | 挂载默认横线进度条 | 依次设置 `percentage` 为 -5、62.5、130 | 依次按 0%、62.5%、100% 显示，填充比例和 `aria-valuenow` 与限制后的值一致 | 已自动化 · [progress 测试](../tests/progress.spec.ts#L12) |
| PROGRESS-02 | Playground 将「完成进度」设为 35%，开启「显示标签」 | 依次切换「横线」「内嵌文字」「圆环」 | 标签先在横线旁，再进入轨道，最后居中于圆环 | 已自动化 · [progress 测试](../tests/progress.spec.ts#L33) |
| PROGRESS-03 | 进度为 100%，形态为横线或圆环 | 将「进度状态」改为「警告」，再关闭「显示标签」 | 警告覆盖自动完成状态并显示状态图标。关闭标签后文字及状态图标隐藏，进度仍为 100% | 已自动化 · [progress 测试](../tests/progress.spec.ts#L93)、[progress 测试](../tests/progress.spec.ts#L112) |

### YmTooltip 文字提示

Playground 路由 `/tooltip/`，浏览器夹具 `/tests/fixture/tooltip.html`。 [组件文档](../src/components/tooltip/index.md) · [Playwright 测试](../tests/tooltip.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TOOLTIP-01 | 浏览器夹具中触发按钮已带一段描述，「物流详情」提示处于关闭状态 | 悬停触发按钮，移出后按 Tab 聚焦按钮，再按 Esc | 悬停和聚焦均显示提示。打开时新提示与已有描述并存，Esc 关闭并保留触发器焦点 | 已自动化 · [tooltip 测试](../tests/tooltip.spec.ts#L7) |
| TOOLTIP-02 | Playground 提示已能打开，视口四周有足够空间 | 依次检查上、下、左、右位置，再关闭「显示箭头」 | 面板出现在对应方向并与触发器对齐，关闭后箭头消失 | 已自动化 · [tooltip 测试](../tests/tooltip.spec.ts#L78) |
| TOOLTIP-03 | Playground 触发方式为点击，提示关闭 | 打开「禁用提示」后点击「配送时效」，关闭禁用后再次点击 | 禁用时提示保持隐藏，恢复后可以打开并显示正文 | 部分自动化 · 已断言禁用和点击触发，分别使用不同场景。[tooltip 测试](../tests/tooltip.spec.ts#L37)、[Playground 测试](../tests/playground.spec.ts#L352) |

## 全局配置

### ConfigProvider 全局配置

Playground 路由 `/config-provider/`，浏览器夹具 `/tests/fixture/`（按钮和嵌套配置）。 [组件文档](../src/components/config-provider/index.md) · [Playwright 测试](../tests/playground.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| CONFIG-PROVIDER-01 | Playground「全局设置」已展开，浏览器系统配色为深色 | 依次选择「自动」「深色」「浅色」，查看画布和主要按钮 | 自动跟随深色，显式深色显示深背景和浅文字，显式浅色显示浅背景和深正文。主要按钮保持主题与文字对比 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L840) |
| CONFIG-PROVIDER-02 | 在按钮页将「默认尺寸」设为大号、圆角 14px、浅色品牌色 `#34652e` | 经左侧菜单进入全局配置页，比较「保存」「局部小尺寸」「显式大尺寸」「胶囊形状」 | 保存按钮沿用品牌色、高 40px、圆角 14px。局部小尺寸高 24px 且圆角为 0，显式大尺寸高 40px，胶囊保持圆弧 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L840) |
| CONFIG-PROVIDER-03 | 夹具嵌套两个 Provider，子级只覆盖成功色或显式指定模式 | 比较品牌按钮和成功按钮，再切换父级模式 | 未覆盖的品牌色按父级调色板继承，成功色由子级覆盖，显式浅色的子级使用它自己的浅色调色板 | 已自动化 · [button 测试](../tests/button.spec.ts#L76) |
| CONFIG-PROVIDER-04 | Playground「显示模式」设为「自动」 | 在浏览器开发者工具将 `prefers-color-scheme` 依次模拟为浅色、深色、浅色，保持页面打开 | 画布和后代组件立即跟随三次变化，文案和当前选中的尺寸设置保留 | 部分自动化 · 已断言自动模式应用当前系统深色，需验收实时变化。[Playground 测试](../tests/playground.spec.ts#L840) |

## 表单组件

### YmCalendar 日历

Playground 路由 `/calendar/`，浏览器夹具 `/tests/fixture/calendar.html`。 [组件文档](../src/components/calendar/index.md) · [Playwright 测试](../tests/calendar.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| CALENDAR-01 | 把当前日期固定为 2024-02-15，使用含「盘点」插槽的卡片日历 | 点击 2024-02-29 | 2 月 15 日仍标记「今天」，闰日显示「盘点」和已选状态。模型及一次 change 均为 `2024-02-29` | 已自动化 · [calendar 测试](../tests/calendar.spec.ts#L29) |
| CALENDAR-02 | Playground 将日历翻到 2026 年 10 月 | 开启「显示节假日」并查看 10 月 1 日至 10 日 | 1 至 7 日显示「休」，仅 1 日显示「国庆节」。8 日无角标，10 日显示「班」 | 已自动化 · [calendar 测试](../tests/calendar.spec.ts#L80) |
| CALENDAR-03 | 夹具中打开 2024 年 2 月，已选 2 月 28 日 | 把周首日从周一切到周日，尝试激活已禁选的周六 2 月 17 日 | 网格首项从 1 月 29 日变为 1 月 28 日。周六处于禁选状态，所选日期仍为 2 月 28 日 | 已自动化 · [calendar 测试](../tests/calendar.spec.ts#L190) |
| CALENDAR-04 | Playground 保留当前选择和月份 | 把「日历样式」从「卡片」切到「完整」 | 日历切换为完整布局，仍显示原来月份和所选日期 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L424) |

### YmCheckbox 复选框

Playground 路由 `/checkbox/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/checkbox/index.md) · [Playwright 测试](../tests/checkbox.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| CHECKBOX-01 | 夹具中的独立复选框 `notice` 初始为半选 | 点击标签，再取消半选并读取原生表单值。聚焦后按空格取消勾选 | 可经标签勾选，取消半选后表单值为 `notice=yes`，空格可取消勾选 | 已自动化 · [checkbox 测试](../tests/checkbox.spec.ts#L7) |
| CHECKBOX-02 | 在 Playground 仅勾选「站内信」 | 点击「全选通知方式」，随后取消勾选「邮件」 | 三个子项先全部勾选，取消单项后其余两项保留，全选框呈半选 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L938) |
| CHECKBOX-03 | `YmCheckboxGroup` 起初选中 `"original"`，含数字 0 和布尔 false 选项 | 勾选数字 0，取消 `"original"`，再由父级将值设为 `[false]` | 每次点击只更新一次，数组中数字 0 和布尔 false 保持原类型，最后仅布尔选项选中 | 已自动化 · [checkbox 测试](../tests/checkbox.spec.ts#L37) |
| CHECKBOX-04 | Playground 中保留一个已选子项和半选的全选框 | 把「复选框主题」切到「成功」，开启「禁用」，尝试点击选项或用 Tab、空格操作 | 勾选和半选标记使用成功色。禁用后 Tab 跳过复选框，鼠标和键盘操作均保留原选中项 | 部分自动化 · 已断言选中和半选的语义色及禁用状态。[checkbox 测试](../tests/checkbox.spec.ts#L7)、[checkbox 测试](../tests/checkbox.spec.ts#L104)、[Playground 测试](../tests/playground.spec.ts#L938) |

### YmColorPicker 颜色选择器

Playground 路由 `/color-picker/`，浏览器夹具 `/tests/fixture/color-picker.html`。 [组件文档](../src/components/color-picker/index.md) · [Playwright 测试](../tests/color-picker.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| COLOR-PICKER-01 | 夹具的受控选择器初始为 `#ff0000` 并允许清空 | 打开面板选择 `#0000ff`，关闭面板并点击清空 | 模型先变为 `#0000ff`，change 包含颜色及变更来源，清空后模型为空且清空事件计数为 1 | 已自动化 · [color-picker 测试](../tests/color-picker.spec.ts#L16) |
| COLOR-PICKER-02 | 使用红色 `#ff0000` 的内联 `YmColorPickerPanel` | 依次切换 HEX、RGB 和 HSL。启用透明通道后，将 Alpha 调为 50% 并按 Enter | 格式切换时 RGB 的 R 为 255、HSL 的 L 为 50，选中色不变且无变更事件。透明度提交后为 `rgba(255, 0, 0, 0.5)` | 已自动化 · [color-picker 测试](../tests/color-picker.spec.ts#L107) |
| COLOR-PICKER-03 | 使用支持多个色标的 `YmColorPickerPanel`，初始线性渐变有两个色标 | 修改角度为 120°，增加色标并拖到约 70%，再按 Delete 删除新增色标 | 模型显示 120° 和调整后的色标位置，删除后剩两个色标 | 已自动化 · [color-picker 测试](../tests/color-picker.spec.ts#L175) |
| COLOR-PICKER-04 | Playground 初始为浮层模式 | 打开面板选预设 `#ECF2FE`，关闭浮层，打开「内嵌面板」和「透明通道」，设置输出为 HEX8 | 浮层选择后输入框为 `rgb(236, 242, 254)`，内嵌面板仍显示同一颜色 `#ecf2feff` | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L401) |

### YmDatePicker 日期选择器

Playground 路由 `/date-picker/`，浏览器夹具 `/tests/fixture/date-picker.html`。 [组件文档](../src/components/date-picker/index.md) · [Playwright 测试](../tests/date-picker.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| DATE-PICKER-01 | 单日期夹具初值为 2026-10-01，绑定表单字段 `delivery` | 打开日期面板并选 2026-10-03，再由父级清空模型 | 选择后面板关闭并恢复焦点，显示值和表单字段均为 `2026-10-03`，只记录一次变更。外部清空后显示「请选择日期」 | 已自动化 · [date-picker 测试](../tests/date-picker.spec.ts#L66) |
| DATE-PICKER-02 | 夹具为范围模式，开始与结束为空，面板显示 2026 年 10 月和 11 月 | 先选 11 月 3 日，悬停 10 月 30 日，再点击 10 月 30 日 | 第一次点击只开始范围草稿，跨月区间有预览。提交时按日期顺序一次写入 `2026-10-30 至 2026-11-03` | 已自动化 · [date-picker 测试](../tests/date-picker.spec.ts#L201) |
| DATE-PICKER-03 | 将浏览器视口设为 360px 宽，打开夹具的日期范围面板 | 从两个不同月份分别选择 2026-10-20 和 2026-11-10 | 两个月份在视口内上下堆叠，均能选择，提交后两个输入框显示对应日期 | 已自动化 · [date-picker 测试](../tests/date-picker.spec.ts#L301) |
| DATE-PICKER-04 | 夹具中已有范围，开始改选但仅选择一个端点 | 按 Esc。再打开并设置一个草稿，在草稿提交前切到禁用状态 | Esc 丢弃草稿，模型仍为上次确认值。禁用时收起面板，恢复后不继续旧草稿 | 已自动化 · [date-picker 测试](../tests/date-picker.spec.ts#L321)、[date-picker 测试](../tests/date-picker.spec.ts#L356) |

### YmForm 表单

Playground 路由 `/form/`，浏览器夹具 `/tests/fixture/form.html`。 [组件文档](../src/components/form/index.md) · [Playwright 测试](../tests/form.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| FORM-01 | Playground 表单为空，开启「显示校验信息」 | 点击「提交」，输入联系人「王琳」并选择「自提」，再提交，最后点「重置」 | 空表单显示联系人和配送方式的必填提示。填完整后显示「已提交」。重置后两个字段清空并显示「已重置」 | 部分自动化 · 已断言必填校验、提交成功和重置联系人。[Playground 测试](../tests/playground.spec.ts#L272)、[form 测试](../tests/form.spec.ts#L7) |
| FORM-02 | 夹具的 `YmFormItem` 绑定 `profile.email`，提示插槽为「接收出库通知」 | 提交空邮箱后查看输入框的无障碍描述，填入有效邮箱并提交 | 错误时输入框标记 `aria-invalid`，描述含原提示和「请填写邮箱」。校验通过后错误移除 | 已自动化 · [form 测试](../tests/form.spec.ts#L7) |
| FORM-03 | 夹具的「账号」使用可延迟的冲突校验 | 先填「待查询」触发校验，再改成「新账号」，点击「返回旧结果」 | 旧响应不覆盖新值或其校验状态，也不出现旧编码的冲突提示 | 已自动化 · [form 测试](../tests/form.spec.ts#L119) |
| FORM-04 | Playground 已有填写的联系人和配送方式 | 切到「行内」，将「标签对齐」设为「顶部」，再打开「只读表单」 | 字段在足够宽的容器中横向排列，标签位于控件上方。文本仍能聚焦查看，已有值保持且不能编辑 | 部分自动化 · 已断言布局配置、只读继承与提交，需验收组合外观。[form 测试](../tests/form.spec.ts#L207)、[form 测试](../tests/form.spec.ts#L251)、[Playground 测试](../tests/playground.spec.ts#L272) |

### YmImageUpload 图片上传

Playground 路由 `/image-upload/`，浏览器夹具 `/tests/fixture/image-upload.html`。 [组件文档](../src/components/image-upload/index.md) · [Playwright 测试](../tests/image-upload.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| IMAGE-UPLOAD-01 | 夹具为单图模式，准备可加载的 `receipt.png` | 添加图片，点击缩略图预览，按 Esc 后删除，再选择同一文件 | 图片能预览。Esc 后焦点返回缩略图，删除清空列表，同一文件可以再添加 | 已自动化 · [image-upload 测试](../tests/image-upload.spec.ts#L10) |
| IMAGE-UPLOAD-02 | 多图夹具上限为 2，启用文件大小限制 | 依次选择文本、超大 PNG 和三张合规 PNG，再将已添加列表切为禁用 | 文本、超大图及超额图分别记录 `type`、`size`、`max`，列表仅两张。禁用后不能上传或删除，仍能预览已有图片 | 已自动化 · [image-upload 测试](../tests/image-upload.spec.ts#L45) |
| IMAGE-UPLOAD-03 | 夹具关闭自动上传，模拟请求可分别成功、失败或晚返回 | 加入两张图并手动上传，让第一张失败后重试，移除仍在上传的第二张 | 只重试第一张，移除第二张后取消对应请求。第一张可成功，第二张迟到的成功响应不会恢复图片 | 已自动化 · [image-upload 测试](../tests/image-upload.spec.ts#L94) |
| IMAGE-UPLOAD-04 | 夹具显示继承尺寸与显式小尺寸的「上传图片」按钮，打开「预览 原图.png」 | 在预览打开时由外部将配置改为深色和紧凑直角，再关闭预览比较按钮大小 | 预览面板即时切为深色直角，继承配置的按钮缩小，显式小尺寸宽度保持 | 已自动化 · [image-upload 测试](../tests/image-upload.spec.ts#L149) |

### YmInput 输入框

Playground 路由 `/input/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/input/index.md) · [Playwright 测试](../tests/input.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| INPUT-01 | Playground 使用文本类型并开启「允许清空」 | 输入 `SKU-93` 并点击清空，再填写内容并把输入框设为只读 | 文本值清空后焦点回到输入框，清空操作只发出一次 `clear`。只读时可聚焦、无法改值，有内容时不显示清空按钮 | 已自动化 · [input 测试](../tests/input.spec.ts#L134) |
| INPUT-02 | 夹具中的密码输入框已有 `initial` | 用键盘激活「显示密码」，再激活「隐藏密码」 | 原生类型在 `password`、`text`、`password` 间切换，值始终为 `initial`，可访问名称随状态切换 | 已自动化 · [input 测试](../tests/input.spec.ts#L186) |
| INPUT-03 | 启用输入框「无边框」 | 分别悬停、聚焦及禁用，再关闭无边框 | 开启时三个状态均无可见边框，恢复后重新显示边框 | 已自动化 · [input 测试](../tests/input.spec.ts#L11) |
| INPUT-04 | 夹具绑定受控值与事件日志，值初始为空 | 用中文输入法先组合 `pin` 再提交「拼」 | 组合中输入框可显示草稿，模型保持空。提交时模型和 change 各更新一次为「拼」 | 已自动化 · [input 测试](../tests/input.spec.ts#L102) |

### YmInputNumber 数字输入框

Playground 路由 `/input-number/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/input-number/index.md) · [Playwright 测试](../tests/input-number.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| INPUT-NUMBER-01 | 数值为 0，表单字段名为 `amount` | 查看非编辑状态，再读取原生表单值 | 输入框显示短横线且默认右对齐，提交值仍为字符串 `"0"`，没有加减步进按钮 | 已自动化 · [input-number 测试](../tests/input-number.spec.ts#L30) |
| INPUT-NUMBER-02 | 夹具小数位数为 2，最大值 5，最小值 -5 | 输入 `-1.` 确认模型未更新，续输为 `-1.005` 后按 Enter，再输入超过上限的值并失焦 | 确认后数值为 -1.01，只发出一次数值型变更。超过最大值时显示 5.00，模型中的值为数字 5 | 已自动化 · [input-number 测试](../tests/input-number.spec.ts#L57) |
| INPUT-NUMBER-03 | 打开 Playground，显式选择小号，存入正值 12.5 | 保持「无边框」开启，将对齐从右切换为左并聚焦输入框 | 文本移到左侧，值保持 12.5，无边框样式在获得焦点时仍生效 | 部分自动化 · 已断言无边框与数值配置，需验收对齐组合。[input 测试](../tests/input.spec.ts#L11)、[Playground 测试](../tests/playground.spec.ts#L1085) |

### YmRadio 单选框

Playground 路由 `/radio/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/radio/index.md) · [Playwright 测试](../tests/radio.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| RADIO-01 | 夹具有独立的普通 `YmRadio` 及选中状态的日志 | 聚焦「开启单选提醒」后按空格，再点击同一项的标签 | 第一次选中并发出一次更新及 change，第二次仍保持选中且日志不重复 | 已自动化 · [radio 测试](../tests/radio.spec.ts#L7) |
| RADIO-02 | `YmRadioGroup` 含字符串 `"0"`、数字 `0`、布尔 `false` 与禁用项，表单字段名为 `method` | 从字符串 0 用方向键切到数字 0，再选布尔项并读取表单值 | 每次仅一项选中，跳过禁用项。模型保留原类型，表单分别提交 `method=0` 与 `method=false` | 已自动化 · [radio 测试](../tests/radio.spec.ts#L20) |
| RADIO-03 | Playground 已选一种配送方式 | 把排列方向从横向切为纵向，主题设为「成功」，再开启「整组禁用」并尝试点击另一项 | 选项竖排，选中标记使用成功色。禁用后整组保留原选择 | 部分自动化 · 已断言纵向、语义色与禁用行为，需验收组合外观。[radio 测试](../tests/radio.spec.ts#L20)、[radio 测试](../tests/radio.spec.ts#L50)、[radio 测试](../tests/radio.spec.ts#L96) |

### YmRate 评分

Playground 路由 `/rate/`，浏览器夹具 `/tests/fixture/rate.html`。 [组件文档](../src/components/rate/index.md) · [Playwright 测试](../tests/rate.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| RATE-01 | 在 5 星评分中启用「允许半星」「显示评语」「允许清除」 | 把指针移到第 3 颗星左半部，先悬停，再点击两次同一位置 | 悬停预览 2.5 分和第 3 条评语，模型仍为原值。首次点击提交 2.5，再点同位置清为 0 | 部分自动化 · 已断言半星预览、提交与清零，自动化清零前选中的是 3 分。[rate 测试](../tests/rate.spec.ts#L14) |
| RATE-02 | 夹具使用可接受更新的半星评分，从 4 分开始 | 按上方向键，再按 Home 和 End。禁用后尝试点击打分或按 Home | 分数依次为 4.5、0、5，禁用后仍为 5 且无新事件 | 已自动化 · [rate 测试](../tests/rate.spec.ts#L47) |
| RATE-03 | 夹具在半星模式使用自定义图标，提供不同的选中与未选中色 | 选择半星并检查同一颗星的两侧 | 同一颗星左右分别显示选中与未选中图层，尺寸相同，图标沿半星边界裁切 | 已自动化 · [rate 测试](../tests/rate.spec.ts#L76) |

### YmSelect 选择器

Playground 路由 `/select/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/select/index.md) · [Playwright 测试](../tests/select.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| SELECT-01 | 夹具中的单选仓库初始为「Alpha 总仓」 | 打开选项，尝试选择禁用仓库，再选择键为字符串 `"0"` 的「Bravo 分仓」 | 禁用项不会改变选中值。选 Bravo 后浮层关闭，显示标签，模型和 change 各收到一次字符串 `"0"` | 已自动化 · [select 测试](../tests/select.spec.ts#L38) |
| SELECT-02 | Playground 打开「多选」并将「最多可选」设为两项 | 选择两个有效仓库，尝试选择第三个，移除一个标签后再选第三个 | 达到上限时未选项不可选。移除后可补选，标签和复选状态同步 | 已自动化 · [select 测试](../tests/select.spec.ts#L68)、[Playground 测试](../tests/playground.spec.ts#L622) |
| SELECT-03 | 为 `remoteMethod` 准备可控制时序的远程响应 | 输入旧查询和新查询，先完成新查询，再完成旧查询。随后模拟一次请求失败和恢复 | 晚到的旧结果不替换新列表。失败时列表清空，下次成功时可正常选择 | 已自动化 · [select 测试](../tests/select.spec.ts#L198) |
| SELECT-04 | 夹具启用 `clearable` 的单选与多选，多选中有已选的禁用项 | 分别点击清空按钮 | 单选模型为 `null`，焦点回到控件。多选移除可编辑标签并保留禁用项 | 已自动化 · [select 测试](../tests/select.spec.ts#L119) |
| SELECT-05 | 夹具的「继承配置的仓库」使用浅色、12px 圆角 | 打开列表并查看控件与浮层，切换选择器模式及尺寸圆角，再打开列表 | 控件变为指定的小尺寸和直角，列表显示深色配色和 0px 圆角，标签随配置缩小 | 已自动化 · [select 测试](../tests/select.spec.ts#L243) |

### YmSwitch 开关

Playground 路由 `/switch/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/switch/index.md) · [Playwright 测试](../tests/switch.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| SWITCH-01 | 夹具表单内的开关初始关闭，并记录切换及提交次数 | 依次点击、按空格、按 Enter | 状态依次为开、关、开。每次触发一组更新与 change，表单提交次数仍为 0 | 已自动化 · [switch 测试](../tests/switch.spec.ts#L7) |
| SWITCH-02 | 设置 `beforeChange` 返回可控制的 Promise，开关初始关闭 | 连续点击两次，然后让首次请求返回 false。随后分别尝试请求失败和返回 true | 等待时只处理一项请求，取消或失败后仍为关闭，成功后切换为开启 | 已自动化 · [switch 测试](../tests/switch.spec.ts#L54) |
| SWITCH-03 | Playground 先打开开关并开启「显示开关文字」 | 将「开关主题」切为成功，再关闭和重新打开，最后打开「加载中」并尝试切换 | 开启轨道为成功色，关闭轨道用默认边框色，文字随状态变化。加载中显示指示器并保持当前值 | 已自动化 · [switch 测试](../tests/switch.spec.ts#L7)、[switch 测试](../tests/switch.spec.ts#L71)、[switch 测试](../tests/switch.spec.ts#L123)、[Playground 测试](../tests/playground.spec.ts#L967) |

### YmTextarea 多行文本框

Playground 路由 `/textarea/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/textarea/index.md) · [Playwright 测试](../tests/textarea.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TEXTAREA-01 | 夹具将 `maxcharacter` 设为 5，允许超限 | 输入 `a你🍊`，加一个 `x` 再删除它 | 计数从 5/5 变为 6/5 并显示错误色，删掉后恢复。校验日志依次为 `exceed-maximum` 和恢复 | 已自动化 · [textarea 测试](../tests/textarea.spec.ts#L63) |
| TEXTAREA-02 | Playground 高度设为「自适应 2 至 5 行」，关闭字数限制 | 先输入十行，再删到一行 | 控件随内容增高至五行，多余行在控件内滚动。删至一行后控件回到两行高 | 部分自动化 · 已断言自适应上限、滚动与回缩，使用夹具的行数配置。[textarea 测试](../tests/textarea.spec.ts#L110) |
| TEXTAREA-03 | 「订单备注」和初值为「初稿」的「草稿」关联外部表单 | 将订单备注填为两行 A、B，读取表单值。修改草稿后点击「重置多行文本」 | 提交时订单备注含实际换行，原生重置使非受控的草稿恢复为「初稿」 | 已自动化 · [textarea 测试](../tests/textarea.spec.ts#L7) |

### YmTimePicker 时间选择器

Playground 路由 `/time-picker/`，浏览器夹具 `/tests/fixture/time-picker.html`。 [组件文档](../src/components/time-picker/index.md) · [Playwright 测试](../tests/time-picker.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TIME-PICKER-01 | 单选夹具使用 `HH:mm:ss` 且字段为空 | 依次选择 23 小时、45 分钟、59 秒，先读取表单值，再点「确定」 | 确认前模型和表单值仍为空。确认后面板收起，显示值及表单均为 `23:45:59`，提交一次变更 | 已自动化 · [time-picker 测试](../tests/time-picker.spec.ts#L15) |
| TIME-PICKER-02 | 范围夹具使用 `HH:mm`，初始为 09:00 至 17:30 | 分别将开始改为 19:00、结束改为 08:30，点「确定」 | 面板只有小时和分钟列。确认后按从早到晚显示和提交 `08:30 至 19:00` | 已自动化 · [time-picker 测试](../tests/time-picker.spec.ts#L50) |
| TIME-PICKER-03 | 范围夹具的已确认结束时间为 17:30 | 从结束输入框打开面板，经键盘修改结束时间，按 Esc | 面板关闭，焦点回到结束输入框，仍显示 17:30，没有提交草稿 | 已自动化 · [time-picker 测试](../tests/time-picker.spec.ts#L94) |
| TIME-PICKER-04 | Playground 保持已有时间并打开「无边框」 | 比较启用前后，再聚焦并打开时间选择器 | 触发框边线隐藏，仍可打开面板并确认时间，原值在确认新选择前保持 | 待手工验收 |

### YmTreeSelect 树选择器

Playground 路由 `/tree-select/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/tree-select/index.md) · [Playwright 测试](../tests/tree-select.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TREE-SELECT-01 | 夹具开启多选，`disabledLevels` 为 `[1, 2]` | 展开「华东大区 → 上海配送中心」，勾选第三级「虹桥仓」 | 前两级可以展开但不能选中，第三级可独立勾选，模型为 `[0]` | 已自动化 · [tree-select 测试](../tests/tree-select.spec.ts#L7) |
| TREE-SELECT-02 | 已展开「华东大区」，「上海配送中心」原本收起，启用过滤 | 搜索「虹桥」，选中结果，再清除搜索词 | 匹配时可看到完整祖先路径。清空后恢复原展开情况，已选「虹桥仓」标签仍存在 | 已自动化 · [tree-select 测试](../tests/tree-select.spec.ts#L54) |
| TREE-SELECT-03 | 夹具关联表单，默认选择 `east`，字段可多选 | 启用过滤并选择键为 0 的节点，读取表单值，再重置 | 表单按同名字段提交 `east` 和字符串 `"0"`，重置后仅提交初始值 `east`，面板关闭 | 已自动化 · [tree-select 测试](../tests/tree-select.spec.ts#L106) |
| TREE-SELECT-04 | 夹具的「继承配置的区域」初始高度 40px、圆角 12px | 打开树面板，切换到深色和紧凑配置，再打开树面板 | 触发器高度变为 24px，圆角为 0，面板使用深色背景和 0px 圆角，旁边显式尺寸的区域触发器仍高 20px | 已自动化 · [tree-select 测试](../tests/tree-select.spec.ts#L119) |

### YmUpload 文件上传

Playground 路由 `/upload/`，浏览器夹具 `/tests/fixture/upload.html`。 [组件文档](../src/components/upload/index.md) · [Playwright 测试](../tests/upload.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| UPLOAD-01 | 夹具单文件模式仅接受合规 CSV，`first.csv` 正在上传 | 尝试选择 TXT 和超限 CSV，再选有效的 `second.csv` 并让旧请求晚返回 | 无效文件分别报告 `type` 和 `size`，保留旧上传。有效文件替换并取消旧请求，最终仅 `second.csv` 成功 | 已自动化 · [upload 测试](../tests/upload.spec.ts#L17) |
| UPLOAD-02 | 夹具开启多文件、上限 2、关闭自动上传 | 加入 TXT 和 PDF，尝试追加 ZIP。开始上传后令 TXT 失败，再重试 TXT | 第三个文件报告 `max`。点击开始前无请求，上传有进度，重试只影响失败项，成功的 PDF 保留 | 已自动化 · [upload 测试](../tests/upload.spec.ts#L48) |
| UPLOAD-03 | 调用包入口的 `uploadFiles`，传入文件 `part.bin` 及测试接口地址 | 在接口读取 multipart 字段并返回下载地址 | 收到 POST 和原始字节 `[0, 1, 254, 255]`，返回结果保留文件名并映射到 `/downloads/part.bin` | 已自动化 · [upload 测试](../tests/upload.spec.ts#L85) |
| UPLOAD-04 | 调用包入口的 `uploadFiles` 上传三个文件，模拟慢成功、明确失败和请求抛错 | 使响应乱序完成，再检查结果。另用空文件数组调用，并对上传中的请求触发取消 | 批量结果仍按输入顺序，逐文件保留成功或失败。空数组返回空结果，取消信号传到进行中的请求 | 已自动化 · [upload 测试](../tests/upload.spec.ts#L108)、[upload 测试](../tests/upload.spec.ts#L139) |
| UPLOAD-05 | 夹具显示默认继承尺寸和显式尺寸的两个上传入口 | 切换「深色」及「小尺寸直角」 | 继承入口使用深色背景，变为 24px 高且圆角为 0。显式入口保持 20px 高 | 已自动化 · [upload 测试](../tests/upload.spec.ts#L166) |

## 导航组件

### YmDropdown 下拉操作菜单

Playground 路由 `/dropdown/`，浏览器夹具 `/tests/fixture/dropdown.html`。 [组件文档](../src/components/dropdown/index.md) · [Playwright 测试](../tests/dropdown.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| DROPDOWN-01 | 浏览器夹具中默认悬停菜单已关闭，「刷新当前页」命令值为数字 0 | 悬停触发器，移入菜单后点击「刷新当前页」 | 移入菜单期间保持展开，点击后收起，事件日志首次记录 `0/click/true` | 已自动化 · [dropdown 测试](../tests/dropdown.spec.ts#L7) |
| DROPDOWN-02 | 打开夹具中带禁用项的菜单并使用键盘 | 按下方向键、End、Home，最后按 Esc | 方向键跳过禁用项，End 和 Home 到达最后和第一项，Esc 关闭菜单并还原焦点 | 已自动化 · [dropdown 测试](../tests/dropdown.spec.ts#L28) |
| DROPDOWN-03 | Playground 将「触发方式」设为「点击」，关闭「执行后收起」 | 打开「页签操作」，选择「关闭其他页签」，再点击菜单外 | 其他页签收起，菜单继续显示。点击外部时菜单关闭 | 已自动化 · [dropdown 测试](../tests/dropdown.spec.ts#L59)、[Playground 测试](../tests/playground.spec.ts#L34) |
| DROPDOWN-04 | Playground 使用点击打开，浏览器视口为触发器四周预留空间 | 依次选择「下方靠左」和「上方靠右」并打开菜单 | 菜单先与触发器左边缘对齐并位于下方，再与右边缘对齐并位于上方 | 待手工验收 |

### YmMenu 导航菜单

Playground 路由 `/menu/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/menu/index.md) · [Playwright 测试](../tests/menu.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| MENU-01 | 浏览器夹具中侧栏展开，当前页为「营运总览」 | 展开「仓储作业」，再选择子项 | 展开只显示分组子项，选择子项才更新当前页。点击出库记录链接会跳转到其锚点 | 已自动化 · [menu 测试](../tests/menu.spec.ts#L3) |
| MENU-02 | 收起浏览器夹具的侧栏 | 悬停「仓储作业」的图标并把指针移入浮层，选择出库记录 | 导航文字在收起侧栏隐藏，子菜单出现在侧栏右侧，点击仍能跳转到 `#outbound-records` | 已自动化 · [menu 测试](../tests/menu.spec.ts#L30) |
| MENU-03 | 浏览器夹具侧栏为收起状态 | 用键盘聚焦分组并进入第一项，再按 Esc | 子菜单关闭，焦点回到分组按钮，分组的 `aria-expanded` 变为 `false` | 已自动化 · [menu 测试](../tests/menu.spec.ts#L55) |

### YmPagination 分页

Playground 路由 `/pagination/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/pagination/index.md) · [Playwright 测试](../tests/pagination.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| PAGINATION-01 | 浏览器夹具默认用例总数 61，每页 10 条，当前第 1 页 | 查看首页和上一页状态，再聚焦第 4 页按 Enter，依次点击下一页和上一页 | 显示 7 个页码。首页和上一页初始禁用，当前页依次为 4、5、4 | 已自动化 · [pagination 测试](../tests/pagination.spec.ts#L3) |
| PAGINATION-02 | Playground 总数设为 137，当前每页 10 条 | 点击「尾页」并切到每页 50 条 | 记录范围从 131–137 变为 101–137，两种页长均正确显示最后一页 | 已自动化 · [Playground 测试](../tests/playground.spec.ts#L1172) |
| PAGINATION-03 | Playground 先进入最后一页 | 将「总条数」切到 23，再切到 0 | 当前页先收敛到新末页。总数为 0 时仅保留第 1 页，首尾及前后页按钮禁用 | 已自动化 · [pagination 测试](../tests/pagination.spec.ts#L54) |

### YmSteps 步骤条

Playground 路由 `/steps/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/steps/index.md) · [Playwright 测试](../tests/steps.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| STEPS-01 | 夹具中有三个顺序步骤，初始为第一步 | 用键盘激活第二步 | 第一步显示完成标记，第二步显示进行中并带 `aria-current="step"`，第三步保持未开始 | 已自动化 · [steps 测试](../tests/steps.spec.ts#L3) |
| STEPS-02 | Playground 已选一个中间步骤 | 把「排列方向」切为纵向，「显示顺序」切为倒序，「步骤标记」切为圆点，「连接线」切为虚线 | 步骤从上到下按倒序排列，圆点与虚线可见，当前步骤和已完成状态保持 | 部分自动化 · 已断言纵向、倒序与活动状态。[steps 测试](../tests/steps.spec.ts#L57)、[Playground 测试](../tests/playground.spec.ts#L1205) |
| STEPS-03 | Playground 记录当前步骤，开启「只读」 | 尝试点击其他步骤，再通过「当前步骤」选择「全部完成」 | 点击时保持原步骤。外部设为全部完成后每步显示完成状态，当前标记消失 | 已自动化 · [steps 测试](../tests/steps.spec.ts#L3)、[steps 测试](../tests/steps.spec.ts#L21)、[Playground 测试](../tests/playground.spec.ts#L1205) |

### YmSwiper 轮播框

Playground 路由 `/swiper/`，浏览器夹具 `/tests/fixture/swiper.html`。 [组件文档](../src/components/swiper/index.md) · [Playwright 测试](../tests/swiper.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| SWIPER-01 | 夹具中的循环轮播从「订单」页开始 | 点击上一项、下一项，再用导航选「收货」 | 依次显示「结算」「订单」「收货」，导航高亮随内容变化，每次操作仅记录一次切换 | 已自动化 · [swiper 测试](../tests/swiper.spec.ts#L9) |
| SWIPER-02 | 在 Playground 保持普通模式 | 改为垂直和淡入淡出，切换轮播后再选卡片模式 | 普通模式使用淡入淡出切换，纵向用上、下键导航。卡片模式下当前卡片比相邻卡片宽 | 已自动化 · [swiper 测试](../tests/swiper.spec.ts#L77) |
| SWIPER-03 | 使用三页轮播，启用自动播放，关闭循环 | 鼠标悬停暂停，移出后观察，再用键盘把焦点留在轮播内暂停，移走焦点直到到达末页 | 鼠标或焦点在轮播内时暂停，离开后等待完整间隔继续，最终停在第 3 项 | 已自动化 · [swiper 测试](../tests/swiper.spec.ts#L142) |
| SWIPER-04 | 在夹具首个 `YmSwiperItem` 中放置订单备注输入框 | 输入「保留草稿」，切换到其他项后返回 | 非当前轮播项被标记为不可交互，返回订单页后文本仍为「保留草稿」 | 已自动化 · [swiper 测试](../tests/swiper.spec.ts#L9) |

### YmTabs 选项卡

Playground 路由 `/tabs/`，浏览器夹具 `/tests/fixture/`。 [组件文档](../src/components/tabs/index.md) · [Playwright 测试](../tests/tabs.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TABS-01 | 夹具初始选中「首页」 | 用左右方向键切换页签，再用 Home 返回首页 | 焦点和选中状态随键盘操作移动，活动页签和内容区通过 `aria-controls`、`aria-labelledby` 对应 | 已自动化 · [tabs 测试](../tests/tabs.spec.ts#L111) |
| TABS-02 | Playground 使用带「事项备注」输入框的 `YmTabPanel` | 输入「下次继续」，切到其他页签后再返回 | 切换时显示各自的内容，回到事项页后草稿保留 | 已自动化 · [tabs 测试](../tests/tabs.spec.ts#L43)、[Playground 测试](../tests/playground.spec.ts#L1227) |
| TABS-03 | 夹具中两个 `YmTabPanel` 提供不同的右侧操作 | 在首页点击「刷新首页」，再切到「事项」并使用筛选 | 刷新计数增加 1，首页保持选中。事项页显示自己的筛选控件，首页操作在该页隐藏 | 已自动化 · [tabs 测试](../tests/tabs.spec.ts#L71) |
| TABS-04 | 在 Playground 设置全局尺寸为大号，选项卡默认继承 | 把选项卡尺寸改为小号，再切换全局尺寸和显示模式 | 局部小号生效，不随全局尺寸改变，页签颜色仍跟随当前主题 | 已自动化 · [tabs 测试](../tests/tabs.spec.ts#L147) |

### YmTree 树形控件

Playground 路由 `/tree/`，浏览器夹具 `/tests/fixture/tree.html`。 [组件文档](../src/components/tree/index.md) · [Playwright 测试](../tests/tree.spec.ts)

| 编号 | 前置条件 | 操作 | 预期结果 | 自动化覆盖 |
| --- | --- | --- | --- | --- |
| TREE-01 | 夹具展开「食品」，初始没有选中项 | 先点击「水果」行，再点击它的展开按钮，最后选择「Apple 苹果」 | 点击行选中水果。展开仅显示子节点。选择苹果时事件返回节点及数字键 0 | 已自动化 · [tree 测试](../tests/tree.spec.ts#L9) |
| TREE-02 | 夹具已选中「饮品」，「水果」原本收起 | 在过滤框输入 `apple`，再清空搜索词 | 搜索结果保留「食品 → 水果 → Apple 苹果」路径。清空后恢复水果收起与饮品选中 | 已自动化 · [tree 测试](../tests/tree.spec.ts#L30) |
| TREE-03 | 键盘焦点位于可展开的「水果」 | 按右方向键展开，再按右方向键进入子项后按 Enter | 展开和移动焦点不改变选择，Enter 激活当前子项并记录一次更新 | 已自动化 · [tree 测试](../tests/tree.spec.ts#L55) |
