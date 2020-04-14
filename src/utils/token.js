import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Sequelize from 'sequelize';

import User from '../app/models/User';
import authConfig from '../config/auth';

export default async (headers, res) => {
  try {
    const authHeader = headers.authorization;
    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new Error();
    }
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    const user = await User.findOne({
      where: Sequelize.or({ id: decoded.id }),
    });

    if (!user.toJSON()) {
      throw new Error();
    }

    if (user.type === 'ORGANIZER') {
      const date1 = new Date(user.createdAt);
      const date2 = new Date(Date.now());
      const diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);

      if (diffDays > 30) {
        return res.status(401).json({
          status: 'error',
          message: 'O seu período de validação chegou ao fim.',
        });
      }
    }

    return user;
  } catch (error) {
    res.status(401).json({
      statue: 'error',
      message: 'Somente usuários válidos podem executar essa ação',
    });
    return null;
  }
};
