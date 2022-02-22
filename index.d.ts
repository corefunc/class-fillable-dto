export interface IFillableDtoOptions {
    class: boolean;
    property: boolean;
    value: boolean;
    prettify: boolean;
}
export declare const FILLABLE_DTO_OPTIONS_DEFAULT: IFillableDtoOptions;
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
export declare abstract class FillableDto {
    static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type>;
    static fromPlain<Type extends typeof FillableDto>(this: Type, plain: Record<string, any> | Readonly<Record<string, any>>): InstanceType<Type>;
    constructor(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>);
    assign(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>): this;
    getError(options?: IFillableDtoOptions): null | string;
    getErrors(options?: IFillableDtoOptions): string[];
    isValid(silent?: boolean): boolean;
    lock(): void;
    toJSON(): Record<string, any>;
    toObject(): Record<string, any>;
    toString(): string;
    protected assignAll(attributes?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>, defaultValues?: Record<string, any> | Readonly<Record<string, any>>): void;
    protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[] | ReadonlyArray<string>): this;
    protected assignDefaults(defaultValues?: Record<string, any> | Readonly<Record<string, any>>, includeKeys?: string[] | ReadonlyArray<string>): this;
    protected assignDefaultProperty(key: string, value: any, skipIfKeyNotInObject?: boolean, setOnlyIfUndefined?: boolean): this;
    protected buildAssignAttributes(attributes?: Record<string, any> | Readonly<Record<string, any>>): Record<string, any> | undefined;
    protected buildIncludeKeys(includeKeys?: string[] | ReadonlyArray<string>): string[] | undefined;
    protected buildOptions(options?: any): IFillableDtoOptions;
}
/**
 * @name validateInstance
 * @param {object} instance Instance of class with decorators from 'class-validator'.
 * @returns {string[]} List of errors if exists.
 * @since 1.2.0
 */
export declare function validateInstance<T extends object>(instance: T): string[];
