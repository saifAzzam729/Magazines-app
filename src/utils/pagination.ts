export type PaginationParams = { page?: number; pageSize?: number };

export function getPagination(query: any): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize ?? 10)));
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { skip, take, page, pageSize };
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export function buildPaginationResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  return {
    data: items,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  };
}

