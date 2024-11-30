export type CamelizeString<ObjectProperty extends string> =
  ObjectProperty extends `${infer F}_${infer R}`
    ? `${F}${Capitalize<CamelizeString<R>>}`
    : ObjectProperty;

export type Camelize<GenericObject> = {
  [ObjectProperty in keyof GenericObject as CamelizeString<
    ObjectProperty & string
  >]: GenericObject[ObjectProperty] extends Array<infer ArrayItem>
    ? ArrayItem extends Record<string, unknown>
      ? Array<Camelize<ArrayItem>>
      : GenericObject[ObjectProperty]
    : GenericObject[ObjectProperty] extends Record<string, unknown>
      ? Camelize<GenericObject[ObjectProperty]>
      : GenericObject[ObjectProperty];
};
export type DeepNullable<T> = T extends (infer U)[]
  ? U extends string | number
    ? T | null
    : DeepNullable<U>[]
  : {
      [K in keyof T]: DeepNullable<T[K]> | null;
    };

export type DeepPartial<T> = T extends (infer U)[]
  ? U extends string | number
    ? T
    : DeepPartial<U>[]
  : T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type DeepNullish<T> = DeepNullable<DeepPartial<T>>;
