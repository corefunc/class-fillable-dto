import { classToPlain, plainToClass } from "class-transformer";
import { cloneMarshalling } from "@corefunc/v8/clone/clone-marshalling";
import { isBoolean, isObject, validateSync } from "class-validator";
import { jsonStringifySafe } from "@corefunc/corefunc/json/stringify/safe";
import { textCaseCapitalize } from "@corefunc/corefunc/text/case/capitalize";

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
 * public constructor(attributes: IMyAttributes) {
 *   super(attributes);
 *   if (this.isValid === undefined) {
 *     this.isValid = false;
 *   }
 * }
 * ```
 */
export abstract class FillableDto {
  public static factory(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[]
  ): Record<string, any> {
    return new (FillableDto as any)(attributes, includeKeys);
  }
  public static fromJSON<Type extends typeof FillableDto>(
    this: Type,
    json: string
  ): InstanceType<Type> {
    return this.fromPlain(JSON.parse(json));
  }
  public static fromPlain<Type extends typeof FillableDto>(
    this: Type,
    plain: Record<string, any>
  ): InstanceType<Type> {
    // @ts-ignore
    return plainToClass(this, plain) as InstanceType<Type>;
  }
  /**
   * @constructor
   * @param {Object=} attributes Data Transfer Object attributes to be set
   * @param {Array.<String>=} includeKeys Include only specific properties
   * @protected
   */
  public constructor(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[]
  ) {
    this.assign(attributes, includeKeys);
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
  protected assign(
    attributes?: Record<string, any>,
    includeKeys?: string[]
  ): this {
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
  protected assignDefault(
    key: string,
    value: any,
    skipIfKeyNotInObject = false,
    setOnlyIfUndefined = true
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
          .map((text) =>
            String(text).replace(error.property, `[${error.property}]`).trim()
          )
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
