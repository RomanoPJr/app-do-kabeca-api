import * as Yup from 'yup';
import { Op } from 'sequelize';
import MatchEscalation from '../models/MatchEscalation';
import Club from '../models/Club';

class MatchEscalationController {
  async store(req, res) {
    const { user_request, ...body_request } = req.body;

    const dataFindOneClub = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!dataFindOneClub) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const schema = Yup.object().shape({
      match_id: Yup.number().required('Nenhuma partida informada'),
      user_id: Yup.number().required('Nenhum jogador informado'),
      position: Yup.number().required('Posição não informada'),
      round: Yup.string()
        .required('Tempo não informado')
        .oneOf(['1º TEMPO', '2º TEMPO'], 'Tempo é inválido'),
      team: Yup.string()
        .required('Time não informado')
        .oneOf(['TIME A', 'TIME B'], 'Time é inválido'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const sameEscalation = await MatchEscalation.findOne({
      raw: true,
      nest: true,
      where: {
        [Op.or]: {
          [Op.and]: {
            match_id: body_request.match_id,
            position: body_request.position,
            round: body_request.round,
          },
          [Op.and]: {
            match_id: body_request.match_id,
            user_id: body_request.user_id,
            round: body_request.round,
          },
        },
      },
    });

    if (sameEscalation) {
      return res.status(400).json({
        message:
          'Esta posição já foi preenchida ou este jogador já foi escalado',
      });
    }

    const createResponse = await MatchEscalation.create(body_request);
    return res.json({
      message: 'Registro salvo com sucesso',
      data: createResponse,
    });
  }

  async update(req, res) {
    const { user_request, ...body_request } = req.body;

    const dataFindOneClub = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!dataFindOneClub) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const matchEscalation = await MatchEscalation.findByPk(body_request.id);

    if (!matchEscalation) {
      return res.status(400).json({
        error: 'Escalação não encontrada',
      });
    }

    if (body_request.replaced) {
      const newEscalation = await MatchEscalation.create({
        match_id: matchEscalation.match_id,
        user_id: body_request.replaced,
        position: matchEscalation.position,
        round: matchEscalation.round,
        team: matchEscalation.team,
      });

      matchEscalation.replaced = newEscalation.id;
    }

    matchEscalation.save();

    return res.json({
      success: true,
      message: 'Jogador substituído com sucesso!',
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    await MatchEscalation.destroy({
      where: {
        id,
      },
    });
    return res.json({
      success: true,
      message: 'Registro excluído com sucesso!',
    });
  }
}

export default new MatchEscalationController();
