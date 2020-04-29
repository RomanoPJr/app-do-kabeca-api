import * as Yup from 'yup';
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
      where: { club_id: club.id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'description', 'value'],
      order: [['id', 'asc']],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(pageTotal / pageSize),
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

    const countEvent = await Event.count({
      where: { club_id: club.id },
    });

    if (countEvent === 10) {
      return res.status(400).json({
        error: 'Você já atingiu o limite de 10 eventos',
      });
    }

    const schema = Yup.object().shape({
      description: Yup.string().required(),
      value: Yup.number().required(),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }
    const EventExists = await Event.findOne({
      where: { description: body_request.description },
    });

    if (EventExists) {
      return res.status(400).json({
        error: 'Já existe um evento com este nome',
      });
    }

    body_request.club_id = club.id;

    const createResponse = await Event.create(body_request);
    return res.json(createResponse);
  }

  async update(req, res) {
    const { body } = req;
    const { id, description, value } = body;

    const schema = Yup.object().shape({
      id: Yup.number().required('O campo id é obrigatório.'),
      description: Yup.string().required('O campo Descrição é obrigatório.'),
      value: Yup.number().required('O campo valor é obrigatório.'),
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
