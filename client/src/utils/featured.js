export const selectFeatured = (items, ids) =>
  ids?.length
    ? items.filter((x) => ids.includes(x._id))
    : items.filter((x) => x.featured).length
      ? items.filter((x) => x.featured)
      : items;
