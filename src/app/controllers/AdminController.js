import * as Yup from 'yup';
import Sequelize from 'sequelize';
import User from '../models/User';

class AdminController {
  async index(req, res) {
    const { pageNumber = 1, pageSize = 10 } = req.query;

    const countData = await User.count();

    const findAllData = await User.findAll({
      limit: pageSize,
      where: { type: 'ADMIN' },
      order: [['name', 'asc']],
      offset: (pageNumber - 1) * pageSize,
      attributes: ['id', 'name', 'email', 'phone', 'birth_date', 'status'],
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
      name: Yup.string()
        .required('Campo Nome é obrigatório')
        .min(3, 'Nome precisa possuir o tamanho mínimo de 3 caracteres'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').required(
        'Campo Data de Nascimento é obrigatório'
      ),
      password: Yup.string()
        .required('Campo Senha é obrigatório')
        .min(6, 'Senha deve possuir no mínimo 6 letras ou numeros'),
      confirmPassword: Yup.string()
        .required('Campo Confirmar Senha é obrigatório')
        .oneOf([Yup.ref('password')], 'As senhas não coincidem'),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const userExists = await User.findOne({
      where: Sequelize.or({ phone: body.phone }, { email: body.email }),
    });

    if (userExists) {
      return res.status(400).json({
        error: `Número de telefone ou email já existem`,
      });
    }

    body.status = 'ATIVO';
    body.type = 'ADMIN';

    const { id, name, email, phone, type, status } = await User.create(body);

    return res.json({
      status: 'success',
      data: { id, name, email, phone, type, status },
    });
  }

  async update(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string()
        .required('Campo Nome é obrigatório')
        .min(3, 'Nome precisa possuir o tamanho mínimo de 3 caracteres'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').required(
        'Campo Data de Nascimento é obrigatório'
      ),
      status: Yup.string()
        .required('Tipo é obrigatório')
        .oneOf(['ATIVO', 'INATIVO'], 'Tipo é inválido'),
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
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const user = await User.findByPk(body.id);

    if (body.email && body.email !== user.email) {
      const userExists = await User.findOne({
        where: { email: body.email },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Já existe um usuário com este email ou telefone' });
      }
    }

    if (body.phone && body.phone !== user.phone) {
      const userExists = await User.findOne({
        where: { phone: body.phone },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Já existe um usuário com este email ou telefone' });
      }
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

export default new AdminController();
