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
