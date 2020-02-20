import * as Yup from 'yup';
import Sequelize from 'sequelize';
import Admin from '../models/Admin';

class AdminController {
  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      firstname: Yup.string().required(),
      lastname: Yup.string().required(),
      phone: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const adminExists = await Admin.findOne({
      where: Sequelize.or({ phone: body.phone }, { email: body.email }),
    });

    if (adminExists) {
      res.status(400).json({ error: 'Admin already exists' });
    }

    const { id, firstname, lastname, email } = await Admin.create(body);

    return res.json({ id, firstname, lastname, email });
  }

  async update(req, res) {
    const { body, adminId } = req;

    const schema = Yup.object().shape({
      firstname: Yup.string(),
      lastname: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, oldPassword, phone } = body;

    const admin = await Admin.findByPk(adminId);

    if (email && email !== admin.email) {
      const adminExists = await Admin.findOne({
        where: { email },
      });

      if (adminExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (phone && phone !== admin.phone) {
      const adminExists = await Admin.findOne({
        where: { phone },
      });

      if (adminExists) {
        return res.status(400).json({ error: 'Phone already exists' });
      }
    }

    if (oldPassword && !(await admin.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match ' });
    }

    const { id, firstname, lastname } = await admin.update(body);
    return res.json({ id, firstname, lastname });
  }
}

export default new AdminController();
