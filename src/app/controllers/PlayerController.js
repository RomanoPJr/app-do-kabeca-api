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

    const dataFindAll = await ClubPlayer.findAll({
      where: { club_id: user_request.club_id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'position', 'type', 'user_id', 'invite'],
      order: [['id', 'asc']],
      include: [
        {
          where: userFilter,
          model: User,
          attributes: ['id', 'name', 'phone', 'status', 'birth_date', 'type'],
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
    const { club_id } = user_request;

    // CHECK IF THIS CLUB HAS 60 PLAYERS
    const dataCount = await ClubPlayer.count({
      where: { club_id },
    });

    if (dataCount === 60) {
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
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string().email('Email é inválido'),
      position: Yup.string()
        .required('Posição é obrigatória')
        .oneOf(['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE'], 'Posição é inválida'),
      type: Yup.string()
        .required('Tipo é obrigatório')
        .oneOf(['JOGADOR', 'COLABORADOR'], 'Tipo é inválido'),
      password: Yup.string().min(
        6,
        'Senha deve possuir no mínimo 6 letras ou numeros'
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required()
              .oneOf([Yup.ref('password')], 'As senhas não coincidem')
          : field
      ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    // SET CLUB PLAYER DATA
    const { type, position, status } = body_request;
    const clubPlayerData = {
      club_id,
      type,
      position,
      status,
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
      const { name, phone, password, birth_date, email } = body_request;
      const { id } = await User.create({
        name,
        email,
        phone,
        password,
        birth_date,
        type: 'PLAYER',
      });
      clubPlayerData.user_id = id;
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
      phone: Yup.string()
        .required('Telefone é obrigatório')
        .min(11, 'Telefone precisa possuir o tamanho mínimo de 11 caracteres'),
      email: Yup.string().required('Email é obrigatório'),
      position: Yup.string()
        .required('Posição é obrigatória')
        .oneOf(['GOLEIRO', 'DEFESA', 'MEIO', 'ATAQUE'], 'Posição é inválida'),
      type: Yup.string()
        .required('Tipo é obrigatório')
        .oneOf(['JOGADOR', 'COLABORADOR'], 'Tipo é inválido'),
      invite: Yup.string()
        .required('Status é obrigatório')
        .oneOf(['AGUARDANDO', 'ACEITO', 'BLOQUEADO'], 'Status é inválido'),
      password: Yup.string().min(
        6,
        'Senha deve possuir no mínimo 6 letras ou numeros'
      ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required()
              .oneOf([Yup.ref('password')], 'As senhas não coincidem')
          : field
      ),
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

    if (body_request.phone !== findUser.phone) {
      if (findUser.type === 'ORGANIZER') {
        return res.status(400).json({
          error:
            'Este jogador tambem é um organizador, somente ele pode alterar suas informações de contato',
        });
      }

      const dataFindOneUser = await User.findOne({
        where: { phone: body_request.phone },
      });

      if (dataFindOneUser) {
        return res.status(400).json({
          error: 'Já existe um usuário com este email ou telefone',
        });
      }
    }

    if (body_request.email !== findUser.email) {
      if (findUser.type === 'ORGANIZER') {
        return res.status(400).json({
          error:
            'Este jogador tambem é um organizador, somente ele pode alterar suas informações de contato',
        });
      }

      const dataFindOneUser = await User.findOne({
        where: { email: body_request.email },
      });

      if (dataFindOneUser) {
        return res.status(400).json({
          error: 'Já existe um usuário com este email ou telefone',
        });
      }
    }

    const {
      name,
      phone,
      email,
      birth_date,
      position,
      type,
      invite,
      password,
    } = body_request;

    await findUser.update({
      name,
      phone,
      email,
      birth_date,
      password,
    });

    await findClubPlayer.update({
      position,
      type,
      invite,
    });

    return res.json({ message: 'Registro Atualizado com sucesso!' });
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
