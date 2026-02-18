export function buildSortCondition(
    sortBy: string | undefined,
    order: 'asc' | 'desc' | undefined,
    allowedFields: string[],
    defaultField: string = 'createdAt'
) {
    const field = allowedFields.includes(sortBy || '') ? sortBy : defaultField;

    return { [field!]: order || 'desc' };
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


export async function executePaginatedQuery(
    model: any,
    where: any,
    query: { page: number; limit: number; sortBy?: string; order?: 'asc' | 'desc' },
    allowedSortFields: string[],
    defaultSortField: string = 'createdAt'
) {
    const { page, limit, sortBy, order } = query;
    const skip = (page - 1) * limit;

    const sortCondition = buildSortCondition(sortBy, order, allowedSortFields, defaultSortField);

    const [data, total] = await Promise.all([
        model.findMany({ where, orderBy: sortCondition, skip, take: limit }),
        model.count({ where })
    ]);

    return {
        data,
        meta: { totalItems: total, page, limit, totalPages: Math.ceil(total / limit) }
    };
}
