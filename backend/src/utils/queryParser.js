/**
 * Parses the req.query object to extract pagination, sorting, filtering, and sparse fieldsets for Prisma.
 */
const parseQuery = (query) => {
  const { page, limit, per_page, sort, fields, ...filters } = query;

  // 1. Pagination
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit || per_page, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;
  const take = pageSize;

  // 2. Sorting (e.g., sort=price,-name)
  const orderBy = [];
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        orderBy.push({ [field.substring(1)]: 'desc' });
      } else {
        orderBy.push({ [field]: 'asc' });
      }
    });
  }

  // 3. Field Selection (Sparse Fieldsets) (e.g., fields=id,name,price)
  let select = undefined;
  if (fields) {
    select = {};
    fields.split(',').forEach(field => {
      select[field] = true;
    });
  }

  // 4. Filtering
  // Handles generic filtering: name=laptop, price[gte]=100, name[like]=tech
  const where = {};
  for (const [key, value] of Object.entries(filters)) {
    const flatMatch = key.match(/^(\w+)\[(\w+)\]$/);
    if (flatMatch) {
      const [, field, op] = flatMatch;
      if (!where[field]) {
        where[field] = {};
      }
      const mappedOp = op === 'like' ? 'contains' : op;
      if (mappedOp === 'contains') {
        where[field].contains = value;
      } else if (mappedOp === 'gte' || mappedOp === 'lte' || mappedOp === 'gt' || mappedOp === 'lt') {
        where[field][mappedOp] = isNaN(value) ? value : Number(value);
      } else {
        where[field][mappedOp] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // e.g. price: { gte: '100', lte: '500' }
      where[key] = {};
      for (const [op, opVal] of Object.entries(value)) {
        if (op === 'like') {
          where[key].contains = opVal;
        } else if (op === 'gte' || op === 'lte' || op === 'gt' || op === 'lt') {
          where[key][op] = isNaN(opVal) ? opVal : Number(opVal);
        } else {
          where[key][op] = opVal;
        }
      }
    } else {
      // Exact match. Try converting to number if it's numeric, or boolean
      if (value === 'true') where[key] = true;
      else if (value === 'false') where[key] = false;
      else if (!isNaN(value) && value !== '') where[key] = Number(value);
      else where[key] = value;
    }
  }

  return {
    skip,
    take,
    orderBy,
    select,
    where,
    pageNumber,
    pageSize
  };
};

module.exports = { parseQuery };
