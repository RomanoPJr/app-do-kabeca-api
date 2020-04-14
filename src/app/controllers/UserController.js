import * as Yup from 'yup';
import Sequelize from 'sequelize';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const { pageNumber = 1, pageSize = 10, type } = req.query;

    if (!type || type === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Favor, informar um tipo de usuário.',
      });
    }

    const countData = await User.count();

    const findAllData = await User.findAll({
      where: { type },
      limit: pageSize,
      order: [['id', 'asc']],
      offset: (pageNumber - 1) * pageSize,
      attributes: ['id', 'name', 'email', 'phone', 'status', 'type'],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(countData / pageSize),
      data: findAllData,
    });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Campo Telefone é inválido'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      status: Yup.string()
        .required('Campo Email é obrigatório')
        .oneOf(['ACTIVE', 'INACTIVE', 'TESTER']),
      type: Yup.string()
        .required()
        .oneOf(['ADMIN', 'ORGANIZER', 'PLAYER']),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').when(
        'type',
        (type, field) => {
          return type === 'PLAYER'
            ? field.required('Campo Data de Nascimento é obrigatório')
            : field;
        }
      ),
      password: Yup.string()
        .required('Campo Senha é obrigatório')
        .min(6, 'Senha deve possuir no mínimo 6 letras ou numeros'),
      confirmPassword: Yup.string()
        .required('Campo Confirmar Senha é obrigatório')
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

    if (
      (body.type === 'ORGANIZER' || body.type === 'ADMIN') &&
      body.user_request.type !== 'ADMIN'
    ) {
      return res.status(401).json({
        status: 'error',
        message: `Somente administradores podem executar esta ação`,
      });
    }

    if (body.type === 'PLAYER' && body.user_request.type !== 'ORGANIZER') {
      return res.status(401).json({
        status: 'error',
        message: `Somente organizadores podem executar esta ação`,
      });
    }

    const userExists = await User.findOne({
      where: Sequelize.or({ phone: body.phone }, { email: body.email }),
    });

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: `Número de telefone ou email já existem`,
      });
    }

    const { id, name, email, phone, type, status } = await User.create(body);

    return res.json({
      status: 'success',
      data: { id, name, email, phone, type, status },
    });
  }

  async update(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Campo Telefone é inválido'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      type: Yup.string()
        .required()
        .oneOf(['ADMIN', 'ORGANIZER', 'PLAYER']),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').when(
        'type',
        (type, field) => {
          return type === 'PLAYER'
            ? field.required('Campo Data de Nascimento é obrigatório')
            : field;
        }
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

    const user = await User.findByPk(body.id);

    if (
      (user.type === 'ORGANIZER' || user.type === 'ADMIN') &&
      body.user_request.type !== 'ADMIN'
    ) {
      return res.status(401).json({
        status: 'error',
        message: `Somente administradores podem executar esta ação`,
      });
    }

    if (
      user.type === 'PLAYER' &&
      body.user_request.type !== 'ORGANIZER' &&
      body.user_request.type !== 'PLAYER'
    ) {
      return res.status(401).json({
        status: 'error',
        message: `Somente pessoas autorizadas podem executar esta ação`,
      });
    }

    if (body.email && body.email !== user.email) {
      const userExists = await User.findOne({
        where: { email: body.email },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ status: 'error', message: `Email já existe.` });
      }
    }

    if (body.phone && body.phone !== user.phone) {
      const userExists = await User.findOne({
        where: { phone: body.phone },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ status: 'error', message: `Telefone já existe.` });
      }
    }

    if (body.oldPassword && !(await user.checkPassword(body.oldPassword))) {
      return res.status(401).json({
        status: 'error',
        message: `A senha atual está incorreta.`,
      });
    }

    const { id, name, email, phone, type, status } = await user.update(body);

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

export default new UserController();
