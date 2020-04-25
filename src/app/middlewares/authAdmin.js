export default async (req, res, next) => {
  const {
    body: { user_request },
  } = req;

  if (user_request.type !== 'ADMIN') {
    return res.status(401).json({
      error: 'Somente administradores podem executar esta ação',
    });
  }

  return next();
};
