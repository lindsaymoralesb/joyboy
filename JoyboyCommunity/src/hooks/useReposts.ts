import {useInfiniteQuery} from '@tanstack/react-query';

import {useNostrContext} from '../context/NostrContext';
import {EventKind} from '../types';

export type UseRepostsOptions = {
  authors?: string[];
  search?: string;
};

export const useReposts = (options?: UseRepostsOptions) => {
  const {pool, othersRelays} = useNostrContext();

  return useInfiniteQuery({
    initialPageParam: Math.round(Date.now() / 1000),
    queryKey: ['reposts', options?.authors, options?.search],
    getNextPageParam: (lastPage: any, allPages, lastPageParam) => {
      if (!lastPage?.length) return undefined;

      const pageParam = lastPage[lastPage.length - 1].created_at;

      if (!pageParam || pageParam === lastPageParam) return undefined;
      return pageParam;
    },
    queryFn: async ({pageParam}) => {
      const reposts = await pool.querySync(othersRelays, {
        kinds: [EventKind.Repost],
        authors: options?.authors,
        search: options?.search,
        until: pageParam,
        limit: 20,
      });

      return reposts;
    },
    placeholderData: {pages: [], pageParams: []},
  });
};