import { QueryClient, QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type QueryHookOptions<TData, TQueryKey extends QueryKey, TError = unknown> = Omit<
  UseQueryOptions<TData, TError, TData, TQueryKey>,
  'queryKey' | 'queryFn'
>;

export type MutationHookOptions<
  TData,
  TVariables = TData,
  TError = unknown,
  TContext = unknown,
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> & {
  disableGlobalErrorHandler?: boolean;
};

type CacheKeyValue = string | number | undefined;

export type TypeWithOnlyKeysOfType<T, TType> = {
  [k in keyof T as T[k] extends TType ? k : never]: T[k];
};
export type KeysOfType<T, TType> = keyof TypeWithOnlyKeysOfType<T, TType>;

export const replaceInQUeryCache = <T>(client: QueryClient, key: QueryKey, data: T) => {
  client.setQueryData<T>(key, (existing) => {
    if (!existing) return undefined;
    return data;
  });
};

export const deleteInQueryCache = (client: QueryClient, key: QueryKey) => {
  client.removeQueries({ queryKey: key });
};

export const doInsertInQueryCacheList = <T extends TypeWithOnlyKeysOfType<T, CacheKeyValue>>(
  client: QueryClient,
  key: QueryKey,
  data: T,
) => {
  client.setQueryData<T[]>(key, (existsing) => {
    if (!existsing) return existsing;
    return [...existsing, data];
  });
};

export const doDeleteInQueryCacheList = <T extends TypeWithOnlyKeysOfType<T, CacheKeyValue>>(
  client: QueryClient,
  key: QueryKey,
  prop: KeysOfType<T, CacheKeyValue>,
  value: CacheKeyValue,
) => {
  client.setQueryData<T[]>(key, (existing) => {
    if (!existing) return existing;
    return existing.filter((del) => del[prop] !== value);
  });
};

export const doUpsertInQueryCacheList = <T extends TypeWithOnlyKeysOfType<T, CacheKeyValue>>(
  client: QueryClient,
  key: QueryKey,
  data: T,
  prop: KeysOfType<T, CacheKeyValue>,
) => {
  client.setQueryData<T[]>(key, (existsing) => {
    if (!existsing) return existsing;

    const existingIndex = existsing.findIndex((existingItem) => existingItem[prop] === data[prop]);
    if (existingIndex === -1) {
      return [data, ...existsing];
    }

    return existsing
      .slice(0, existingIndex)
      .concat(data)
      .concat(existsing.slice(existingIndex + 1));
  });
};
