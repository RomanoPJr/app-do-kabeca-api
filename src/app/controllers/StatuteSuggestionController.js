import * as Yup from 'yup';
import StatuteSuggestion from '../models/StatuteSuggestion';

class StatuteSuggestionController {
  async index(req, res) {
    const findAllResponse = await StatuteSuggestion.findAll({
      limit: 1,
      order: [['id', 'asc']],
    });

    res.json({
      data: findAllResponse,
    });
  }

  async store(req, res) {
    const { body } = req;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const createResponse = await StatuteSuggestion.create(body);
    return res.json(createResponse);
  }

  async update(req, res) {
    const { body } = req;
    const { id, description } = body;

    const schema = Yup.object().shape({
      id: Yup.number().required('adlkjfadfklj'),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const findResponse = await StatuteSuggestion.findByPk(id);

    const updateResponse = await findResponse.update({ description });
    return res.json(updateResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await StatuteSuggestion.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new StatuteSuggestionController();
