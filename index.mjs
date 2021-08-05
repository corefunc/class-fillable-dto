import { classToPlain, plainToClass } from "class-transformer";
import { cloneMarshalling } from "@corefunc/v8/clone/clone-marshalling.mjs";
import { isBoolean, isObject, validateSync } from "class-validator";
import { jsonStringifySafe } from "@corefunc/corefunc/json/stringify/safe.mjs";
import { textCaseCapitalize } from "@corefunc/corefunc/text/case/capitalize.mjs";

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
export class FillableDto {
  static factory(attributes, includeKeys) {
    return new FillableDto(attributes, includeKeys);
  }
  static fromJSON(json) {
    return this.fromPlain(JSON.parse(json));
  }
  static fromPlain(plain) {
    // @ts-ignore
    return plainToClass(this, plain);
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
    return classToPlain(cloneMarshalling(this));
  }
  toString() {
    return jsonStringifySafe(this.toObject());
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
  assign(attributes, includeKeys) {
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
  assignDefault(
    key,
    value,
    skipIfKeyNotInObject = false,
    setOnlyIfUndefined = true
  ) {
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
  buildOptions(options) {
    if (!options) {
      return OPTIONS_DEFAULT;
    }
    if (!isObject(options)) {
      return OPTIONS_DEFAULT;
    }
    return {
      class:
        "class" in options && isBoolean(options["class"])
          ? options["class"]
          : OPTIONS_DEFAULT.class,
      prettify:
        "prettify" in options && isBoolean(options["prettify"])
          ? options["prettify"]
          : OPTIONS_DEFAULT.prettify,
      property:
        "property" in options && isBoolean(options["property"])
          ? options["property"]
          : OPTIONS_DEFAULT.property,
      value:
        "value" in options && isBoolean(options["value"])
          ? options["value"]
          : OPTIONS_DEFAULT.value,
    };
  }
}
