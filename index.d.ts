export interface IOptions {
    class: boolean;
    property: boolean;
    value: boolean;
    prettify: boolean;
}
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
    // @ts-ignore
    static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type>;
    // @ts-ignore
    static fromPlain<Type extends typeof FillableDto>(this: Type, plain: Record<string, any>): InstanceType<Type>;
    constructor(attributes?: Partial<FillableDto> | Record<string, any>, includeKeys?: string[], defaultValues?: Record<string, any>);
    assign(attributes?: Partial<FillableDto> | Record<string, any>, includeKeys?: string[], defaultValues?: Record<string, any>): this;
    getError(options?: IOptions): null | string;
    getErrors(options?: IOptions): string[];
    isValid(silent?: boolean): boolean;
    lock(): void;
    toJSON(): Record<string, any>;
    toObject(): Record<string, any>;
    toString(): string;
    protected assignAll(attributes?: Partial<FillableDto> | Record<string, any>, includeKeys?: string[], defaultValues?: Record<string, any>): void;
    protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[]): this;
    protected assignDefaults(defaultValues?: Record<string, any>, includeKeys?: string[]): this;
    protected assignDefaultProperty(key: string, value: any, skipIfKeyNotInObject?: boolean, setOnlyIfUndefined?: boolean): this;
    private buildAssignAttributes;
    private buildIncludeKeys;
    private buildOptions;
}
