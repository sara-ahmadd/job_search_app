import mongoose from "mongoose";

mongoose.Query.prototype.paginate = async function (
  pageNumber = 1,
  sortedField = "createdAt",
  sortedCount = -1
) {
  const limit = 4;
  const skip = (pageNumber - 1) * limit;

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
};
