import * as Yup from 'yup';
import { Op } from 'sequelize';
import MatchEscalation from '../models/MatchEscalation';
import Event from '../models/Event';
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
      match_id: Yup.number().required('Nenhuma partida informada'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ message: validate.error });
    }

    let findEvent = null;
    if (body_request.event_id) {
      findEvent = await Event.findByPk(body_request.event_id);
    } else if (
      body_request.type &&
      (body_request.type === 'GOL' || body_request.type === 'GOL SOFRIDO')
    ) {
      findEvent = await Event.findOne({
        where: {
          type: body_request.type,
        },
      });
    }

    if (!findEvent) {
      return res.status(400).json({
        message: 'Evento não encontrado',
      });
    }

    body_request.event_id = findEvent.id;
    body_request.description = findEvent.description;
    body_request.value = findEvent.value;
    body_request.type = findEvent.type;
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
    await MatchEvent.destroy({
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
