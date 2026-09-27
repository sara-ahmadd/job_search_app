export const isAuthorized = (roles = [""]) => {
  return async (req, res, next) => {
    const { user } = req;
    if (!roles.length)
      return next(new Error("accepted roles should be provided"));
    if (!user) return next(new Error("user is not found in req object!"));
    if (!roles.includes(user.role))
      return next(new Error("user is not authorized to do this!"));

    return next();
  };
};
