import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../config/auth';

export default async (headers, res) => {
  try {
    const authHeader = headers.authorization;
    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new Error();
    }
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    return decoded;
  } catch (error) {
    return res.status(401).json({
      statue: 'error',
      error: 'Token inválido',
    });
  }
};
