import * as Yup from 'yup';
import { Op } from 'sequelize';
import Club from '../models/Club';
import User from '../models/User';
import Match from '../models/Match';
import MatchEscalation from '../models/MatchEscalation';
import MatchEvent from '../models/MatchEvent';

class MatchController {
  async index(req, res) {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const { user_request } = req.body;

    if (!user_request.club_id) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const { count, rows } = await Match.findAndCountAll({
      where: { club_id: user_request.club_id },
      offset: (pageNumber - 1) * pageSize,
      raw: true,
      nest: true,
      limit: pageSize,
      order: [['date', 'asc']],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
    });
  }

  async findOne(req, res) {
    const { user_request } = req.body;

    const dataFindOneClub = await Club.findOne({
      where: { user_id: user_request.id },
      attributes: ['id'],
    });

    if (!dataFindOneClub) {
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
          // order: [['created_at', 'ASC']],
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

    return res.json({ data, message: 'success' });
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

    const currDate = new Date();
    const currYear = currDate.getFullYear();
    const currMonth = currDate.getMonth();
    const dataCount = await Match.count({
      where: {
        club_id: dataFindOneClub.id,
        date: {
          [Op.gte]: new Date(`${currYear}-${currMonth}-01`),
          [Op.lte]: new Date(`${currYear}-${currMonth}-31`),
        },
      },
    });

    if (dataCount === 5) {
      return res.status(400).json({
        message: 'Você já atingiu o limite de 5 partidas em um mês',
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
        .oneOf(
          ['PARTIDA INTERNA', 'PARTIDA EXTERNA'],
          'Tipo de Partida é inválido'
        ),
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
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      value: Yup.number().required('Valor é obrigatório'),
      banner_url: Yup.string('Banner é inválido'),
      status: Yup.string()
        .required('Email é obrigatório')
        .oneOf(['ATIVO', 'INATIVO'], 'Status é inválido'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    // const dataFindByPk = await Sponsor.findByPk(body_request.id);

    // if (!dataFindByPk) {
    //   return res.status(400).json({
    //     error: 'Patrocinador não encontrado',
    //   });
    // }

    // if (body_request.name !== dataFindByPk.name) {
    //   const dataFindOne = await Sponsor.findOne({
    //     where: { name: body_request.name },
    //   });

    //   if (dataFindOne) {
    //     return res.status(400).json({
    //       error: 'Já existe um patrocinador com este nome',
    //     });
    //   }
    // }

    // const { name, value, status, banner_url } = body_request;
    // const updateResponse = await dataFindByPk.update({
    //   name,
    //   value,
    //   status,
    //   banner_url,
    // });
    // return res.json(updateResponse);
    return res.json({});
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
