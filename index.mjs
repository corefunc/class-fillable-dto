import { arraySortStrings } from "@corefunc/corefunc/array/sort/strings";
import { checkIsObjectLike } from "@corefunc/corefunc/check/is-object-like";
import { cloneMarshalling } from "@corefunc/v8/clone/clone-marshalling";
import { deserializeFromString } from "@corefunc/v8/deserialize/from-string";
import { instanceToPlain, plainToClass } from "class-transformer";
import { isBoolean, isObject, validateSync } from "class-validator";
import { isString } from "@corefunc/corefunc/is/string";
import { jsonStringifySafe } from "@corefunc/corefunc/json/stringify/safe";
import { objectBasicLock } from "@corefunc/corefunc/object/basic/lock";
import { serializeToString } from "@corefunc/v8/serialize/to-string";
import { textCaseCapitalize } from "@corefunc/corefunc/text/case/capitalize";
/**
 * @name FILLABLE_DTO_OPTIONS_DEFAULT
 * @const
 * @property {boolean=} [class=false] Add class name into error description. Default - false.
 * @property {boolean=} [prettify=true] Prettify output. Default - true.
 * @property {boolean=} [property=false] Add property name into error description. Default - false.
 * @property {boolean=} [value=false] Add value into error description. Default - false.
 */
export const FILLABLE_DTO_OPTIONS_DEFAULT = {
  class: false,
  prettify: true,
  property: false,
  value: false,
};
/**
 * @name anyValueToPrintableString
 * @param {unknown} value
 * @returns {string}
 * @since 1.2.1
 */
export function anyValueToPrintableString(value) {
  if (typeof value === "string") {
    return `'${value}'`;
  }
  else if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  else if (value === undefined) {
    return "undefined";
  }
  else if (value === null) {
    return "null";
  }
  return jsonStringifySafe(value);
}
/**
 * @name validateInstance
 * @param {object} instance Instance of class with decorators from 'class-validator'.
 * @returns {string[]} List of errors if exists.
 * @since 1.2.0
 */
export function validateInstance(instance) {
  if (!isObject(instance)) {
    return [`Provided value is not an object. Value is [${anyValueToPrintableString(instance)}].`];
  }
  const validationErrors = validateSync(instance);
  if (validationErrors.length === 0) {
    return [];
  }
  const constructorName = instance.constructor.name;
  return validationErrors.map(function errorToSentence(error) {
    const constraints = {};
    if ("constraints" in error) {
      Object.assign(constraints, error.constraints);
    }
    else if ("children" in error) {
      return (error.children || []).map(errorToSentence).join(" ");
    }
    const failed = `${Object.values(constraints)
      .map((text) => `${textCaseCapitalize(String(text))}`)
      .join(". ")}`;
    const where = `Error in [${constructorName}].`;
    const property = `Property [${error.property}].`;
    const value = `Value is [${anyValueToPrintableString(error.value)}].`;
    const message = `Failed: ${failed}.`;
    return `${where} ${property} ${value} ${message}`;
  });
}
/**
 * @class FillableDto
 * @description
 * Classes extended from `FillableDto` shouldn't have default values for class members.
 * Use constructor instead.
 * @example ```
 * export class ErrorDto extends FillableDto {
 *  public readonly message: string;
 * }
 * ```
 */
export class FillableDto {
  //#region Static
  static fromJSON(json) {
    return this.fromPlainObject(JSON.parse(json));
  }
  static fromPlainObject(plain) {
    return plainToClass(this, plain);
  }
  /**
   * @name fromBinaryString
   * @description Deserialize DTO to plain object from binary string.
   * @param {string} binaryString
   * @param {Object=} toPrototype
   * @returns {FillableDto}
   * @throws {Error}
   * @since 1.2.1
   */
  static fromBinaryString(binaryString, toPrototype) {
    return deserializeFromString(binaryString, toPrototype);
  }
  //#endregion
  //#region Basic
  constructor(attributes, includeKeys, defaultValues) {
    this.assignAll(attributes, includeKeys, defaultValues);
  }
  /**
   * @name clone
   * @see FillableDto.toObject()
   * @returns {FillableDto}
   * @since 1.2.1
   */
  clone() {
    return this.toObject();
  }
  /**
   * @name lock
   * @description Lock, freeze and seal object.
   * @returns {FillableDto}
   */
  lock() {
    objectBasicLock(this);
    return this;
  }
  toJSON() {
    return jsonStringifySafe(this.toPlainObject());
  }
  /**
   * @name toJson
   * @see FillableDto.toJSON()
   * @returns {string}
   * @since 1.2.1
   */
  toJson() {
    return this.toJSON();
  }
  /**
   * @name toJsonObject
   * @returns {Record<string, any>>}
   * @since 1.2.1
   */
  toJsonObject() {
    return JSON.parse(this.toJSON());
  }
  /**
   * @name toObject
   * @returns {FillableDto}
   * @since 1.2.6
   */
  toObject() {
    return cloneMarshalling(this);
  }
  /**
   * @name toString
   * @description Serialize DTO to binary string.
   * @returns {string}
   * @since 1.2.1
   */
  toString() {
    return serializeToString(this.toPlainObject());
  }
  /**
   * @name toPlainObject
   * @returns {Record<string, any>}
   * @since 1.2.1
   */
  toPlainObject() {
    return instanceToPlain(cloneMarshalling(this));
  }
  //#endregion
  //#region Assign
  assign(attributes, includeKeys, defaultValues) {
    this.assignAll(attributes, includeKeys, defaultValues);
    return this;
  }
  assignAll(attributes, includeKeys, defaultValues) {
    const assignAttributes = this.buildAssignAttributes(attributes);
    const includeKeysList = this.buildIncludeKeys(includeKeys);
    this.assignAttributes(assignAttributes, includeKeysList);
    this.assignDefaults(defaultValues, includeKeysList);
    return this;
  }
  assignAttributes(attributes, includeKeys) {
    if (!attributes) {
      return this;
    }
    let keys;
    if (includeKeys) {
      keys = includeKeys;
    }
    else {
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
  assignDefaults(defaultValues, includeKeys) {
    if (defaultValues && checkIsObjectLike(defaultValues)) {
      if (includeKeys) {
        Object.keys(defaultValues).forEach((key) => {
          if (includeKeys.includes(key)) {
            this.assignDefaultProperty(key, defaultValues[key]);
          }
        });
      }
      else {
        Object.keys(defaultValues).forEach((key) => {
          this.assignDefaultProperty(key, defaultValues[key]);
        });
      }
    }
    return this;
  }
  //#endregion
  //#region Validation
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
        }
        else if ("children" in error) {
          return (error.children || []).map(errorToSentence).join(" ");
        }
        const failed = `${Object.values(constraints)
          .map((text) => `${textCaseCapitalize(String(text))}`)
          .join(". ")}`;
        const where = `Error in [${constructorName}].`;
        const property = `Property [${error.property}].`;
        const value = `Value is [${anyValueToPrintableString(error.value)}].`;
        const message = `Failed: ${failed}.`;
        return `${where} ${property} ${value} ${message}`;
      })
      .join(" ");
    throw new Error(errorText);
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
      }
      else if ("children" in error) {
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
        value = `Value is [${anyValueToPrintableString(error.value)}].`;
      }
      let message;
      if (opts.prettify) {
        const failedPretty = Object.values(constraints)
          .map((text) => {
            if (opts.property) {
              return String(text).replace(error.property, `[${error.property}]`).trim();
            }
            else {
              return String(text).replace(error.property, "").trim();
            }
          })
          .map((text) => textCaseCapitalize(String(text)))
          .map((text) => String(text).trim())
          .join(". ");
        message = `${failedPretty}.`;
      }
      else {
        message = Object.values(constraints)
          .map((text) => String(text).trim())
          .join(". ");
      }
      return `${where} ${property} ${value} ${message}`.trim();
    });
  }
  throwErrorOnInvalid(startWith = "", endWith = "", options) {
    const error = this.getError(Object.assign(Object.assign({}, FILLABLE_DTO_OPTIONS_DEFAULT), options));
    if (error) {
      throw new Error(`${startWith}${error}${endWith}`);
    }
  }
  throwErrorOnInvalidValue(startWith = "", endWith = "", options) {
    const error = this.getError(Object.assign({ class: false, prettify: true, property: false, value: true }, options));
    if (error) {
      throw new Error(`${startWith}${error}${endWith}`);
    }
  }
  //#endregion
  //#region Protected
  assignDefaultProperty(key, value, skipIfKeyNotInObject = false, setOnlyIfUndefined = true) {
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
  buildAssignAttributes(attributes) {
    let assignAttributes;
    if (checkIsObjectLike(attributes)) {
      assignAttributes = instanceToPlain(cloneMarshalling(attributes));
    }
    else {
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
      class:
      // @ts-ignore
        "class" in options && isBoolean(options["class"])
          ? // @ts-ignore
          options["class"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.class,
      prettify:
      // @ts-ignore
        "prettify" in options && isBoolean(options["prettify"])
          ? // @ts-ignore
          options["prettify"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.prettify,
      property:
      // @ts-ignore
        "property" in options && isBoolean(options["property"])
          ? // @ts-ignore
          options["property"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.property,
      value:
      // @ts-ignore
        "value" in options && isBoolean(options["value"])
          ? // @ts-ignore
          options["value"]
          : FILLABLE_DTO_OPTIONS_DEFAULT.value,
    };
  }
}
