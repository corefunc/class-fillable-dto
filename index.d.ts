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
 * public constructor(attributes: IMyAttributes) {
 *   super(attributes);
 *   if (this.isValid === undefined) {
 *     this.isValid = false;
 *   }
 * }
 * ```
 */
export declare abstract class FillableDto {
    static factory(attributes?: Partial<FillableDto> | Record<string, any>, includeKeys?: string[]): Record<string, any>;
    static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type>;
    static fromPlain<Type extends typeof FillableDto>(this: Type, plain: Record<string, any>): InstanceType<Type>;
    /**
     * @constructor
     * @param {Object=} attributes Data Transfer Object attributes to be set
     * @param {Array.<String>=} includeKeys Include only specific properties
     * @protected
     */
    constructor(attributes?: Partial<FillableDto> | Record<string, any>, includeKeys?: string[]);
    toJSON(): Record<string, any>;
    toObject(): Record<string, any>;
    toString(): string;
    isValid(silent?: boolean): boolean;
    protected assign(attributes?: Record<string, any>, includeKeys?: string[]): this;
    protected assignDefault(key: string, value: any, skipIfKeyNotInObject?: boolean, setOnlyIfUndefined?: boolean): this;
    getError(options?: IOptions): null | string;
    getErrors(options?: IOptions): string[];
    private buildOptions;
}
