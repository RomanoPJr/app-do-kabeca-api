import * as Yup from 'yup';
import EventSuggestion from '../models/EventSuggestion';

class EventSuggestionController {
  async index(req, res) {
    const {
      pageNumber = 1,
      pageSize = 10,
      orderBy,
      orderDirection,
    } = req.query;

    const pageTotal = await EventSuggestion.count();
    const admins = await EventSuggestion.findAll({
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'description', 'value'],
      order: [[orderBy || 'id', orderDirection || 'asc']],
    });

    res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(pageTotal / pageSize),
      data: admins,
    });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
      value: Yup.number().required(),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const EventSuggestionExists = await EventSuggestion.findOne({
      where: { description: body.description },
    });

    if (EventSuggestionExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Erro: Já existe um evento com este nome',
      });
    }

    const createResponse = await EventSuggestion.create(body);
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
      return err.errors ? { error: err.errors } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findResponse = await EventSuggestion.findByPk(id);

    if (!findResponse) {
      return res.status(400).json({
        status: 'error',
        message: 'Sugestão de Evento não encontrada',
      });
    }

    if (description !== findResponse.description) {
      const EventSuggestionExists = await EventSuggestion.findOne({
        where: { description: body.description },
      });

      if (EventSuggestionExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Erro: Já existe um evento com este nome',
        });
      }
    }

    const updateResponse = await findResponse.update({ description, value });
    return res.json(updateResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await EventSuggestion.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new EventSuggestionController();
