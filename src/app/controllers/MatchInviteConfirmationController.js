import * as Yup from 'yup';
import Club from '../models/Club';
import MatchInviteConfirmation from '../models/MatchInviteConfirmation';

class MatchInviteConfirmationController {
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

    if (!user_request.ClubPlayers.id) {
      return res.status(404).json({
        error: 'Somente jogadores podem executar esta ação',
      });
    }

    const pageTotal = await MatchInviteConfirmation.count({
      where: { club_player_id: user_request.ClubPlayers.id },
    });

    const dataFindAll = await MatchInviteConfirmation.findAll({
      where: { club_player_id: user_request.ClubPlayers.id },
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
      match_invite_id: Yup.string().required('Convite não informado'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const existsInviteConfirmation = await MatchInviteConfirmation.findOne({
      where: {
        club_player_id: user_request.ClubPlayers.id,
        match_invite_id: body_request.match_invite_id,
      },
      attributes: ['id'],
    });

    if (existsInviteConfirmation) {
      return res.status(400).json({
        error: 'Sua presença já foi confirmada',
      });
    }

    body_request.club_player_id = user_request.ClubPlayers.id;

    const createResponse = await MatchInviteConfirmation.create(body_request);
    return res.json(createResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await MatchInviteConfirmation.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new MatchInviteConfirmationController();
