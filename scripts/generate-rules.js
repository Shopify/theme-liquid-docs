#!/usr/bin/env node

const { Liquid } = require('liquidjs');
const fs = require('fs');
const path = require('path');

const engine = new Liquid({
  root: path.join(__dirname, '..', 'ai', 'rules'),
  extname: '.liquid',
  strictFilters: false,
  strictVariables: false,
});

engine.registerTag('render', {
  parse: function (token) {
    const match = token.content.match(/render\s+['"]([^'"]+)['"]/);
    this.filename = match ? match[1] : null;

    // Get the indentation level from the original source line
    // token.input contains the full input string, we need to find the current line
    const tokenStart = token.begin;
    const lines = token.input.split('\n');
    let currentLine = '';
    let charCount = 0;

    for (const line of lines) {
      if (charCount + line.length >= tokenStart) {
        currentLine = line;
        break;
      }
      charCount += line.length + 1; // +1 for newline character
    }

    const leadingSpaces = currentLine.match(/^\s*/)[0];
    this.indentLevel = leadingSpaces;
  },
  render: async function (context) {
    if (!this.filename) {
      throw new Error('No filename found for render tag');
    }

    const basePath = path.join(__dirname, '..', 'ai', 'rules', this.filename);
    const tag = this.filename.replace(/^_/, '');

    const mdPath = basePath + '.md';
    const liquidPath = basePath + '.liquid';

    let content;

    if (fs.existsSync(mdPath)) {
      content = fs.readFileSync(mdPath, 'utf8');
    } else if (fs.existsSync(liquidPath)) {
      // Read the liquid file and parse/render it with the current context
      const liquidContent = fs.readFileSync(liquidPath, 'utf8');
      content = await engine.parseAndRender(liquidContent, context);
    } else {
      content = `Could not find file: ${this.filename}.md or ${this.filename}.liquid`;
    }

    const indentedContent = content
      .split('\n')
      .map((line) => `${this.indentLevel}  ${line}`)
      .join('\n');

    return `<${tag}>\n${indentedContent}\n${this.indentLevel}</${tag}>`;
  },
});

// Function to load JSON data files
function loadJsonData() {
  const dataDir = path.join(__dirname, '..', 'data');

  try {
    const filters = JSON.parse(fs.readFileSync(path.join(dataDir, 'filters.json'), 'utf8'));
    const tags = JSON.parse(fs.readFileSync(path.join(dataDir, 'tags.json'), 'utf8'));
    const objects = JSON.parse(fs.readFileSync(path.join(dataDir, 'objects.json'), 'utf8'));

    return {
      filters,
      tags,
      objects,
    };
  } catch (error) {
    console.error('❌ Error loading JSON data files:', error);
    return {
      filters: [],
      tags: [],
      objects: [],
    };
  }
}

async function generateRules() {
  try {
    const templatePath = path.join(__dirname, '..', 'ai', 'rules', 'index.liquid');
    const template = fs.readFileSync(templatePath, 'utf8');

    // Load JSON data and pass it to the Liquid context
    const jsonData = loadJsonData();

    const output = await engine.parseAndRender(template, jsonData);
    const outputPath = path.join(__dirname, '..', 'ai', 'rules.mdc');

    fs.writeFileSync(outputPath, output);
  } catch (error) {
    console.error('❌ Error generating rules file:', error);
    process.exit(1);
  }
}

generateRules();
