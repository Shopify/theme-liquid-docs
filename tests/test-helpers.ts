import {
  getLanguageService,
  Diagnostic,
  TextDocument,
} from 'vscode-json-languageservice';

export interface SchemaDefinition {
  uri: string;
  fileMatch?: string[];
  schema: string;
}

export const validateSchema = (schemas: SchemaDefinition[]) => {
  const service = getLanguageService({
    async schemaRequestService(uri) {
      const schemaDefinition = schemas.find(sd => sd.uri === uri);
      return schemaDefinition?.schema ?? `Could not find a schema for ${uri}`;
    },
  });

  service.configure({
    schemas: schemas.map(sd => ({ uri: sd.uri, fileMatch: sd.fileMatch })),
  });

  return async (jsonContent: any): Promise<Diagnostic[]> => {
    if (typeof jsonContent !== 'string') {
      jsonContent = JSON.stringify(jsonContent);
    }

    const textDocument = TextDocument.create(
      'file:/file.json',
      'json',
      0,
      jsonContent,
    );
    const jsonDocument = service.parseJSONDocument(textDocument);
    const diagnostics = await service.doValidation(
      textDocument,
      jsonDocument,
      {
        schemaValidation: 'error',
        comments: 'error',
        trailingCommas: 'error',
      },
    );

    return diagnostics;
  };
};
