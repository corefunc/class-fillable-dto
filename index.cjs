"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInstance = exports.FillableDto = exports.FILLABLE_DTO_OPTIONS_DEFAULT = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const strings_1 = require("@corefunc/corefunc/array/sort/strings");
const is_object_like_1 = require("@corefunc/corefunc/check/is-object-like");
const string_1 = require("@corefunc/corefunc/is/string");
const safe_1 = require("@corefunc/corefunc/json/stringify/safe");
const lock_1 = require("@corefunc/corefunc/object/basic/lock");
const capitalize_1 = require("@corefunc/corefunc/text/case/capitalize");
const clone_marshalling_1 = require("@corefunc/v8/clone/clone-marshalling");
exports.FILLABLE_DTO_OPTIONS_DEFAULT = {
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
class FillableDto {
  // @ts-ignore
  static fromJSON(json) {
    return this.fromPlain(JSON.parse(json));
  }
  // @ts-ignore
  static fromPlain(plain) {
    // @ts-ignore
    return (0, class_transformer_1.plainToClass)(this, plain);
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
    const validationErrors = (0, class_validator_1.validateSync)(this, {
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
        value = `Value is [${(0, safe_1.jsonStringifySafe)(error.value)}].`;
      }
      let message;
      if (opts.prettify) {
        const failedPretty = Object.values(constraints)
          .map((text) => String(text).replace(error.property, `[${error.property}]`).trim())
          .map((text) => (0, capitalize_1.textCaseCapitalize)(String(text)))
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
  isValid(silent = false) {
    const validationErrors = (0, class_validator_1.validateSync)(this);
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
          .map((text) => `${(0, capitalize_1.textCaseCapitalize)(String(text))}`)
          .join(". ")}`;
        const where = `Error in [${constructorName}].`;
        const property = `Property [${error.property}].`;
        const value = `Value is [${(0, safe_1.jsonStringifySafe)(error.value)}].`;
        const message = `Failed: ${failed}.`;
        return `${where} ${property} ${value} ${message}`;
      })
      .join(" ");
    throw new Error(errorText);
  }
  lock() {
    (0, lock_1.objectBasicLock)(this);
  }
  toJSON() {
    return this.toObject();
  }
  toObject() {
    return (0, class_transformer_1.classToPlain)((0, clone_marshalling_1.cloneMarshalling)(this));
  }
  toString() {
    return (0, safe_1.jsonStringifySafe)(this.toObject());
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
    }
    else {
      keys = Object.keys(attributes);
    }
    keys.forEach((key) => {
      if (key in attributes) {
        // Trigger key setter for object instance
        // @ts-ignore
        this[key] = (0, clone_marshalling_1.cloneMarshalling)(attributes[key]);
      }
    });
    return this;
  }
  assignDefaults(defaultValues, includeKeys) {
    if (defaultValues && (0, is_object_like_1.checkIsObjectLike)(defaultValues)) {
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
    this[key] = (0, clone_marshalling_1.cloneMarshalling)(value);
    return this;
  }
  buildAssignAttributes(attributes) {
    let assignAttributes;
    if ((0, is_object_like_1.checkIsObjectLike)(attributes)) {
      assignAttributes = (0, class_transformer_1.classToPlain)((0, clone_marshalling_1.cloneMarshalling)(attributes));
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
    const keys = Array.from(new Set(includeKeys).values()).filter(string_1.isString);
    if (keys.length === 0) {
      return undefined;
    }
    return (0, strings_1.arraySortStrings)(keys);
  }
  buildOptions(options) {
    if (!options) {
      return exports.FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    if (!(0, class_validator_1.isObject)(options)) {
      return exports.FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    return {
      class:
      // @ts-ignore
        "class" in options && (0, class_validator_1.isBoolean)(options["class"])
          ? // @ts-ignore
          options["class"]
          : exports.FILLABLE_DTO_OPTIONS_DEFAULT.class,
      prettify:
      // @ts-ignore
        "prettify" in options && (0, class_validator_1.isBoolean)(options["prettify"])
          ? // @ts-ignore
          options["prettify"]
          : exports.FILLABLE_DTO_OPTIONS_DEFAULT.prettify,
      property:
      // @ts-ignore
        "property" in options && (0, class_validator_1.isBoolean)(options["property"])
          ? // @ts-ignore
          options["property"]
          : exports.FILLABLE_DTO_OPTIONS_DEFAULT.property,
      value:
      // @ts-ignore
        "value" in options && (0, class_validator_1.isBoolean)(options["value"])
          ? // @ts-ignore
          options["value"]
          : exports.FILLABLE_DTO_OPTIONS_DEFAULT.value,
    };
  }
}
exports.FillableDto = FillableDto;
/**
 * @name validateInstance
 * @param {object} instance Instance of class with decorators from 'class-validator'.
 * @returns {string[]} List of errors if exists.
 * @since 1.2.0
 */
function validateInstance(instance) {
  if (!(0, class_validator_1.isObject)(instance)) {
    return [`Provided value is not an object. Value is [${(0, safe_1.jsonStringifySafe)(instance)}].`];
  }
  const validationErrors = (0, class_validator_1.validateSync)(instance);
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
      .map((text) => `${(0, capitalize_1.textCaseCapitalize)(String(text))}`)
      .join(". ")}`;
    const where = `Error in [${constructorName}].`;
    const property = `Property [${error.property}].`;
    const value = `Value is [${(0, safe_1.jsonStringifySafe)(error.value)}].`;
    const message = `Failed: ${failed}.`;
    return `${where} ${property} ${value} ${message}`;
  });
}
exports.validateInstance = validateInstance;
