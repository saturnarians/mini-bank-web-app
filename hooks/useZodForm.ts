import { useState } from "react";
import { ZodSchema } from "zod";

export function useZodForm<T>(schema: ZodSchema<T>, defaults: T) {
  const [values, setValues] = useState<T>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (partial?: Partial<T>) => {
    const parsed = schema.safeParse({ ...values, ...partial });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    const next = { ...values, [key]: value };
    setValues(next);
    const partial = { [key]: value } as unknown as Partial<T>;
    validate(partial);
  };

  return { values, errors, setField, validate };
}
