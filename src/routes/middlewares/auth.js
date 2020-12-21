import Sequelize from 'sequelize';

import decode from '../../utils/token';
import User from '../../app/models/User';
import ClubPlayer from '../../app/models/ClubPlayer';

export default async (req, res, next) => {
  const decodedToken = await decode(req.headers, res);

  const include = [];

  if (req.headers.club_id) {
    include.push({
      required: false,
      model: ClubPlayer,
      where: { club_id: req.headers.club_id },
    });
  }

  const dataFindOneUser = await User.findOne({
    raw: true,
    nest: true,
    where: Sequelize.or({ id: decodedToken.id }),
    include,
  });

  if (!dataFindOneUser) {
    return res.status(401).json({
      error: 'Você não possui permissão para executar essa ação',
    });
  }

  req.body.user_request = dataFindOneUser;
  return next();
};
