import mongoose from "mongoose";

export default async function paginate(
  pageNumber = 1,
  sortedField = "createdAt",
  sortedCount = -1,
) {
  const limit = 4;
  const skip = (pageNumber - 1) * limit;
  // pass any filter/query conditions to getQuery()
  const countQuery = this.model.countDocuments(this.getQuery());

  const [data, totalItems] = await Promise.all([
    this.skip(skip)
      .limit(limit)
      .sort({ [sortedField]: sortedCount }), // Get paginated jobs
    countQuery, // Get total count separately
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const itemsPerPage = data.length;
  return {
    data,
    totalItems,
    totalPages,
    itemsPerPage,
  };
}
mongoose.Query.prototype.paginate = paginate;
