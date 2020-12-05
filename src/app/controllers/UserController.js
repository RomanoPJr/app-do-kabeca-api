import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const { field, value } = req.query;

    const findAllData = await User.findAll({
      where: {
        [field]: { [Op.like]: `%${value.toUpperCase()}%` },
      },
      limit: 10,
      attributes: ['id', 'name', 'phone', 'type'],
    });

    return res.json(findAllData);
  }

  async findOne(req, res) {
    const { field, value } = req.query;

    const findAllData = await User.findOne({
      where: { [field]: value },
      attributes: ['id', 'name', 'birth_date', 'email', 'phone', 'status', 'type'],
    });

    return res.json(findAllData);
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      status: Yup.string()
        .required('Campo Email é obrigatório')
        .oneOf(['ATIVO', 'INATIVO', 'TESTE']),
      type: Yup.string()
        .required()
        .oneOf(['ADMIN', 'ORGANIZER', 'PLAYER']),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').when('type', (type, field) => {
        return type === 'PLAYER' ? field.required('Campo Data de Nascimento é obrigatório') : field;
      }),
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

    if ((body.type === 'ORGANIZER' || body.type === 'ADMIN') && body.user_request.type !== 'ADMIN') {
      return res.status(401).json({
        error: `Somente administradores podem executar esta ação`,
      });
    }

    if (body.type === 'PLAYER' && body.user_request.type !== 'ORGANIZER') {
      return res.status(401).json({
        error: `Somente organizadores podem executar esta ação`,
      });
    }

    const userExists = await User.findOne({
      where: Sequelize.or({ phone: body.phone }, { email: body.email }),
    });

    if (userExists) {
      return res.status(400).json({
        error: `Número de telefone ou email já existem`,
      });
    }

    const { id, name, email, phone, type, status } = await User.create(body);

    return res.json({
      status: 'success',
      data: { id, name, email, phone, type, status },
    });
  }

  async storeSenha(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
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
      where: { phone: body.phone },
    });

    if (!userExists) {
      return res.status(400).json({ error: 'Não foi possível criar uma senha' });
    }

    if (userExists && userExists.getDataValue('password_hash')) {
      return res.status(400).json({ error: 'Não foi possível criar uma senha' });
    }

    if (userExists && userExists.getDataValue('type') !== 'PLAYER') {
      return res.status(400).json({ error: 'Não foi possível criar uma senha' });
    }

    try {
      const senha = await bcrypt.hash(body.password, 8);

      await userExists.update({
        password_hash: senha,
      });
      return res.json({ data: null, success: true, error: null });
    } catch (e) {
      return res.json({ data: null, success: false, error: 'Erro desconhecido' });
    }
  }

  async update(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string()
        .required('Campo Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string()
        .required('Campo Email é obrigatório')
        .email('Campo Email é inválido'),
      type: Yup.string()
        .required()
        .oneOf(['ADMIN', 'ORGANIZER', 'PLAYER']),
      birth_date: Yup.date('Campo Data de Nascimento é inválido').when('type', (type, field) => {
        return type === 'PLAYER' ? field.required('Campo Data de Nascimento é obrigatório') : field;
      }),
      password: Yup.string().when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required('Campo Senha é obrigatório').min(6, 'Senha deve possuir no mínimo 6 letras ou numeros') : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required('Campo Confirmar Senha é obrigatório').oneOf([Yup.ref('password')], 'As senhas não coincidem') : field
      ),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const user = await User.findByPk(body.id);

    if ((user.type === 'ORGANIZER' || user.type === 'ADMIN') && body.user_request.type !== 'ADMIN') {
      return res.status(401).json({
        error: `Somente administradores podem executar esta ação`,
      });
    }

    if (user.type === 'PLAYER' && body.user_request.type !== 'ORGANIZER' && body.user_request.type !== 'PLAYER') {
      return res.status(401).json({
        error: `Somente pessoas autorizadas podem executar esta ação`,
      });
    }

    if (body.email && body.email !== user.email) {
      const userExists = await User.findOne({
        where: { email: body.email },
      });

      if (userExists) {
        return res.status(400).json({ error: `Email já existe.` });
      }
    }

    if (body.phone && body.phone !== user.phone) {
      const userExists = await User.findOne({
        where: { phone: body.phone },
      });

      if (userExists) {
        return res.status(400).json({ error: `Telefone já existe.` });
      }
    }

    if (body.oldPassword && !(await user.checkPassword(body.oldPassword))) {
      return res.status(401).json({
        error: `A senha atual está incorreta.`,
      });
    }

    const { id, name, email, phone, type, status } = await user.update(body);

    return res.json({ id, name, email, phone, type, status });
  }

  async delete(req, res) {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (user) {
      await user.update({
        status: 'INATIVO',
      });
    }

    return res.status(200).json({});
  }
}

export default new UserController();
