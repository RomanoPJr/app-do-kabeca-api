import * as Yup from 'yup';
import { Op } from 'sequelize';
import Season from '../models/Season';
import Club from '../models/Club';

class SeasonController {
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

    const pageTotal = await Season.count({
      where: { club_id: club.id },
    });

    const dataFindAll = await Season.findAll({
      where: { club_id: club.id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'name', 'date_start', 'date_end'],
      order: [['date_start', 'desc']],
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

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome não informado'),
      date_start: Yup.date('Data inválida').required('Data de início não informada'),
      date_end: Yup.date('Data inválida').required('Data de fim não informada'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const EventExists = await Season.findOne({
      where: {
        [Op.or]: {
          name: body_request.name,
          [Op.and]: {
            date_start: body_request.date_start,
            date_end: body_request.date_end,
          },
        },
      },
    });
    if (EventExists) {
      return res.status(400).json({
        error: 'Já existe uma temporadas com este nome ou data',
      });
    }

    body_request.club_id = club.id;

    const createResponse = await Season.create(body_request);
    return res.json(createResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await Season.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new SeasonController();
