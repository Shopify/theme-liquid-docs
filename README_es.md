# Tema Liquid Docs

<!-- hy-mt2-i18n:start -->
[English](./README.md) | [中文](./README_zh-CN.md) | [日本語](./README_ja.md) | **Español**
<!-- hy-mt2-i18n:end -->


Documentación generada automáticamente para esquemas, elementos, etiquetas y filtros de Liquid. La documentación se actualiza constantemente: cada vez que modifique el esquema, la documentación se regenerará automáticamente.

## Inicio rápido

```bash
git clone https://github.com/Shopify/theme-liquid-docs
cd theme-liquid-docs
yarn install
```

## Contenido

- **`data/`** — Archivos JSON con elementos, etiquetas y filtros de Liquid para temas
- **`schemas/`** — Definiciones de JSON Schema para los artefactos de temas en Liquid
- **`ai/`** — Archivos de contexto que permiten generar reglas en Liquid mediante inteligencia artificial
- **`tests/`** — Conjunto de pruebas que garantizan la precisión de la documentación
- **`scripts/`** — Scripts de automatización para la generación de documentación

### Datos disponibles

En `data/`, tendrá acceso a:
- `filters` — Todos los filtros disponibles de Liquid
- `tags` — Todas las etiquetas de Liquid
- `objects` — Todos los objetos de Liquid
- `latest.json` — Identifica la versión de los datos de Liquid utilizada por la CLI, theme-tools y otros proyectos dependientes. Consulte [Actualizar el número de revisión](#updating-revision-number) para más detalles.

Consulte `ai/liquid.mdc` para ver ejemplos.

### Actualizar el número de revisión

Ejecute la [acción de GitHub](https://github.com/Shopify/theme-liquid-docs/actions/workflows/update-latest.yml) para actualizar la documentación de Liquid utilizada por todos los proyectos dependientes.

🚨 SI NO EJECUTA ESTA ACCIÓN, LOS PROYECTOS DEPENDIENTES USARÁN LA DOCUMENTACIÓN DE LIQUID IDENTIFICADA POR EL ID DE REVISIÓN EN `data/latest.json`.

## Colaborar

Ayúdenos a mejorar esta documentación:

1. **Hacer un fork** de este repositorio
2. **Crear** su rama de características (`git checkout -b improve-liquid-docs`)
3. **Cometer** sus cambios (`git commit -m 'Agregar ejemplos de filtros de array'`)
4. **Subir** los cambios y crear una solicitud de pull request

## Licencia

Licencia MIT. Consulte [LICENSE](./LICENSE.md) para más detalles.
