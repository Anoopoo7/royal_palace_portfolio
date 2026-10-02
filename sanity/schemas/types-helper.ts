export interface RuleBuilder {
  required: () => RuleBuilder;
  min: (n: number) => RuleBuilder;
  max: (n: number) => RuleBuilder;
}

export interface SanityField {
  name: string;
  title: string;
  type: string;
  description?: string;
  rows?: number;
  initialValue?: unknown;
  validation?: (rule: RuleBuilder) => RuleBuilder;
  options?: Record<string, unknown>;
  of?: unknown[];
}

export interface SanitySchema {
  name: string;
  title: string;
  type: string;
  fields: SanityField[];
}

export function defineType<T extends SanitySchema>(schema: T): T {
  return schema;
}

export function defineField<T extends SanityField>(field: T): T {
  return field;
}
