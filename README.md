# Class Fillable DTO

Class Fillable DTO with validation functionality. 🟩 NodeJS only.

## Example

### Minimal implementation

```typescript
class MyCoolDto extends FillableDto {
  public shouldDisplayMessage: boolean;
}
```

### Strips unnecessary properties

```typescript
const INCLUDE_KEYS: ReadonlyArray<keyof IMyCoolDto> = [
  'shouldDisplayMessage',
] as const;

class MyCoolDto extends FillableDto implements IMyCoolDto {
  public readonly shouldDisplayMessage: boolean;

  public constructor(attributes: Partial<IMyCoolDto>) {
    super(attributes, INCLUDE_KEYS);
  }
}

const myCoolDto = new MyCoolDto({
  shouldDisplayMessage: false,
  thisPropertyWillBeStripped: true,
});
```

### Default values

```typescript
const DEFAULT_VALUES: Readonly<IMyCoolDto> = {
  shouldDisplayMessage: false,
} as const;

class MyCoolDto extends FillableDto implements IMyCoolDto {
  public readonly shouldDisplayMessage: boolean;

  public constructor(attributes: Partial<IMyCoolDto>) {
    super(attributes, undefined, DEFAULT_VALUES);
  }
}
```

<span style="color:red;font-weight:bolder">DO NOT SET DEFAULT VALUES IN CLASS PROPERTIES!!!</span>

**Attributes** argument passed to the constructor will be overwritten with a class property default value.

```typescript
const DEFAULT_VALUES: Readonly<IMyCoolDto> = {
  shouldDisplayMessage: false,
} as const;

class MyCoolDto extends FillableDto implements IMyCoolDto {
  public readonly isActive: boolean = false; // 🛑✋⚠️ No!!!
  public readonly shouldDisplayMessage: boolean;

  public constructor(attributes: Partial<IMyCoolDto>) {
    super(attributes, undefined, DEFAULT_VALUES);
  }
}

const myCoolDto = new MyCoolDto({
  isActive: true,
  shouldDisplayMessage: false,
});

// `false` as in class property default declaration
console.log(myCoolDto.isActive); // false
```

### Fillable DTO Enterprise Edition

```typescript
interface IMyCoolDto {
  shouldDisplayMessage: boolean;
}

const INCLUDE_KEYS: ReadonlyArray<keyof IMyCoolDto> = [
  'shouldDisplayMessage',
] as const;

const DEFAULT_VALUES: Readonly<IMyCoolDto> = {
  shouldDisplayMessage: false,
} as const;

class MyCoolDto extends FillableDto implements IMyCoolDto {
  public readonly shouldDisplayMessage: boolean;

  public constructor(attributes: Partial<IMyCoolDto>) {
    super(attributes, INCLUDE_KEYS, DEFAULT_VALUES);
  }
}
```

## Methods

#### Declaration

```typescript
import { IsBoolean } from 'class-validator';

class MyCoolDto extends FillableDto implements IMyCoolDto {
  @IsBoolean()
  public readonly shouldDisplayMessage: boolean;

  public constructor(attributes: Partial<IMyCoolDto>) {
    super(attributes, INCLUDE_KEYS, DEFAULT_VALUES);
  }
}
```

#### Initialization

```typescript
const attributes = { shouldDisplayMessage: true };
const includeKeys = ["isActive", "shouldDisplayMessage"];
const defaults = { isActive: true };

const myCoolDto = new MyCoolDto(attributes, includeKeys, defaults);

// re-assing everithing
myCoolDto.assign(attributes, includeKeys, defaults);
```

#### Factory Methods

```typescript
const myCoolDtoFromJSON = MyCoolDto
  .fromJSON(`{"shouldDisplayMessage":true}`);

const myCoolDtoFromObject = MyCoolDto
  .fromPlain({ shouldDisplayMessage: true });
```

#### Validation

```typescript
const isValid = myCoolDto.isValid(true); // silent
myCoolDto.isValid(false); // throws error
const error: null | string = myCoolDto.getError();
const errors: string[] = myCoolDto.getErrors();
```

#### Serialization

```typescript
myCoolDto.toJSON(); // creates plain object clone
myCoolDto.toObject(); // creates plain object clone
myCoolDto.toString(); // object packed in JSON string
```

#### Immutability

```typescript
myCoolDto.lock(); // prevents further modifications
```

## See also

[💾 My other projects](https://r37r0m0d3l.icu/open_source_map)

<img alt="Open Source" src="https://raw.githubusercontent.com/r37r0m0d3l/r37r0m0d3l/master/osmap.svg?sanitize=true" width="960" height="520" style="display:block;height:auto;margin-left:auto;margin-right:auto;min-height:520px;min-width:960px;width:100%;">


<!-- Badges -->

[npm-version-url]: https://npmjs.com/package/@nestjsi/class-validator
[npm-version-img]: https://badgen.net/npm/v/@nestjsi/class-validator?&icon=npm&label=npm&color=DD3636
[npm-downloads-url]: https://npmjs.com/package/@nestjsi/class-validator
[npm-downloads-img]: https://badgen.net/npm/dt/@nestjsi/class-validator?&icon=terminal&label=downloads&color=009688
[ts-url]: https://github.com/nestjsi/class-validator/blob/main/dist/index.d.ts
[ts-img]: https://badgen.net/npm/types/@nestjsi/class-validator?&icon=typescript&label=types&color=1E90FF
