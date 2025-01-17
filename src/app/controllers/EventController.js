import * as Yup from 'yup';
import { Op } from 'sequelize';
import Event from '../models/Event';
import Club from '../models/Club';

class EventController {
  async index(req, res) {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const { user_request } = req.body;

    const club = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!club) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const pageTotal = await Event.count({
      where: { club_id: club.id },
    });

    const dataFindAll = await Event.findAll({
      raw: true,
      nest: true,
      where: { club_id: club.id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'description', 'value', 'type', 'updatedAt'],
      order: [['value', 'desc']],
    });

    const notIncludedEvents = [];

    if (!dataFindAll.find(i => i.type === 'VITORIA')) {
      notIncludedEvents.push('VITORIA');
    }
    if (!dataFindAll.find(i => i.type === 'EMPATE')) {
      notIncludedEvents.push('EMPATE');
    }
    if (!dataFindAll.find(i => i.type === 'DERROTA')) {
      notIncludedEvents.push('DERROTA');
    }

    const fixedEvents = await Event.findAll({
      attributes: ['description', 'type'],
      where: {
        type: {
          [Op.in]: notIncludedEvents,
        },
        club_id: null,
        value: null,
      },
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(pageTotal / pageSize),
      data: [...fixedEvents, ...dataFindAll],
    });
  }

  async fetchAll(req, res) {
    const { user_request } = req.body;

    const club = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!club) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const dataFindAll = await Event.findAll({
      where: {
        club_id: club.id,
        type: {
          [Op.notIn]: ['VITORIA', 'EMPATE', 'DERROTA'],
        },
      },
      attributes: ['id', 'description', 'value', 'type', 'updatedAt'],
      order: [['value', 'desc']],
    });

    return res.json({
      success: true,
      data: dataFindAll,
    });
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;

    const club = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!club) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const schema = Yup.object().shape({
      description: Yup.string().required('Descrição não informada'),
      value: Yup.number().required('Valor não informado'),
      type: Yup.string()
        .required('Tipo não informado')
        .oneOf(
          [
            'VITORIA',
            'EMPATE',
            'DERROTA',
            'EVENTO 1',
            'EVENTO 2',
            'EVENTO 3',
            'EVENTO 4',
            'EVENTO 5',
          ],
          'Tipo não é válido'
        ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const countEvent = await Event.count({
      where: { club_id: club.id },
    });

    if (countEvent === 8) {
      return res.status(400).json({
        error: 'Você já atingiu o limite de 5 eventos',
      });
    }

    const EventExists = await Event.findOne({
      where: {
        [Op.or]: {
          [Op.and]: {
            description: body_request.description,
            club_id: club.id,
          },
          [Op.and]: {
            type: body_request.type,
            club_id: club.id,
          },
        },
      },
    });
    if (EventExists) {
      return res.status(400).json({
        error: 'Já existe um evento com este nome ou tipo',
      });
    }

    if (
      body_request.type === 'VITORIA' ||
      body_request.type === 'EMPATE' ||
      body_request.type === 'DERROTA'
    ) {
      body_request.description = body_request.type;
    }

    body_request.club_id = club.id;

    const createResponse = await Event.create(body_request);
    return res.json(createResponse);
  }

  async update(req, res) {
    const { body } = req;
    const { id, description, value, type } = body;

    const schema = Yup.object().shape({
      id: Yup.number().required('O campo id é obrigatório.'),
      description: Yup.string().required('Descrição não informada'),
      value: Yup.number().required('Valor não informado'),
      type: Yup.string()
        .required('Tipo não informado')
        .oneOf(
          [
            'VITORIA',
            'EMPATE',
            'DERROTA',
            'EVENTO 1',
            'EVENTO 2',
            'EVENTO 3',
            'EVENTO 4',
            'EVENTO 5',
          ],
          'Tipo não é válido'
        ),
    });

    const validate = await schema.validate(body).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findResponse = await Event.findByPk(id);

    if (!findResponse) {
      return res.status(400).json({
        error: 'Evento não encontrado',
      });
    }

    if (description !== findResponse.description) {
      const EventExists = await Event.findOne({
        where: { description: body.description },
      });

      if (EventExists) {
        return res.status(400).json({
          error: 'Já existe um evento com este nome',
        });
      }
    }

    if (description !== findResponse.description) {
      const EventExists = await Event.findOne({
        where: { type: body.type },
      });

      if (EventExists) {
        return res.status(400).json({
          error: 'Já existe um evento deste tipo',
        });
      }
    }

    if (
      body.type === 'VITORIA' ||
      body.type === 'EMPATE' ||
      body.type === 'DERROTA'
    ) {
      body.description = body.type;
    }

    const updateResponse = await findResponse.update({ description, value });
    return res.json(updateResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await Event.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new EventController();
