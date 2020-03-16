import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Sequelize from 'sequelize';

import Admin from '../models/Admin';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    const adminExists = await Admin.findOne({
      where: Sequelize.or({ id: decoded.id }),
    });

    if (!adminExists) {
      return res
        .status(400)
        .json({ error: 'Somente admistradores podem executar essa ação' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
