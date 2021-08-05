"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FillableDto = void 0;
const class_transformer_1 = require("class-transformer");
const clone_marshalling_1 = require("@corefunc/v8/clone/clone-marshalling");
const class_validator_1 = require("class-validator");
const safe_1 = require("@corefunc/corefunc/json/stringify/safe");
const capitalize_1 = require("@corefunc/corefunc/text/case/capitalize");
const OPTIONS_DEFAULT = {
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
 * public constructor(attributes: IMyAttributes) {
 *   super(attributes);
 *   if (this.isValid === undefined) {
 *     this.isValid = false;
 *   }
 * }
 * ```
 */
class FillableDto {
    static fromJSON(json) {
        return this.fromPlain(JSON.parse(json));
    }
    static fromPlain(plain) {
        // @ts-ignore
        return class_transformer_1.plainToClass(this, plain);
    }
    /**
     * @constructor
     * @param {Object=} attributes Data Transfer Object attributes to be set
     * @param {Array.<String>=} includeKeys Include only specific properties
     * @protected
     */
    constructor(attributes, includeKeys) {
        this.assign(attributes, includeKeys);
    }
    toJSON() {
        return this.toObject();
    }
    toObject() {
        return class_transformer_1.classToPlain(clone_marshalling_1.cloneMarshalling(this));
    }
    toString() {
        return safe_1.jsonStringifySafe(this.toObject());
    }
    isValid(silent = false) {
        const validationErrors = class_validator_1.validateSync(this);
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
                .map((text) => `${capitalize_1.textCaseCapitalize(String(text))}`)
                .join(". ")}`;
            const where = `Error in [${constructorName}].`;
            const property = `Property [${error.property}].`;
            const value = `Value is [${safe_1.jsonStringifySafe(error.value)}].`;
            const message = `Failed: ${failed}.`;
            return `${where} ${property} ${value} ${message}`;
        })
            .join(" ");
        throw new Error(errorText);
    }
    assign(attributes, includeKeys) {
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
                this[key] = clone_marshalling_1.cloneMarshalling(attributes[key]);
            }
        });
        return this;
    }
    assignDefault(key, value, skipIfKeyNotInObject = false, setOnlyIfUndefined = true) {
        const isKeyInObject = key in this;
        if (skipIfKeyNotInObject && !isKeyInObject) {
            return this;
        }
        // @ts-ignore
        if (setOnlyIfUndefined && this[key] !== undefined) {
            return this;
        }
        // @ts-ignore
        this[key] = clone_marshalling_1.cloneMarshalling(value);
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
        const validationErrors = class_validator_1.validateSync(this, {
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
                value = `Value is [${safe_1.jsonStringifySafe(error.value)}].`;
            }
            let message;
            if (opts.prettify) {
                const failedPretty = Object.values(constraints)
                    .map((text) => String(text).replace(error.property, `[${error.property}]`).trim())
                    .map((text) => capitalize_1.textCaseCapitalize(String(text)))
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
    buildOptions(options) {
        if (!options) {
            return OPTIONS_DEFAULT;
        }
        if (!class_validator_1.isObject(options)) {
            return OPTIONS_DEFAULT;
        }
        return {
            class: "class" in options && class_validator_1.isBoolean(options["class"])
                ? options["class"]
                : OPTIONS_DEFAULT.class,
            prettify: "prettify" in options && class_validator_1.isBoolean(options["prettify"])
                ? options["prettify"]
                : OPTIONS_DEFAULT.prettify,
            property: "property" in options && class_validator_1.isBoolean(options["property"])
                ? options["property"]
                : OPTIONS_DEFAULT.property,
            value: "value" in options && class_validator_1.isBoolean(options["value"])
                ? options["value"]
                : OPTIONS_DEFAULT.value,
        };
    }
}
exports.FillableDto = FillableDto;
//# sourceMappingURL=index.js.map
