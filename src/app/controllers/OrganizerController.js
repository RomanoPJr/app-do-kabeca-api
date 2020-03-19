import * as Yup from 'yup';
import Organizer from '../models/Organizer';
import getStatusTranslate from '../../utils/status';

class OrganizerController {
  async index(req, res) {
    const {
      pageNumber = 1,
      pageSize = 10,
      orderBy,
      orderDirection,
    } = req.query;

    const pageTotal = await Organizer.count();
    const organizers = await Organizer.findAll({
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'name', 'email', 'phone', 'status'],
      order: [
        [orderBy || 'status', orderDirection || 'asc'],
        [orderBy || 'name', orderDirection || 'asc'],
      ],
    });

    organizers.map(organizer => {
      organizer.status = getStatusTranslate(organizer.status);
    });

    res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(pageTotal / pageSize),
      data: organizers,
    });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string().required('Campo Telefone é obrigatório'),
      status: Yup.string().required('Campo Status é obrigatório'),
      email: Yup.string().email(),
      password: Yup.string()
        .required('Campo Senha é obrigatório')
        .min(6),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ status: 'error', message: `Erro: ${validate.error}` });
    }

    const organizerExists = await Organizer.findOne({
      where: { phone: body.phone },
    });

    if (organizerExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro: Número de Telefone já existe na base de dados',
      });
    }

    body.status = getStatusTranslate(body.status);

    await Organizer.create(body);

    return res.json({ status: 'success' });
  }

  async update(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Campo Nome é obrigatório'),
      phone: Yup.string().required('Campo Telefone é obrigatório'),
      status: Yup.string().required('Campo Status é obrigatório'),
      email: Yup.string().email(),
      password: Yup.string().when('oldPassword', (oldPassword, field) =>
        oldPassword && oldPassword !== ''
          ? field.required('Campo Senha é obrigatório').min(6)
          : field
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password && password !== ''
          ? field
              .required()
              .oneOf([Yup.ref('password')], 'As senhas são conferem')
          : field
      ),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res
        .status(400)
        .json({ status: 'error', message: `Erro: ${validate.error}` });
    }

    const { id, phone, oldPassword } = body;

    const organizer = await Organizer.findByPk(id);

    if (!organizer) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Organizador não encontrado' });
    }

    if (phone && String(phone) !== String(organizer.phone)) {
      const organizerExists = await Organizer.findOne({
        where: { phone },
      });

      if (organizerExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Erro: Número de Telefone já existe na base de dados',
        });
      }
    }

    if (oldPassword && !(await organizer.checkPassword(oldPassword))) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro: A Senha anterior não confere',
      });
    }

    body.status = getStatusTranslate(body.status);

    await organizer.update(body);
    return res.json({ status: 'success' });
  }

  async delete(req, res) {
    const { id } = req.params;

    const organizer = await Organizer.findByPk(id);

    if (!organizer) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Organizador não encontrado' });
    }

    await organizer.update({ id, status: 'INACTIVE' });
    return res.json({ status: 'success' });
  }
}

export default new OrganizerController();
