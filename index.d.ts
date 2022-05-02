/**
 * @name FillableDtoOptionsInterface
 * @interface
 * @property {boolean=} [class=false] Add class name into error description. Default - false.
 * @property {boolean=} [prettify=true] Prettify output. Default - true.
 * @property {boolean=} [property=false] Add property name into error description. Default - false.
 * @property {boolean=} [value=false] Add value into error description. Default - false.
 */
export interface FillableDtoOptionsInterface {
    class: boolean;
    prettify: boolean;
    property: boolean;
    value: boolean;
}
/**
 * @name FILLABLE_DTO_OPTIONS_DEFAULT
 * @const
 * @property {boolean=} [class=false] Add class name into error description. Default - false.
 * @property {boolean=} [prettify=true] Prettify output. Default - true.
 * @property {boolean=} [property=false] Add property name into error description. Default - false.
 * @property {boolean=} [value=false] Add value into error description. Default - false.
 */
export declare const FILLABLE_DTO_OPTIONS_DEFAULT: FillableDtoOptionsInterface;
/**
 * @name anyValueToPrintableString
 * @param {unknown} value
 * @returns {string}
 * @since 1.2.1
 */
export declare function anyValueToPrintableString(value: unknown): string;
/**
 * @name validateInstance
 * @param {object} instance Instance of class with decorators from 'class-validator'.
 * @returns {string[]} List of errors if exists.
 * @since 1.2.0
 */
export declare function validateInstance<T extends object>(instance: T): string[];
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
export declare abstract class FillableDto {
    static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type>;
    static fromPlainObject<Type extends typeof FillableDto>(this: Type, plain: Record<string, any> | Readonly<Record<string, any>>): InstanceType<Type>;
    /**
     * @name fromBinaryString
     * @description Deserialize DTO to plain object from binary string.
     * @param {string} binaryString
     * @param {Object=} toPrototype
     * @returns {FillableDto}
     * @throws {Error}
     * @since 1.2.1
     */
    static fromBinaryString<ObjectType extends Record<string, any> | typeof FillableDto>(binaryString: string, toPrototype?: ObjectType): ObjectType;
    constructor(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>);
    /**
     * @name clone
     * @see FillableDto.toObject()
     * @returns {Record<string, any>}
     * @since 1.2.5
     */
    clone(): Record<string, any>;
    /**
     * @name lock
     * @description Lock, freeze and seal object.
     * @returns {FillableDto}
     */
    lock(): this;
    toJSON(): string;
    /**
     * @name toJson
     * @see FillableDto.toJSON()
     * @returns {string}
     * @since 1.2.1
     */
    toJson(): string;
    /**
     * @name toJsonObject
     * @returns {Record<string, any>>}
     * @since 1.2.1
     */
    toJsonObject(): Record<string, any>;
    /**
     * @name toObject
     * @returns {FillableDto}
     * @since 1.2.6
     */
    toObject(): Record<string, any>;
    /**
     * @name toString
     * @description Serialize DTO to binary string.
     * @returns {string}
     * @since 1.2.1
     */
    toString(): string;
    /**
     * @name toPlainObject
     * @returns {Record<string, any>}
     * @since 1.2.1
     */
    toPlainObject(): Record<string, any>;
    assign(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>): this;
    protected assignAll(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>): this;
    protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[] | ReadonlyArray<string>): this;
    protected assignDefaults(defaultValues?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>): this;
    isValid(silent?: boolean): boolean;
    getError(options?: FillableDtoOptionsInterface): null | string;
    getErrors(options?: FillableDtoOptionsInterface): string[];
    throwErrorOnInvalid(startWith?: string, endWith?: string, options?: FillableDtoOptionsInterface): void;
    throwErrorOnInvalidValue(startWith?: string, endWith?: string, options?: FillableDtoOptionsInterface): void;
    protected assignDefaultProperty(key: string, value: any, skipIfKeyNotInObject?: boolean, setOnlyIfUndefined?: boolean): this;
    protected buildAssignAttributes(attributes?: Record<string, any> | Readonly<Record<string, any>>): Record<string, any> | undefined;
    protected buildIncludeKeys(includeKeys?: string[] | ReadonlyArray<string>): string[] | undefined;
    protected buildOptions(options?: any): FillableDtoOptionsInterface;
}
