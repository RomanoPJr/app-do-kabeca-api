import * as Yup from 'yup';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import decode from '../../utils/token';
import authConfig from '../../config/auth';

class SessionController {
  async index(req, res) {
    const user = await decode(req.headers, res);

    if (user) {
      const { name } = user;
      return res.json({ name });
    }

    return res.status(401).json({ message: 'Usuário não encontrado' });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      email: Yup.string()
        .email('O campo Email é inválido')
        .required('O campo Email é obrigatório'),
      password: Yup.string().required('O campo Senha é obrigatório'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ status: 'error', message: `${validate.error}` });
    }

    const user = await User.findOne({
      where: { email: body.email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Usuário ou senha inválidos' });
    }

    if (!(await user.checkPassword(body.password))) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Usuário ou senha inválidos' });
    }

    return res.json({
      admin: {
        name: user.name,
      },
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresin,
      }),
    });
  }
}

export default new SessionController();
