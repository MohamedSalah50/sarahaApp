export const findOne = async ({
  model,
  filter = {},
  populate = [],
  select = "",
}) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const findById = async ({ model, id, select = "" }) => {
  return await model.findById(id).select(select);
};
export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = { runValidators: true },
}) => {
  return await model.updateOne(filter, data, options);
};

export const create = async ({ model, data = {} }) => {
  return await model.create(data);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  populate = [],
  select = "",
  options = { runValidators: true, new: true },
}) => {
  return await model
    .findOneAndUpdate(filter, data, options)
    .select(select)
    .populate(populate);
};

export const deleteOne = async ({ model, filter = {} }) => {
  return await model.deleteOne(filter);
};


export const deleteMany = async ({ model, filter = {} }) => {
  return await model.deleteMany(filter);
};