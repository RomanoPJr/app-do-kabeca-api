import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import Sequelize from 'sequelize';
import User from '../models/User';
import decode from '../../utils/token';
import authConfig from '../../config/auth';
import ClubPlayer from '../models/ClubPlayer';
import Club from '../models/Club';

class SessionController {
  async index(req, res) {
    const decodedToken = await decode(req.headers, res);

    if (!decodedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const user = await User.findByPk(decodedToken.id, {
      attributes: ['id', 'name', 'type', 'status'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const userDataResponse = {
      name: user.name,
      type: user.type,
    };

    if (user.type === 'PLAYER') {
      const clubs = await ClubPlayer.findAll({
        where: { user_id: user.id },
        attributes: ['club_id', 'user_id', 'position', 'createdAt'],
        include: [
          {
            model: Club,
          },
        ],
      });

      userDataResponse.clubs = clubs;
    }

    return res.json(userDataResponse);
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      password: Yup.string().required('O campo Senha é obrigatório'),
      email: Yup.string().required('O campo Email é obrigatório'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const user = await User.findOne({
      where: Sequelize.or({ email: body.email }, { phone: body.email }),
      attributes: ['id', 'name', 'status', 'password_hash', 'type', 'createdAt'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (!(await user.checkPassword(body.password))) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    if (user.status === 'INATIVO') {
      return res.status(401).json({ error: 'Usuário desativado, contacte o administrador' });
    }

    const userDataResponse = {
      name: user.name,
      type: user.type,
    };

    if (user.type === 'ORGANIZER' && user.status === 'TESTE') {
      const date1 = new Date(user.createdAt);
      const date2 = new Date(Date.now());
      const diffDays = parseInt((date2 - date1) / (1000 * 60 * 60 * 24), 10);

      if (diffDays > 30) {
        return res.status(401).json({
          error: 'O seu período de 30 dias de avaliação chegou ao fim.',
        });
      }
    }

    const clubs = await ClubPlayer.findAll({
      where: { user_id: user.id },
      attributes: ['club_id', 'user_id', 'position', 'createdAt'],
      include: [
        {
          model: Club,
        },
      ],
    });

    userDataResponse.clubs = clubs;

    return res.json({
      user: userDataResponse,
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresin,
      }),
    });
  }

  async storeAdmin(req, res) {
    const { user_request, ...body } = req.body;

    if (!user_request || user_request.type !== 'ADMIN') {
      return res.status(401).json({ error: 'Você não possui acesso a esta funcionalidade' });
    }

    const schema = Yup.object().shape({
      user_id: Yup.string().required('Nenhum Organizador foi informado'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const user = await User.findOne({
      where: { id: body.user_id },
      attributes: ['id', 'name', 'status', 'password_hash', 'type', 'createdAt'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
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
