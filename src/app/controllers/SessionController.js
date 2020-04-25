import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import decode from '../../utils/token';
import authConfig from '../../config/auth';

class SessionController {
  async index(req, res) {
    const decodedToken = await decode(req.headers, res);

    if (!decodedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const user = await User.findByPk(decodedToken.id, {
      attributes: ['name', 'type', 'status'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    return res.json(user);
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      password: Yup.string().required('O campo Senha é obrigatório'),
      email: Yup.string()
        .email('O campo Email é inválido')
        .required('O campo Email é obrigatório'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const user = await User.findOne({
      where: { email: body.email },
      attributes: ['id', 'name', 'password_hash', 'type', 'createdAt'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!(await user.checkPassword(body.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (user.type === 'ORGANIZER') {
      const date1 = new Date(user.createdAt);
      const date2 = new Date(Date.now());
      const diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);

      if (diffDays > 30) {
        return res.status(401).json({
          error: 'O seu período de validação chegou ao fim.',
        });
      }
    }

    return res.json({
      user: {
        name: user.name,
        type: user.type,
      },
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresin,
      }),
    });
  }
}

export default new SessionController();
