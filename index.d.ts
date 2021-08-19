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
  public static fromJSON<Type extends typeof FillableDto>(this: Type, json: string): InstanceType<Type>;
  // @ts-ignore
  public static fromPlain<Type extends typeof FillableDto>(this: Type, plain: Record<string, any>): InstanceType<Type>;
  public constructor(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[],
    defaultValues?: Record<string, any>,
  );
  public assign(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[],
    defaultValues?: Record<string, any>,
  ): this;
  public getError(options?: IOptions): null | string;
  public getErrors(options?: IOptions): string[];
  public isValid(silent?: boolean): boolean;
  public lock(): void;
  public toJSON(): Record<string, any>;
  public toObject(): Record<string, any>;
  public toString(): string;
  protected assignAll(
    attributes?: Partial<FillableDto> | Record<string, any>,
    includeKeys?: string[],
    defaultValues?: Record<string, any>,
  ): void;
  protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[]): this;
  protected assignDefaults(defaultValues?: Record<string, any>, includeKeys?: string[]): this;
  protected assignDefaultProperty(
    key: string,
    value: any,
    skipIfKeyNotInObject?: boolean,
    setOnlyIfUndefined?: boolean,
  ): this;
  protected buildAssignAttributes(
    attributes?: Partial<FillableDto> | Record<string, any>,
  ): Record<string, any> | undefined;
  protected buildIncludeKeys(includeKeys?: string[]): string[] | undefined;
  protected buildOptions(options: any): IOptions;
}
