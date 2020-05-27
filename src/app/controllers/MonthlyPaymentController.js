import * as Yup from 'yup';

import { Op } from 'sequelize';
import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';

const getTotalizers = async ({ club_id, year, month }) => {
  const response = await ClubPlayer.findAll({
    attributes: ['monthly_payment'],
    where: {
      club_id,
      created_at: {
        [Op.lte]: new Date(`${year}-${month}-31`),
      },
    },
    include: [
      {
        model: MonthlyPayment,
        attributes: ['due_value', 'paid_value'],
        where: {
          referent: {
            [Op.gte]: new Date(`${year}-${month}-01`),
            [Op.lte]: new Date(`${year}-${month}-31`),
          },
        },
        required: false,
      },
      {
        model: User,
      },
    ],
  });

  let totalReceivable = 0;
  response.map(({ dataValues: { monthly_payment, MonthlyPayments } }) => {
    if (MonthlyPayments.length > 0) {
      totalReceivable += MonthlyPayments[0].due_value;
    } else {
      totalReceivable += monthly_payment;
    }
  });

  const totalReceived = response.reduce(
    (a, b) =>
      a +
      (b.MonthlyPayments.length > 0 && b.MonthlyPayments[0].paid_value
        ? b.MonthlyPayments[0].paid_value
        : 0),
    0
  );
  const totalDue = totalReceivable - totalReceived;

  return {
    totalReceivable,
    totalReceived,
    totalDue,
  };
};
class MonthlyPaymentController {
  async listPaid(req, res) {
    const { user_request } = req.body;
    const {
      pageSize = 10,
      pageNumber = 1,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const { count, rows } = await MonthlyPayment.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      where: {
        club_id: user_request.club_id,
        referent: {
          [Op.gte]: new Date(`${year}-${month}-01`),
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
    });
  }

  async listDebit(req, res) {
    const { user_request } = req.body;
    const {
      pageSize = 10,
      pageNumber = 1,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    // GET ALL PAYMENT NUMBERS OF THIS CLUB
    const payments = await MonthlyPayment.findAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      where: {
        club_id: user_request.club_id,
        referent: {
          [Op.gte]: new Date(`${year}-${month}-01`),
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
    });

    const phones = payments.map(payment => payment.phone);

    const { count, rows } = await ClubPlayer.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      raw: true,
      nest: true,
      attributes: ['user_id', 'created_at'],
      where: {
        club_id: user_request.club_id,
        created_at: {
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
      include: [
        {
          model: User,
          attributes: ['name', 'phone'],
          where: {
            phone: {
              [Op.notIn]: phones,
            },
          },
        },
      ],
    });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
    });
  }

  async index(req, res) {
    const { user_request } = req.body;
    const {
      pageSize = 10,
      pageNumber = 1,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const { count, rows } = await ClubPlayer.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      attributes: [
        'id',
        'position',
        'user_id',
        'invite',
        'monthly_payment',
        'created_at',
      ],
      where: {
        club_id: user_request.club_id,
        created_at: {
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
      include: [
        {
          model: MonthlyPayment,
          where: {
            referent: {
              [Op.gte]: new Date(`${year}-${month}-01`),
              [Op.lte]: new Date(`${year}-${month}-31`),
            },
          },
          required: false,
        },
        {
          model: User,
        },
      ],
    });

    const totalizers = await getTotalizers({
      club_id: user_request.club_id,
      year,
      month,
    });
    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
      totalizers,
    });
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const schema = Yup.object().shape({
      club_player_id: Yup.number().required('Nenhum jogador foi informado'),
      due_value: Yup.number().required('Valor a pagar é obrigatório'),
      paid_value: Yup.number().required('Valor pago é obrigatório'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.errors ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const { club_player_id } = body_request;
    const findClubPlayer = await ClubPlayer.findByPk(club_player_id, {
      attributes: ['id', 'user_id'],
      raw: true,
      nest: true,
      include: [
        {
          model: User,
        },
      ],
    });

    if (!findClubPlayer) {
      return res.status(400).json({
        error: 'Jogador não pertence ao seu clube',
      });
    }

    const payment = await MonthlyPayment.create({
      due_value: body_request.due_value,
      paid_value: body_request.paid_value,
      referent: `${year}-${month}-01`,
      club_id: user_request.club_id,
      name: findClubPlayer.User.name,
      phone: findClubPlayer.User.phone,
    });

    return res.json(payment);
  }

  async update(req, res) {
    const body_request = req.body;
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const schema = Yup.object().shape({
      id: Yup.number().required('Nenhum Pagamento Informado'),
      due_value: Yup.number().required('Valor a pagar é obrigatório'),
      paid_value: Yup.number().required('Valor pago é obrigatório'),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const { id } = body_request;
    const findPayment = await MonthlyPayment.findByPk(id);

    if (!findPayment) {
      return res.status(400).json({
        error: 'Pagamento não encontrado',
      });
    }

    const { due_value, paid_value } = body_request;
    const updatedPayment = await findPayment.update({
      due_value,
      paid_value,
      referent: `${year}-${month}-01`,
    });

    return res.json(updatedPayment);
  }

  async delete(req, res) {
    const { id } = req.params;
    await MonthlyPayment.destroy({
      where: {
        id,
      },
    });
    return res.json({});
  }
}

export default new MonthlyPaymentController();
