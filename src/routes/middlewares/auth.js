import Sequelize from 'sequelize';

import decode from '../../utils/token';
import User from '../../app/models/User';

export default async (req, res, next) => {
  const decodedToken = await decode(req.headers, res);

  const dataFindOneUser = await User.findOne({
    where: Sequelize.or({ id: decodedToken.id }),
  });

  if (!dataFindOneUser) {
    return res.status(401).json({
      error: 'Você não possui permissão para executar essa ação',
    });
  }

  const userData = dataFindOneUser.toJSON();
  req.body.user_request = userData;
  return next();
};
