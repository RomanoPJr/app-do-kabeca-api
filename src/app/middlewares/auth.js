import decode from '../../utils/token';

export default async (req, res, next) => {
  const user = await decode(req.headers, res);

  if (user) {
    req.body.user_request = user.toJSON();
    return next();
  }
};
