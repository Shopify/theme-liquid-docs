# Theme Liquid Docs

<!-- hy-mt2-i18n:start -->
[English](./README.md) | **中文** | [日本語](./README_ja.md) | [Español](./README_es.md)
<!-- hy-mt2-i18n:end -->


专为 Liquid 模板结构、插件、标签及过滤器生成的自动化文档。只要您更新模板结构，文档就会自动重新生成，始终保持最新状态。

## 快速开始

```bash
git clone https://github.com/Shopify/theme-liquid-docs
cd theme-liquid-docs
yarn install
```

## 目录结构

- **`data/`** — 包含主题相关 Liquid 插件、标签及过滤器的 JSON 文件
- **`schemas/`** — Liquid 主题组件的 JSON Schema 定义文件
- **`ai/`** — 用于支持 AI 生成 Liquid 规则的上下文文件
- **`tests/`** — 用于确保文档准确性的测试套件
- **`scripts/`** — 用于生成文档的自动化脚本

### 可用的数据

在 `data/` 目录中，您可以获取：
- `filters` — 所有的可用 Liquid 过滤器
- `tags` — 所有的 Liquid 标签
- `objects` — 所有的 Liquid 对象
- `latest.json` — 明确指出 CLI、theme-tools 以及其他依赖项目所使用的 Liquid 数据版本。详情请参阅[更新修订号](#updating-revision-number)。

示例内容请查看 `ai/liquid.mdc` 文件。

### 更新修订号

运行 [GitHub Action](https://github.com/Shopify/theme-liquid-docs/actions/workflows/update-latest.yml)，即可更新所有依赖项目所使用的 Liquid 文档。

🚨 如果不运行此操作，依赖项目将会使用 `data/latest.json` 中指定的修订编号对应的 Liquid 文档。

## 贡献方式

欢迎帮助我们改进这些文档：

1. **复制**此仓库
2. **创建**您的功能分支（`git checkout -b improve-liquid-docs`）
3. **提交**您的更改（`git commit -m '添加数组过滤器示例'`）
4. **推送**代码并创建 Pull Request

## 许可协议

采用 MIT 许可协议。详情请参阅 [LICENSE](./LICENSE.md)。
