export function buildSortCondition(
    sortBy: string,
    order: 'asc' | 'desc',
    allowedFields: Set<string> | string[],
    defaultField: string = 'createdAt'
) {
    const direction = order === 'asc' ? 'asc' : 'desc';

    const isAllowed =
        allowedFields instanceof Set
            ? allowedFields.has(sortBy)
            : allowedFields.includes(sortBy);

    const field = isAllowed ? sortBy : defaultField;

    return { [field]: direction };

}

export function buildSearchCondition(search: string | undefined, fields: string[]) {
    if (!search) return {};

    return {
        OR: fields.map((field) => ({
            [field]: { contains: search, mode: 'insensitive' }
        }))
    };
}

export function buildDateRangeCondition(fromDate: string | undefined, toDate: string | undefined, field: string) {
    if (!fromDate && !toDate) return {};

    return {
        [field]: {
            ...(fromDate && { gte: new Date(fromDate) }),
            ...(toDate && { lte: new Date(toDate) })
        }
    };
}

export async function executePaginatedQuery({
    model,
    prismaQuery,
    page,
    limit
}: {
    model: any;
    prismaQuery: any;
    page: number;
    limit: number;
}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model.findMany({
            ...prismaQuery,
            skip,
            take: limit
        }),
        model.count({
            where: prismaQuery.where
        })
    ]);

    return {
        data,
        meta: {
            totalItems: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}
