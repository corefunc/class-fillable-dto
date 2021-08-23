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
  public static fromPlain<Type extends typeof FillableDto>(
    this: Type,
    plain: Record<string, any> | Readonly<Record<string, any>>,
  ): InstanceType<Type>;
  public constructor(
    attributes?: Record<string, any> | Readonly<Record<string, any>>,
    includeKeys?: string[] | ReadonlyArray<string>,
    defaultValues?: Record<string, any> | Readonly<Record<string, any>>,
  );
  public assign(
    attributes?: Record<string, any> | Readonly<Record<string, any>>,
    includeKeys?: string[] | ReadonlyArray<string>,
    defaultValues?: Record<string, any> | Readonly<Record<string, any>>,
  ): this;
  public getError(options?: IOptions): null | string;
  public getErrors(options?: IOptions): string[];
  public isValid(silent?: boolean): boolean;
  public lock(): void;
  public toJSON(): Record<string, any>;
  public toObject(): Record<string, any>;
  public toString(): string;
  protected assignAll(
    attributes?: Record<string, any> | Readonly<Record<string, any>>,
    includeKeys?: string[] | ReadonlyArray<string>,
    defaultValues?: Record<string, any> | Readonly<Record<string, any>>,
  ): void;
  protected assignAttributes(attributes?: Record<string, any>, includeKeys?: string[] | ReadonlyArray<string>): this;
  protected assignDefaults(
    defaultValues?: Record<string, any> | Readonly<Record<string, any>>,
    includeKeys?: string[] | ReadonlyArray<string>,
  ): this;
  protected assignDefaultProperty(
    key: string,
    value: any,
    skipIfKeyNotInObject?: boolean,
    setOnlyIfUndefined?: boolean,
  ): this;
  protected buildAssignAttributes(
    attributes?: Record<string, any> | Readonly<Record<string, any>>,
  ): Record<string, any> | undefined;
  protected buildIncludeKeys(includeKeys?: string[] | ReadonlyArray<string>): string[] | undefined;
  protected buildOptions(options?: any): IOptions;
}
