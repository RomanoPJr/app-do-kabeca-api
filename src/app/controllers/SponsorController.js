import * as Yup from 'yup';
import differenceInMonths from 'date-fns/differenceInMonths';
import Sponsor from '../models/Sponsor';
import Club from '../models/Club';

class SponsorController {
  async index(req, res) {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const { user_request } = req.body;

    if (!user_request.club_id) {
      return res.status(404).json({
        error: 'Você ainda não configurou o seu clube',
      });
    }

    const { count, rows } = await Sponsor.findAndCountAll({
      where: { club_id: user_request.club_id },
      offset: (pageNumber - 1) * pageSize,
      raw: true,
      nest: true,
      limit: pageSize,
      attributes: ['id', 'name', 'value', 'status', 'banner_url', 'created_at'],
      order: [['id', 'asc']],
    });

    rows.map(row => {
      row.sponsorship_time = differenceInMonths(Date.now(), row.created_at);
    });
    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
    });
  }

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

    const dataCount = await Sponsor.count({
      where: { club_id: dataFindOneClub.id },
    });

    if (dataCount === 6) {
      return res.status(400).json({
        error: 'Você já atingiu o limite de 6 patrocinadores',
      });
    }

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome é obrigatório'),
      value: Yup.number().required('Valor é obrigatório'),
      banner_url: Yup.string('Banner é inválido'),
      status: Yup.string()
        .required('Status é obrigatório')
        .oneOf(['ATIVO', 'INATIVO'], 'Status é inválido'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }
    const dataFindOne = await Sponsor.findOne({
      where: { name: body_request.name, club_id: dataFindOneClub.id },
    });

    if (dataFindOne) {
      return res.status(400).json({
        error: 'Já existe um patrocinador com este nome',
      });
    }

    body_request.club_id = dataFindOneClub.id;

    const { name, value, banner_url, status } = body_request;
    const createResponse = await Sponsor.create({
      name,
      value,
      status,
      banner_url,
      club_id: dataFindOneClub.id,
    });
    return res.json(createResponse);
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

    const dataFindByPk = await Sponsor.findByPk(body_request.id);

    if (!dataFindByPk) {
      return res.status(400).json({
        error: 'Patrocinador não encontrado',
      });
    }

    if (body_request.name !== dataFindByPk.name) {
      const dataFindOne = await Sponsor.findOne({
        where: { name: body_request.name },
      });

      if (dataFindOne) {
        return res.status(400).json({
          error: 'Já existe um patrocinador com este nome',
        });
      }
    }

    const { name, value, status, banner_url } = body_request;
    const updateResponse = await dataFindByPk.update({
      name,
      value,
      status,
      banner_url,
    });
    return res.json(updateResponse);
  }

  async delete(req, res) {
    const { id } = req.params;
    await Sponsor.destroy({
      where: {
        id,
      },
    });
    return res.json({});
  }
}

export default new SponsorController();
