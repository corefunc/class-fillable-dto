import { classToPlain, plainToClass } from "class-transformer";
import { isBoolean, isObject, validateSync } from "class-validator";
import { arraySortStrings } from "@corefunc/corefunc/array/sort/strings";
import { checkIsObjectLike } from "@corefunc/corefunc/check/is-object-like";
import { isString } from "@corefunc/corefunc/is/string";
import { jsonStringifySafe } from "@corefunc/corefunc/json/stringify/safe";
import { objectBasicLock } from "@corefunc/corefunc/object/basic/lock";
import { textCaseCapitalize } from "@corefunc/corefunc/text/case/capitalize";
import { cloneMarshalling } from "@corefunc/v8/clone/clone-marshalling";
export const FILLABLE_DTO_OPTIONS_DEFAULT = {
  class: false,
  prettify: true,
  property: false,
  value: false,
};
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
export class FillableDto {
  static fromJSON(json) {
    return this.fromPlain(JSON.parse(json));
  }
  static fromPlain(plain) {
    return plainToClass(this, plain);
  }
  constructor(attributes, includeKeys, defaultValues) {
    this.assignAll(attributes, includeKeys, defaultValues);
  }
  assign(attributes, includeKeys, defaultValues) {
    this.assignAll(attributes, includeKeys, defaultValues);
    return this;
  }
  getError(options) {
    const errors = this.getErrors(options);
    if (errors.length === 0) {
      return null;
    }
    return errors.join(" ").trim();
  }
  getErrors(options) {
    const opts = this.buildOptions(options);
    const validationErrors = validateSync(this, {
      validationError: { target: false },
    });
    if (validationErrors.length === 0) {
      return [];
    }
    const constructorName = this.constructor.name;
    return validationErrors.map(function errorToSentence(error) {
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
  isValid(silent = false) {
    const validationErrors = validateSync(this);
    if (silent) {
      return Boolean(validationErrors.length === 0);
    }
    if (validationErrors.length === 0) {
      return true;
    }
    const constructorName = this.constructor.name;
    const errorText = validationErrors
      .map(function errorToSentence(error) {
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
  lock() {
    objectBasicLock(this);
  }
  toJSON() {
    return this.toObject();
  }
  toObject() {
    return classToPlain(cloneMarshalling(this));
  }
  toString() {
    return jsonStringifySafe(this.toObject());
  }
  assignAll(attributes, includeKeys, defaultValues) {
    const assignAttributes = this.buildAssignAttributes(attributes);
    const includeKeysList = this.buildIncludeKeys(includeKeys);
    this.assignAttributes(assignAttributes, includeKeysList);
    this.assignDefaults(defaultValues, includeKeysList);
  }
  assignAttributes(attributes, includeKeys) {
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
        this[key] = cloneMarshalling(attributes[key]);
      }
    });
    return this;
  }
  assignDefaults(defaultValues, includeKeys) {
    if (defaultValues && checkIsObjectLike(defaultValues)) {
      if (includeKeys) {
        Object.keys(defaultValues).forEach((key) => {
          if (includeKeys.includes(key)) {
            this.assignDefaultProperty(key, defaultValues[key]);
          }
        });
      } else {
        Object.keys(defaultValues).forEach((key) => {
          this.assignDefaultProperty(key, defaultValues[key]);
        });
      }
    }
    return this;
  }
  assignDefaultProperty(key, value, skipIfKeyNotInObject = false, setOnlyIfUndefined = true) {
    const isKeyInObject = key in this;
    if (skipIfKeyNotInObject && !isKeyInObject) {
      return this;
    }
    if (setOnlyIfUndefined && this[key] !== undefined) {
      return this;
    }
    this[key] = cloneMarshalling(value);
    return this;
  }
  buildAssignAttributes(attributes) {
    let assignAttributes;
    if (checkIsObjectLike(attributes)) {
      assignAttributes = classToPlain(cloneMarshalling(attributes));
    } else {
      assignAttributes = undefined;
    }
    return assignAttributes;
  }
  buildIncludeKeys(includeKeys) {
    if (!includeKeys || !Array.isArray(includeKeys)) {
      return undefined;
    }
    const keys = Array.from(new Set(includeKeys).values()).filter(isString);
    if (keys.length === 0) {
      return undefined;
    }
    return arraySortStrings(keys);
  }
  buildOptions(options) {
    if (!options) {
      return FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    if (!isObject(options)) {
      return FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    return {
      class: "class" in options && isBoolean(options["class"]) ? options["class"] : FILLABLE_DTO_OPTIONS_DEFAULT.class,
      prettify:
        "prettify" in options && isBoolean(options["prettify"])
          ? options["prettify"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.prettify,
      property:
        "property" in options && isBoolean(options["property"])
          ? options["property"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.property,
      value: "value" in options && isBoolean(options["value"]) ? options["value"] : FILLABLE_DTO_OPTIONS_DEFAULT.value,
    };
  }
}
