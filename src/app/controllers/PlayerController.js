import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';

import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';

class PlayerController {
  async find(req, res) {
    const { phone, email } = req.query;
    const dataFindOne = await User.findOne({
      where: Sequelize.or(
        {
          email: { [Op.like]: `${email.toUpperCase()}%` },
        },
        {
          phone: { [Op.like]: `${phone}%` },
        }
      ),
    });

    res.json(dataFindOne);
  }

  async index(req, res) {
    const {
      pageSize = 10,
      pageNumber = 1,
      field = false,
      value = false,
    } = req.query;
    const { user_request } = req.body;

    const dataCount = await ClubPlayer.count({
      where: { club_id: user_request.club_id },
    });

    const userFilter = {};

    if (field && value) {
      userFilter[field] = { [Op.like]: `%${value}%` };
    }

    const dataFindAll = await User.findAll({
      limit: pageSize,
      where: userFilter,
      order: [['name', 'asc']],
      offset: (pageNumber - 1) * pageSize,
      attributes: ['id', 'name', 'phone', 'status', 'birth_date', 'type'],
      include: [
        {
          where: { club_id: user_request.club_id },
          model: ClubPlayer,
          attributes: [
            'id',
            'position',
            'user_id',
            'invite',
            'created_at',
            'monthly_payment',
          ],
        },
      ],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(dataCount / pageSize),
      data: dataFindAll,
    });
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;
    const { club_id, plan_type } = user_request;

    // CHECK IF THIS CLUB HAS 60 PLAYERS
    const dataCount = await ClubPlayer.count({
      where: { club_id },
    });

    if (dataCount === plan_type) {
      return res.status(400).json({
        error: 'Você já atingiu o limite de 60 jogadores',
      });
    }

    // VALIDATE FORM
    const schema = Yup.object().shape({
      name: Yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome precisa possuir o tamanho mínimo de 3 caracteres'),
      phone: Yup.string()
        .required('Telefone é obrigatório')
        .min(10, 'Telefone precisa ter entre 10 e 11 caracteres')
        .max(11, 'Telefone precisa ter entre 10 e 11 caracteres'),
      position: Yup.string()
        .required('Posição é obrigatória')
        .oneOf(
          ['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE', 'COLABORADOR'],
          'Posição é inválida'
        ),
      monthly_payment: Yup.number().when('position', (position, field) => {
        return position !== 'COLABORADOR'
          ? field.required('Valor da Mensalidade é obrigatório')
          : field;
      }),
      created_at: Yup.date().required('Data de Entrada é obrigatória'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    // SET CLUB PLAYER DATA
    const { status, position, monthly_payment, created_at } = body_request;
    const clubPlayerData = {
      status,
      club_id,
      position,
      createdAt: `${created_at} 12:00:00`,
      monthly_payment,
    };

    // FIND AN USER BY PHONE
    const dataFindOneUser = await User.findOne({
      where: { phone: body_request.phone },
      attributes: ['id'],
    });

    // IF USER HAS FINDED
    if (dataFindOneUser) {
      // CHECK IF A PLAYER IS ALREADY REGISTERED IN THE CLUB
      const findClubPlayer = await ClubPlayer.findOne({
        where: { club_id, user_id: dataFindOneUser.id },
        attributes: ['id'],
      });

      if (findClubPlayer) {
        return res.status(400).json({
          error: 'Este jogador já faz parte do seu clube',
        });
      }
      clubPlayerData.user_id = dataFindOneUser.id;
    } else {
      const { name, phone, password, birth_date } = body_request;
      const { id } = await User.create({
        name,
        phone,
        password,
        birth_date,
        type: 'PLAYER',
      });
      clubPlayerData.user_id = id;
    }

    if (clubPlayerData.position === 'COLABORADOR') {
      clubPlayerData.monthly_payment = 0;
    }

    // CREATE ASSOCIATION WITH CLUB
    await ClubPlayer.create(clubPlayerData);
    return res.json({ message: 'Convite enviado com sucesso' });
  }

  async update(req, res) {
    const { user_request, ...body_request } = req.body;
    const { club_id } = user_request;

    const schema = Yup.object().shape({
      id: Yup.number().required('Nenhum Jogador foi informado'),
      name: Yup.string()
        .required('Nome é obrigatório')
        .min(3, 'Nome precisa possuir o tamanho mínimo de 3 caracteres'),
      position: Yup.string()
        .required('Posição é obrigatória')
        .oneOf(
          ['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE', 'COLABORADOR'],
          'Posição é inválida'
        ),
      invite: Yup.string()
        .required('Status é obrigatório')
        .oneOf(['AGUARDANDO', 'ACEITO', 'BLOQUEADO'], 'Status é inválido'),
      monthly_payment: Yup.number().required(
        'Valor da Mensalidade é obrigatório'
      ),
      created_at: Yup.date().required('Data de Entrada é obrigatória'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findClubPlayer = await ClubPlayer.findOne({
      where: { id: body_request.id, club_id },
    });

    if (!findClubPlayer) {
      return res.status(400).json({
        error: 'Jogador não é membro do seu clube',
      });
    }

    const findUser = await User.findByPk(findClubPlayer.user_id);

    if (!findUser) {
      return res.status(400).json({
        error: 'Jogador não encontrado',
      });
    }

    const { invite, position, monthly_payment, created_at } = body_request;

    const new_monthly_payment =
      position === 'COLABORADOR' ? 0 : monthly_payment;

    console.log({
      invite,
      position,
      created_at: `${created_at} 00:00:00`,
      monthly_payment: new_monthly_payment,
    });

    await findClubPlayer.update({
      invite,
      position,
      created_at: `${created_at} 12:00:00`,
      monthly_payment: new_monthly_payment,
    });

    return res.json({ message: 'Registro Atualizado com sucesso!' });
  }

  async resetPassword(req, res) {
    const { id } = req.params;
    const { club_id } = req.body.user_request;

    const findClubPlayer = await ClubPlayer.findOne({
      where: { id, club_id },
    });

    if (!findClubPlayer) {
      return res.status(400).json({
        error: 'Jogador não é membro do seu clube',
      });
    }

    const findUser = await User.findByPk(findClubPlayer.user_id);

    if (!findUser) {
      return res.status(400).json({
        error: 'Jogador não encontrado',
      });
    }

    if (findUser.type === 'ORGANIZER') {
      return res.status(400).json({
        error:
          'Este usuário é um organizador, somente o administrador pode alterar a senha.',
      });
    }

    await findUser.update({ password_hash: null });

    return res.json({ message: 'Senha atualizada com sucesso!' });
  }

  async delete(req, res) {
    const { id } = req.params;
    await ClubPlayer.destroy({
      where: {
        id,
      },
    });
    return res.json({});
  }
}

export default new PlayerController();
