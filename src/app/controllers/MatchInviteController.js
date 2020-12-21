import * as Yup from 'yup';
import Club from '../models/Club';
import MatchInvite from '../models/MatchInvite';

class MatchInviteController {
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

    const pageTotal = await MatchInvite.count({
      where: { club_id: club.id },
    });

    const dataFindAll = await MatchInvite.findAll({
      where: { club_id: club.id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      order: [['match_date', 'desc']],
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
      match_date: Yup.date().required('Data da pelada não informada'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const existsInvite = await MatchInvite.findOne({
      where: { club_id: club.id, match_date: body_request.match_date },
      attributes: ['id'],
    });

    if (existsInvite) {
      return res.status(400).json({
        message: 'Já foi enviado um convite para este dia',
      });
    }

    body_request.club_id = club.id;

    const createResponse = await MatchInvite.create(body_request);
    return res.json(createResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await MatchInvite.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new MatchInviteController();
