"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FillableDto = exports.validateInstance = exports.anyValueToPrintableString = exports.FILLABLE_DTO_OPTIONS_DEFAULT = void 0;
const strings_1 = require("@corefunc/corefunc/array/sort/strings");
const is_object_like_1 = require("@corefunc/corefunc/check/is-object-like");
const clone_marshalling_1 = require("@corefunc/v8/clone/clone-marshalling");
const from_string_1 = require("@corefunc/v8/deserialize/from-string");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const string_1 = require("@corefunc/corefunc/is/string");
const safe_1 = require("@corefunc/corefunc/json/stringify/safe");
const lock_1 = require("@corefunc/corefunc/object/basic/lock");
const to_string_1 = require("@corefunc/v8/serialize/to-string");
const capitalize_1 = require("@corefunc/corefunc/text/case/capitalize");
/**
 * @name FILLABLE_DTO_OPTIONS_DEFAULT
 * @const
 * @property {boolean=} [class=false] Add class name into error description. Default - false.
 * @property {boolean=} [prettify=true] Prettify output. Default - true.
 * @property {boolean=} [property=false] Add property name into error description. Default - false.
 * @property {boolean=} [value=false] Add value into error description. Default - false.
 */
exports.FILLABLE_DTO_OPTIONS_DEFAULT = {
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
function anyValueToPrintableString(value) {
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
    return (0, safe_1.jsonStringifySafe)(value);
}
exports.anyValueToPrintableString = anyValueToPrintableString;
/**
 * @name validateInstance
 * @param {object} instance Instance of class with decorators from 'class-validator'.
 * @returns {string[]} List of errors if exists.
 * @since 1.2.0
 */
function validateInstance(instance) {
    if (!(0, class_validator_1.isObject)(instance)) {
        return [`Provided value is not an object. Value is [${anyValueToPrintableString(instance)}].`];
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
        const value = `Value is [${anyValueToPrintableString(error.value)}].`;
        const message = `Failed: ${failed}.`;
        return `${where} ${property} ${value} ${message}`;
    });
}
exports.validateInstance = validateInstance;
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
class FillableDto {
    //#region Static
    static fromJSON(json) {
        return this.fromPlainObject(JSON.parse(json));
    }
    static fromPlainObject(plain) {
        return (0, class_transformer_1.plainToClass)(this, plain);
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
        return (0, from_string_1.deserializeFromString)(binaryString, toPrototype);
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
        (0, lock_1.objectBasicLock)(this);
        return this;
    }
    toJSON() {
        return (0, safe_1.jsonStringifySafe)(this.toPlainObject());
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
     * @returns {Record<string, unknown>>}
     * @since 1.2.1
     */
    toJsonObject() {
        return JSON.parse(this.toJSON());
    }
    /**
     * @name toObject
     * @returns {FillableDto}
     * @since 1.2.1
     */
    toObject() {
        return (0, clone_marshalling_1.cloneMarshalling)(this);
    }
    /**
     * @name toString
     * @description Serialize DTO to binary string.
     * @returns {string}
     * @since 1.2.1
     */
    toString() {
        return (0, to_string_1.serializeToString)(this.toPlainObject());
    }
    /**
     * @name toPlainObject
     * @returns {Record<string, unknown>}
     * @since 1.2.1
     */
    toPlainObject() {
        return (0, class_transformer_1.instanceToPlain)((0, clone_marshalling_1.cloneMarshalling)(this));
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
    //#endregion
    //#region Validation
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
                value = `Value is [${anyValueToPrintableString(error.value)}].`;
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
        this[key] = (0, clone_marshalling_1.cloneMarshalling)(value);
        return this;
    }
    buildAssignAttributes(attributes) {
        let assignAttributes;
        if ((0, is_object_like_1.checkIsObjectLike)(attributes)) {
            assignAttributes = (0, class_transformer_1.instanceToPlain)((0, clone_marshalling_1.cloneMarshalling)(attributes));
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
