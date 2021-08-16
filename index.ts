import { classToPlain, plainToClass } from "class-transformer";
import { isBoolean, isObject, validateSync } from "class-validator";

import { arraySortStrings } from "@corefunc/corefunc/array/sort/strings";
import { checkIsObjectLike } from "@corefunc/corefunc/check/is-object-like";
import { isString } from "@corefunc/corefunc/is/string";
import { jsonStringifySafe } from "@corefunc/corefunc/json/stringify/safe";
import { objectBasicLock } from "@corefunc/corefunc/object/basic/lock";
import { textCaseCapitalize } from "@corefunc/corefunc/text/case/capitalize";

import { cloneMarshalling } from "@corefunc/v8/clone/clone-marshalling";

export interface IOptions {
  class: boolean;
  property: boolean;
  value: boolean;
  prettify: boolean;
}

const OPTIONS_DEFAULT: IOptions = {
  class: false,
  prettify: true,
  property: false,
  value: false,
} as const;

/**
 * @summary
 * Classes extended from `FillableDto` shouldn't have default values for class members.
 * Use constructor instead.
 * @example ```
 * export class ErrorDto extends FillableDto {
 *  public readonly message: string;
 * }
 * ```
 */
export abstract class FillableDto {
  public static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type> {
    return this.fromPlain(JSON.parse(json));
  }
  public static fromPlain<Type extends typeof FillableDto>(this: Type, plain: Record<string, any>): InstanceType<Type> {
    // @ts-ignore
    return plainToClass(this, plain) as InstanceType<Type>;
  }
  public constructor(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[],
    defaultValues?: Record<string, any>,
  ) {
    this.assignAll(attributes, includeKeys, defaultValues);
  }
  public toJSON(): Record<string, any> {
    return this.toObject();
  }
  public toObject(): Record<string, any> {
    return classToPlain(cloneMarshalling(this));
  }
  public toString(): string {
    return jsonStringifySafe(this.toObject());
  }
  public isValid(silent: boolean = false): boolean {
    const validationErrors = validateSync(this);
    if (silent) {
      return Boolean(validationErrors.length === 0);
    }
    if (validationErrors.length === 0) {
      return true;
    }
    const constructorName = this.constructor.name;
    const errorText = validationErrors
      .map(function errorToSentence(error): string {
        const constraints = {};
        if ("constraints" in error) {
          Object.assign(constraints, error.constraints);
        } else if ("children" in error) {
          return (error.children || []).map(errorToSentence).join(" ");
        }
        const failed = `${Object.values(constraints)
          .map((text) => `${textCaseCapitalize(String(text))}`)
          .join(". ")}`;
        const where = `Error in [${constructorName}].`;
        const property = `Property [${error.property}].`;
        const value = `Value is [${jsonStringifySafe(error.value)}].`;
        const message = `Failed: ${failed}.`;
        return `${where} ${property} ${value} ${message}`;
      })
      .join(" ");
    throw new Error(errorText);
  }
  public getError(options?: IOptions): null | string {
    const errors = this.getErrors(options);
    if (errors.length === 0) {
      return null;
    }
    return errors.join(" ").trim();
  }
  public getErrors(options?: IOptions): string[] {
    const opts = this.buildOptions(options);
    const validationErrors = validateSync(this, {
      validationError: { target: false },
    });
    if (validationErrors.length === 0) {
      return [];
    }
    const constructorName = this.constructor.name;
    return validationErrors.map(function errorToSentence(error): string {
      const constraints = {};
      if ("constraints" in error) {
        Object.assign(constraints, error.constraints);
      } else if ("children" in error) {
        return (error.children || []).map(errorToSentence).join(" ");
      }
      let where = "";
      if (opts.class) {
        where = `Error in [${constructorName}].`;
      }
      let property = "";
      if (opts.property) {
        property = `Property [${error.property}].`;
      }
      let value = "";
      if (opts.value) {
        value = `Value is [${jsonStringifySafe(error.value)}].`;
      }
      let message;
      if (opts.prettify) {
        const failedPretty = Object.values(constraints)
          .map((text) => String(text).replace(error.property, `[${error.property}]`).trim())
          .map((text) => textCaseCapitalize(String(text)))
          .map((text) => String(text).trim())
          .join(". ");
        message = `${failedPretty}.`;
      } else {
        message = Object.values(constraints)
          .map((text) => String(text).trim())
          .join(". ");
      }
      return `${where} ${property} ${value} ${message}`.trim();
    });
  }
  public lock(): void {
    objectBasicLock(this);
  }
  protected assignAll(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[],
    defaultValues?: Record<string, any>,
  ): void {
    const assignAttributes: Record<string, any> | undefined = this.buildAssignAttributes(attributes);
    const includeKeysList = this.buildIncludeKeys(includeKeys);
    this.assignAttributes(assignAttributes, includeKeysList);
    this.assignDefaults(defaultValues, includeKeysList);
  }
  protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[]): this {
    if (!attributes) {
      return this;
    }
    let keys;
    if (includeKeys) {
      keys = includeKeys;
    } else {
      keys = Object.keys(attributes);
    }
    keys.forEach((key) => {
      if (key in attributes) {
        // Trigger key setter for object instance
        // @ts-ignore
        this[key] = cloneMarshalling(attributes[key]);
      }
    });
    return this;
  }
  protected assignDefaults(defaultValues?: Record<string, any>, includeKeys?: string[]): this {
    if (defaultValues && checkIsObjectLike(defaultValues)) {
      if (includeKeys) {
        Object.keys(defaultValues).forEach((key: string) => {
          if (includeKeys.includes(key)) {
            this.assignDefaultProperty(key, defaultValues[key]);
          }
        });
      } else {
        Object.keys(defaultValues).forEach((key: string) => {
          this.assignDefaultProperty(key, defaultValues[key]);
        });
      }
    }
    return this;
  }
  protected assignDefaultProperty(
    key: string,
    value: any,
    skipIfKeyNotInObject = false,
    setOnlyIfUndefined = true,
  ): this {
    const isKeyInObject = key in this;
    if (skipIfKeyNotInObject && !isKeyInObject) {
      return this;
    }
    // @ts-ignore
    if (setOnlyIfUndefined && this[key] !== undefined) {
      return this;
    }
    // @ts-ignore
    this[key] = cloneMarshalling(value);
    return this;
  }
  private buildAssignAttributes(
    attributes?: Partial<FillableDto> | Record<string, any>,
  ): Record<string, any> | undefined {
    let assignAttributes: Record<string, any> | undefined;
    if (checkIsObjectLike(attributes)) {
      assignAttributes = classToPlain(cloneMarshalling(this));
    } else {
      assignAttributes = undefined;
    }
    return assignAttributes;
  }
  private buildIncludeKeys(includeKeys?: string[]): string[] | undefined {
    if (!includeKeys || !Array.isArray(includeKeys)) {
      return undefined;
    }
    const keys = Array.from(new Set(includeKeys).values()).filter(isString);
    if (keys.length === 0) {
      return undefined;
    }
    return arraySortStrings(keys);
  }
  private buildOptions(options: any): IOptions {
    if (!options) {
      return OPTIONS_DEFAULT;
    }
    if (!isObject(options)) {
      return OPTIONS_DEFAULT;
    }
    return {
      class:
        // @ts-ignore
        "class" in options && isBoolean(options["class"])
          ? // @ts-ignore
            options["class"]
          : OPTIONS_DEFAULT.class,
      prettify:
        // @ts-ignore
        "prettify" in options && isBoolean(options["prettify"])
          ? // @ts-ignore
            options["prettify"]
          : OPTIONS_DEFAULT.prettify,
      property:
        // @ts-ignore
        "property" in options && isBoolean(options["property"])
          ? // @ts-ignore
            options["property"]
          : OPTIONS_DEFAULT.property,
      value:
        // @ts-ignore
        "value" in options && isBoolean(options["value"])
          ? // @ts-ignore
            options["value"]
          : OPTIONS_DEFAULT.value,
    };
  }
}
