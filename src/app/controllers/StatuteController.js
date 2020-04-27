import * as Yup from 'yup';
import Statute from '../models/Statute';

class StatuteController {
  async index(req, res) {
    const { user_request } = req.body;

    const findOne = await Statute.findOne({
      where: { club_id: user_request.club_id },
    });

    return res.json(findOne);
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;

    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(body_request))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    body_request.club_id = user_request.club_id;

    const createResponse = await Statute.create(body_request);
    return res.json(createResponse);
  }

  async update(req, res) {
    const { user_request, ...body_request } = req.body;

    const schema = Yup.object().shape({
      id: Yup.number().required('Nenhum registro foi informado'),
      description: Yup.string().required('Descrição é obrigatória'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.errors ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findOneResponse = await Statute.findOne({
      where: {
        id: body_request.id,
        club_id: user_request.club_id,
      },
    });

    if (!findOneResponse) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    const { description } = body_request;
    const updated = await findOneResponse.update({ description });
    return res.json(updated);
  }

  async delete(req, res) {
    const { id } = req.params;
    await Statute.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new StatuteController();
