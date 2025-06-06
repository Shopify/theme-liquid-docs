#!/usr/bin/env node

const { Liquid } = require('liquidjs');
const fs = require('fs');
const path = require('path');

const engine = new Liquid({
  root: path.join(__dirname, '..', 'ai', 'sources'),
  extname: '.liquid',
  strictFilters: false,
  strictVariables: false,
});

engine.registerTag('render', {
  parse: function (token) {
    /**
     * Extracts the leading spaces from the current line to maintain proper indentation
     * when rendering nested content. This ensures the rendered content follows
     * the same indentation level as the parent template.
     */
    function getLeadingSpaces(token) {
      const tokenStart = token.begin;
      const lines = token.input.split('\n');

      let currentLine = '';
      let charCount = 0;

      for (const line of lines) {
        if (charCount + line.length >= tokenStart) {
          currentLine = line;
          break;
        }
        charCount += line.length + 1;
      }

      return currentLine.match(/^\s*/)[0];
    }

    const match = token.content.match(/render\s+['"]([^'"]+)['"]/);

    this.filename = match ? match[1] : null;
    this.indentLevel = getLeadingSpaces(token);
  },
  render: async function (context) {
    if (!this.filename) throw new Error('No filename found for render tag');

    const tag = this.filename.replace(/^_/, '');
    const content = await readAiSourceFile(this.filename, context);

    const indentedContent = content
      .split('\n')
      .map((line) => `${this.indentLevel}  ${line}`)
      .join('\n');

    return `<${tag}>\n${indentedContent}\n${this.indentLevel}</${tag}>`;
  },
});

async function generateAiFile() {
  try {
    const filters = readDataFile('filters.json');
    const tags = readDataFile('tags.json');
    const objects = readDataFile('objects.json');

    const output = await readAiSourceFile('index', { filters, tags, objects });
    const outputPath = path.join(__dirname, '..', 'ai', 'liquid.mdc');

    fs.writeFileSync(outputPath, output);
  } catch (error) {
    console.error('❌ Error generating AI file:', error);
    process.exit(1);
  }
}

async function readAiSourceFile(filename, context) {
  const sourcesPath = path.join(__dirname, '..', 'ai', 'sources');
  const basePath = path.join(sourcesPath, filename);

  const mdPath = basePath + '.md';
  if (fs.existsSync(mdPath)) {
    return fs.readFileSync(mdPath, 'utf8');
  }

  const liquidPath = basePath + '.liquid';
  if (fs.existsSync(liquidPath)) {
    return engine.parseAndRender(fs.readFileSync(liquidPath, 'utf8'), context);
  }

  return `Could not find file: ${filename}.md or ${filename}.liquid`;
}

function readDataFile(filename) {
  const dataPath = path.join(__dirname, '..', 'data');
  return JSON.parse(fs.readFileSync(path.join(dataPath, filename), 'utf8'));
}

generateAiFile();
