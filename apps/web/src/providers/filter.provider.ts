import { useSearchParams } from "react-router-dom";

export const useFilterSearchParameters = () => {
  const [searchParameters, setSearchParams] = useSearchParams();

  return {
    toString: searchParameters.toString.bind(searchParameters),
    values: Object.fromEntries(searchParameters.entries()),
    get: searchParameters.get.bind(searchParameters),
    getAll: <T>(key: string) => searchParameters.getAll(key) as T,
    reset: () => {
      setSearchParams(
        (parameters) => {
          Object.keys(Object.fromEntries(searchParameters.entries())).forEach(
            (key) => parameters.delete(key),
          );

          return parameters;
        },
        { replace: true },
      );
    },
    set: (key: string, value: string[] | string | null) => {
      setSearchParams(
        (parameters) => {
          parameters.delete(key);

          if (Array.isArray(value)) {
            for (const v of value) {
              parameters.append(key, v);
            }

            return parameters;
          }

          if (value) {
            parameters.set(key, value);
          }

          return parameters;
        },
        { replace: true },
      );
    },
    hasAny: searchParameters.entries().toArray().length > 0,
  };
};
