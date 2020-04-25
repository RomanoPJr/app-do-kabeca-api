import Club from '../models/Club';

export default async (req, res, next) => {
  const {
    body: { user_request },
  } = req;

  if (user_request.type !== 'ORGANIZER') {
    return res.status(401).json({
      error: 'Somente organizadores podem executar esta ação',
    });
  }

  const date1 = new Date(user_request.createdAt);
  const date2 = new Date(Date.now());
  const diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);

  if (diffDays > 30) {
    return res.status(401).json({
      error: 'O seu período de validação chegou ao fim.',
    });
  }

  const {
    route: { path, methods },
  } = req;

  if (path === '/club' && methods.post) {
    return next();
  }

  const dataFindOneClub = await Club.findOne({
    where: { user_id: user_request.id },
    attributes: ['id'],
  });

  if (!dataFindOneClub) {
    return res.status(404).json({
      error: 'Você ainda não configurou o seu clube',
    });
  }

  user_request.club_id = dataFindOneClub.id;

  return next();
};
