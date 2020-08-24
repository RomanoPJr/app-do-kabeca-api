import * as Yup from 'yup';
import { Op } from 'sequelize';
import MatchEscalation from '../models/MatchEscalation';
import Club from '../models/Club';
import MatchEvent from '../models/MatchEvent';

class MatchEventController {
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
      description: Yup.string().required('Nenhuma descrição informada'),
      value: Yup.number().required('Nenhuma valor informado'),
      user_id: Yup.number().required('Nenhum jogador informado'),
      event_id: Yup.number().required('Nenhuma evento informado'),
      match_id: Yup.number().required('Nenhuma partida informada'),
      escalation_id: Yup.number().required('Nenhuma escalação informada'),
      type: Yup.string()
        .required('Tipo não informado')
        .oneOf(
          [
            'GOL',
            'VITORIA',
            'EMPATE',
            'DERROTA',
            'EVENTO 1',
            'EVENTO 2',
            'EVENTO 3',
            'EVENTO 4',
            'EVENTO 5',
          ],
          'Tipo é inválido'
        ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ message: validate.error });
    }

    const event = await MatchEvent.findOne({
      raw: true,
      nest: true,
      where: {
        [Op.and]: {
          match_id: body_request.match_id,
          user_id: body_request.user_id,
          type: {
            [Op.in]: ['VITORIA', 'EMPATE', 'DERROTA'],
          },
        },
      },
    });

    if (event) {
      return res.status(400).json({
        message: 'Não é possível inserir esse evento',
      });
    }

    body_request.club_id = dataFindOneClub.id;

    const createResponse = await MatchEvent.create(body_request);
    return res.json({
      message: 'Evento registrado com sucesso',
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

export default new MatchEventController();
