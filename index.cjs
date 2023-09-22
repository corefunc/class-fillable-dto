var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.ts
var class_fillable_dto_exports = {};
__export(class_fillable_dto_exports, {
  FILLABLE_DTO_OPTIONS_DEFAULT: () => FILLABLE_DTO_OPTIONS_DEFAULT,
  FillableDto: () => FillableDto,
  anyValueToPrintableString: () => anyValueToPrintableString,
  validateInstance: () => validateInstance
});
module.exports = __toCommonJS(class_fillable_dto_exports);
var import_strings = require("@corefunc/corefunc/array/sort/strings");
var import_is_object_like = require("@corefunc/corefunc/check/is-object-like");
var import_clone_marshalling = require("@corefunc/v8/clone/clone-marshalling");
var import_from_string = require("@corefunc/v8/deserialize/from-string");
var import_class_transformer = require("class-transformer");
var import_class_validator = require("class-validator");
var import_string = require("@corefunc/corefunc/is/string");
var import_safe = require("@corefunc/corefunc/json/stringify/safe");
var import_lock = require("@corefunc/corefunc/object/basic/lock");
var import_to_string = require("@corefunc/v8/serialize/to-string");
var import_capitalize = require("@corefunc/corefunc/text/case/capitalize");
var FILLABLE_DTO_OPTIONS_DEFAULT = {
  class: false,
  prettify: true,
  property: false,
  value: false
};
function anyValueToPrintableString(value) {
  if (typeof value === "string") {
    return `'${value}'`;
  } else if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  } else if (value === void 0) {
    return "undefined";
  } else if (value === null) {
    return "null";
  }
  return (0, import_safe.jsonStringifySafe)(value);
}
function validateInstance(instance) {
  if (!(0, import_class_validator.isObject)(instance)) {
    return [`Provided value is not an object. Value is [${anyValueToPrintableString(instance)}].`];
  }
  const validationErrors = (0, import_class_validator.validateSync)(instance);
  if (validationErrors.length === 0) {
    return [];
  }
  const constructorName = instance.constructor.name;
  return validationErrors.map(function errorToSentence(error) {
    const constraints = {};
    if ("constraints" in error) {
      Object.assign(constraints, error.constraints);
    } else if ("children" in error) {
      return (error.children || []).map(errorToSentence).join(" ");
    }
    const failed = `${Object.values(constraints).map((text) => `${(0, import_capitalize.textCaseCapitalize)(String(text))}`).join(". ")}`;
    const where = `Error in [${constructorName}].`;
    const property = `Property [${error.property}].`;
    const value = `Value is [${anyValueToPrintableString(error.value)}].`;
    const message = `Failed: ${failed}.`;
    return `${where} ${property} ${value} ${message}`;
  });
}
var FillableDto = class {
  static fromJSON(json) {
    return this.fromPlainObject(JSON.parse(json));
  }
  static fromPlainObject(plain) {
    return (0, import_class_transformer.plainToClass)(this, plain);
  }
  static fromBinaryString(binaryString, toPrototype) {
    return (0, import_from_string.deserializeFromString)(binaryString, toPrototype);
  }
  constructor(attributes, includeKeys, defaultValues) {
    this.assignAll(attributes, includeKeys, defaultValues);
  }
  clone() {
    return this.toObject();
  }
  lock() {
    (0, import_lock.objectBasicLock)(this);
    return this;
  }
  toJSON() {
    return (0, import_safe.jsonStringifySafe)(this.toPlainObject());
  }
  toJson() {
    return this.toJSON();
  }
  toJsonObject() {
    return JSON.parse(this.toJSON());
  }
  toObject() {
    return (0, import_clone_marshalling.cloneMarshalling)(this);
  }
  toString() {
    return (0, import_to_string.serializeToString)(this.toPlainObject());
  }
  toPlainObject() {
    return (0, import_class_transformer.instanceToPlain)((0, import_clone_marshalling.cloneMarshalling)(this));
  }
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
    } else {
      keys = Object.keys(attributes);
    }
    keys.forEach((key) => {
      if (key in attributes) {
        this[key] = (0, import_clone_marshalling.cloneMarshalling)(attributes[key]);
      }
    });
    return this;
  }
  assignDefaults(defaultValues, includeKeys) {
    if (defaultValues && (0, import_is_object_like.checkIsObjectLike)(defaultValues)) {
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
  isValid(silent = false) {
    const validationErrors = (0, import_class_validator.validateSync)(this);
    if (silent) {
      return Boolean(validationErrors.length === 0);
    }
    if (validationErrors.length === 0) {
      return true;
    }
    const constructorName = this.constructor.name;
    const errorText = validationErrors.map(function errorToSentence(error) {
      const constraints = {};
      if ("constraints" in error) {
        Object.assign(constraints, error.constraints);
      } else if ("children" in error) {
        return (error.children || []).map(errorToSentence).join(" ");
      }
      const failed = `${Object.values(constraints).map((text) => `${(0, import_capitalize.textCaseCapitalize)(String(text))}`).join(". ")}`;
      const where = `Error in [${constructorName}].`;
      const property = `Property [${error.property}].`;
      const value = `Value is [${anyValueToPrintableString(error.value)}].`;
      const message = `Failed: ${failed}.`;
      return `${where} ${property} ${value} ${message}`;
    }).join(" ");
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
    const validationErrors = (0, import_class_validator.validateSync)(this, {
      validationError: { target: false }
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
        value = `Value is [${anyValueToPrintableString(error.value)}].`;
      }
      let message;
      if (opts.prettify) {
        const failedPretty = Object.values(constraints).map((text) => {
          if (opts.property) {
            return String(text).replace(error.property, `[${error.property}]`).trim();
          } else {
            return String(text).replace(error.property, "").trim();
          }
        }).map((text) => (0, import_capitalize.textCaseCapitalize)(String(text))).map((text) => String(text).trim()).join(". ");
        message = `${failedPretty}.`;
      } else {
        message = Object.values(constraints).map((text) => String(text).trim()).join(". ");
      }
      return `${where} ${property} ${value} ${message}`.trim();
    });
  }
  throwErrorOnInvalid(startWith = "", endWith = "", options) {
    const error = this.getError(__spreadValues(__spreadValues({}, FILLABLE_DTO_OPTIONS_DEFAULT), options));
    if (error) {
      throw new Error(`${startWith}${error}${endWith}`);
    }
  }
  throwErrorOnInvalidValue(startWith = "", endWith = "", options) {
    const error = this.getError(__spreadValues({ class: false, prettify: true, property: false, value: true }, options));
    if (error) {
      throw new Error(`${startWith}${error}${endWith}`);
    }
  }
  assignDefaultProperty(key, value, skipIfKeyNotInObject = false, setOnlyIfUndefined = true) {
    const isKeyInObject = key in this;
    if (skipIfKeyNotInObject && !isKeyInObject) {
      return this;
    }
    if (setOnlyIfUndefined && this[key] !== void 0) {
      return this;
    }
    this[key] = (0, import_clone_marshalling.cloneMarshalling)(value);
    return this;
  }
  buildAssignAttributes(attributes) {
    let assignAttributes;
    if ((0, import_is_object_like.checkIsObjectLike)(attributes)) {
      assignAttributes = (0, import_class_transformer.instanceToPlain)((0, import_clone_marshalling.cloneMarshalling)(attributes));
      Object.keys(attributes).forEach((key) => {
        if (attributes[key] instanceof Date) {
          const clonedDate = new Date();
          clonedDate.setTime(attributes[key].getTime());
          assignAttributes[key] = clonedDate;
        }
      });
    } else {
      assignAttributes = void 0;
    }
    return assignAttributes;
  }
  buildIncludeKeys(includeKeys) {
    if (!includeKeys || !Array.isArray(includeKeys)) {
      return void 0;
    }
    const keys = Array.from(new Set(includeKeys).values()).filter(import_string.isString);
    if (keys.length === 0) {
      return void 0;
    }
    return (0, import_strings.arraySortStrings)(keys);
  }
  buildOptions(options) {
    if (!options) {
      return FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    if (!(0, import_class_validator.isObject)(options)) {
      return FILLABLE_DTO_OPTIONS_DEFAULT;
    }
    return {
      class: "class" in options && (0, import_class_validator.isBoolean)(options["class"]) ? options["class"] : FILLABLE_DTO_OPTIONS_DEFAULT.class,
      prettify: "prettify" in options && (0, import_class_validator.isBoolean)(options["prettify"]) ? options["prettify"] : FILLABLE_DTO_OPTIONS_DEFAULT.prettify,
      property: "property" in options && (0, import_class_validator.isBoolean)(options["property"]) ? options["property"] : FILLABLE_DTO_OPTIONS_DEFAULT.property,
      value: "value" in options && (0, import_class_validator.isBoolean)(options["value"]) ? options["value"] : FILLABLE_DTO_OPTIONS_DEFAULT.value
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FILLABLE_DTO_OPTIONS_DEFAULT,
  FillableDto,
  anyValueToPrintableString,
  validateInstance
});
