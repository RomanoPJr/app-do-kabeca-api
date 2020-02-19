import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import Admin from '../models/Admin';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin not found' });
    }

    if (!(await admin.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, firstname, lastname } = admin;

    return res.json({
      admin: {
        id,
        firstname,
        lastname,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresin,
      }),
    });
  }
}

export default new SessionController();
