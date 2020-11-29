import * as Yup from 'yup';
import { Op } from 'sequelize';
import Club from '../models/Club';
import User from '../models/User';
import Match from '../models/Match';
import MatchEscalation from '../models/MatchEscalation';
import MatchEvent from '../models/MatchEvent';

class MatchController {
  async index(req, res) {
    const {
      headers,
      body: { user_request },
      query: { pageSize = 10, pageNumber = 1 },
    } = req;

    let findOneWhere = {};

    if (headers.club_id) {
      findOneWhere = { club_id: headers.club_id };
    } else {
      findOneWhere = { club_id: user_request.club_id };
    }

    const count = await Match.count({
      where: findOneWhere,
      group: ['date'],
    });

    const { rows } = await Match.findAndCountAll({
      where: findOneWhere,
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      order: [['date', 'desc']],
      attributes: ['date'],
      group: ['date'],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count.length / pageSize),
      data: rows,
    });
  }

  async listByDate(req, res) {
    const {
      headers,
      body: { user_request },
      query: { date },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!club_id) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const { rows } = await Match.findAndCountAll({
      where: { club_id, date },
      order: [['id', 'asc']],
    });

    return res.json({
      data: rows,
    });
  }

  async findOne(req, res) {
    const {
      headers,
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!club_id) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const data = await Match.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          required: false,
          model: MatchEscalation,
          where: {
            replaced: null,
          },
          include: [
            {
              required: false,
              model: User,
            },
          ],
        },
        {
          required: false,
          model: MatchEvent,
          include: [
            {
              required: false,
              model: User,
            },
            {
              required: false,
              model: Match,
            },
            {
              required: false,
              model: MatchEscalation,
            },
          ],
        },
      ],
      order: [[MatchEvent, 'created_at', 'DESC']],
    });

    let placar = {
      team_a_goals: 0,
      team_b_goals: 0,
    };

    if (data.MatchEvents) {
      placar = data.MatchEvents.reduce(
        (acc, cur) => {
          if (cur.MatchEscalation) {
            if (cur.MatchEscalation.team === 'TIME A' && cur.type === 'GOL') {
              acc.team_a_goals += 1;
            } else if (cur.MatchEscalation.team === 'TIME B' && cur.type === 'GOL') {
              acc.team_b_goals += 1;
            }
          } else if (cur.type === 'GOL SOFRIDO') {
            acc.team_b_goals += 1;
          }
          return acc;
        },
        {
          team_a_goals: 0,
          team_b_goals: 0,
        }
      );
    }

    return res.json({ data: { ...data.toJSON(), placar }, message: 'success' });
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;

    const dataFindOneClub = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!dataFindOneClub) {
      return res.status(404).json({
        message: 'Você ainda não configurou o seu clube',
      });
    }

    const currDate = body_request.date.split('-');
    const currYear = currDate[0];
    const currMonth = currDate[1];
    const dataCount = await Match.count({
      where: {
        club_id: dataFindOneClub.id,
        date: {
          [Op.between]: [new Date(`${currYear}-${currMonth}-01`), new Date(`${currYear}-${currMonth}-31`)],
        },
      },
    });

    if (dataCount >= 5) {
      return res.status(400).json({
        message: 'Você já atingiu o limite de 5 partidas para o mês informado',
      });
    }

    const schema = Yup.object().shape({
      team_a: Yup.string().required('Nome do "Time A" é obrigatório'),
      team_b: Yup.string().required('Nome do "Time B" é obrigatório'),
      date: Yup.date().required('Data da Partida é obrigatório'),
      duration: Yup.number().required('Duração é obrigatório'),
      players_quantity: Yup.number()
        .required('Quantidade de Jogadores é obrigatório')
        .min(5, 'Mínimo de jogadores é 5')
        .max(11, 'Máximo de jogadores é 11'),
      modality: Yup.string()
        .required('Modalidade é obrigatório')
        .oneOf(['1 TEMPO', '2 TEMPOS'], 'Modalidade é inválido'),
      score_type: Yup.string()
        .required('Pontuação é obrigatório')
        .oneOf(['RANKEADA', 'NÃO RANKEADA'], 'Pontuação é inválido'),
      type: Yup.string()
        .required('Tipo de Partida é obrigatório')
        .oneOf(['PARTIDA INTERNA', 'PARTIDA EXTERNA'], 'Tipo de Partida é inválido'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ message: validate.error });
    }

    body_request.club_id = dataFindOneClub.id;

    const createResponse = await Match.create(body_request);
    return res.json({
      data: createResponse,
      message: 'Registro criado com sucesso',
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
        message: 'Você ainda não configurou o seu clube',
      });
    }

    const schema = Yup.object().shape({
      id: Yup.number().required('Nenhuma partida informada'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ message: validate.error });
    }

    const currDate = body_request.date.split('-');
    const currYear = currDate[0];
    const currMonth = currDate[1];
    const dataCount = await Match.count({
      where: {
        club_id: dataFindOneClub.id,
        date: {
          [Op.between]: [new Date(`${currYear}-${currMonth}-01`), new Date(`${currYear}-${currMonth}-31`)],
        },
      },
    });

    if (dataCount >= 5) {
      return res.status(400).json({
        message: 'Você já atingiu o limite de 5 partidas para o mês informado',
      });
    }

    const find = await Match.findByPk(body_request.id);

    if (!find) {
      return res.status(400).json({
        message: 'Partida não encontrada',
      });
    }

    if (find.timer_1 && body_request.timer_1 && body_request.timer_1 !== find.timer_1) {
      return res.status(400).json({
        message: 'Este cronômetro já foi iniciado.',
      });
    }

    if (find.timer_2 && body_request.timer_2 && body_request.timer_2 !== find.timer_2) {
      return res.status(400).json({
        message: 'Este cronômetro já foi iniciado.',
      });
    }

    const updated = await find.update(body_request);

    return res.json({
      success: true,
      message: 'Partida atualizada com sucesso',
      data: updated,
    });
  }

  async delete(req, res) {
    const { id } = req.params;
    await Match.destroy({
      where: {
        id,
      },
    });
    return res.json({});
  }
}

export default new MatchController();
