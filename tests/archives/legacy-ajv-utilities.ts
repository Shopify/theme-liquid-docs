import Ajv, { Options, ErrorObject } from "ajv";

type ValidateSchemaProps = {
  jsonSchema: Object;
  options?: Options;
};

/**
 * Returns an ajv validator to perform schema validations.
 *
 * const validate = validateSchema(jsonSchema);
 * const errors = validate(data)
 */
export const validateSchema = ({
  jsonSchema,
  options,
}: ValidateSchemaProps) => {
  const ajv = new Ajv({ strict: false, allErrors: true, ...(options ?? {}) });

  const validator = ajv.compile(jsonSchema);

  return (
    jsonContent: any
  ): ErrorObject<string, Record<string, any>, unknown>[] => {
    const valid = validator(jsonContent);

    // AJV has kind of a funky way of returning errors.
    // For simplicities sake, our tests only care about the
    // list of errors potentially returned for any json content.
    return valid || !validator.errors ? [] : validator.errors;
  };
};
