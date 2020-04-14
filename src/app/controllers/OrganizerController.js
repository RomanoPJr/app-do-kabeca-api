import * as Yup from 'yup';
import Sequelize from 'sequelize';
import User from '../models/User';

class OrganizerController {
  async index(req, res) {
    const { id, name, status, type } = await User.findByPk(
      req.body.user_request.id
    );

    return res.json({
      id,
      name,
      status,
      type,
    });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      phone: Yup.string()
        .required('Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Email é obrigatório')
        .email('Email é inválido'),
      birth_date: Yup.date('Data de Nascimento é inválido').required(
        'Data de Nascimento é obrigatória'
      ),
      password: Yup.string()
        .required('Senha é obrigatório')
        .min(6, 'Senha deve possuir no mínimo 6 letras ou numeros'),
      confirmPassword: Yup.string()
        .required('Confirmar Senha é obrigatório')
        .oneOf([Yup.ref('password')], 'As senhas não coincidem'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ status: 'error', message: `${validate.error}` });
    }

    body.type = 'ORGANIZER';
    body.status = 'TESTER';

    const userExists = await User.findOne({
      where: Sequelize.or({ phone: body.phone }, { email: body.email }),
    });

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: `Número de telefone ou email já existem`,
      });
    }

    const {
      id,
      name,
      email,
      phone,
      type,
      status,
      created_at,
    } = await User.create(body);

    return res.json({
      id,
      name,
      email,
      phone,
      type,
      status,
      created_at,
    });
  }

  async update(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      phone: Yup.string()
        .required('Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Email é obrigatório')
        .email('Email é inválido'),
      birth_date: Yup.date('Data de Nascimento é inválido').required(
        'Data de Nascimento é obrigatória'
      ),
      password: Yup.string().when('oldPassword', (oldPassword, field) =>
        oldPassword
          ? field
              .required('Campo Senha é obrigatório')
              .min(6, 'Senha deve possuir no mínimo 6 letras ou numeros')
          : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Campo Confirmar Senha é obrigatório')
              .oneOf([Yup.ref('password')], 'As senhas não coincidem')
          : field
      ),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ status: 'error', message: `${validate.error}` });
    }

    const user = await User.findByPk(body.user_request.id);

    if (body.email && body.email !== user.email) {
      const userExists = await User.findOne({
        where: { email: body.email },
      });

      if (userExists) {
        return res.status(400).json({
          status: 'error',
          message: `Número de telefone ou email já existem.`,
        });
      }
    }

    if (body.phone && body.phone !== user.phone) {
      const userExists = await User.findOne({
        where: { phone: body.phone },
      });

      if (userExists) {
        return res.status(400).json({
          status: 'error',
          message: `Número de telefone ou email já existem`,
        });
      }
    }

    if (body.oldPassword && !(await user.checkPassword(body.oldPassword))) {
      return res.status(401).json({
        status: 'error',
        message: `A senha atual está incorreta.`,
      });
    }

    const updateBody = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      birth_date: body.birth_date,
    };

    if (body.password && body.password !== '') {
      updateBody.password = body.password;
    }

    const { id, name, email, phone, type, status } = await user.update(
      updateBody
    );

    return res.json({ id, name, email, phone, type, status });
  }

  async delete(req, res) {
    const { id } = req.params;
    await User.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new OrganizerController();
