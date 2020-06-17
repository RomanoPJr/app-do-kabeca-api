import * as Yup from 'yup';

import { Op } from 'sequelize';
import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';

const getTotalizers = async ({ user_request, year, month }) => {
  const paid = await MonthlyPayment.findAndCountAll({
    raw: true,
    nest: true,
    where: {
      club_id: user_request.club_id,
      referent: {
        [Op.gte]: new Date(`${year}-${month}-01`),
        [Op.lte]: new Date(`${year}-${month}-31`),
      },
    },
  });

  const paidTotal = paid.rows.reduce(
    (accumulator, payment) => ({
      due_total: accumulator.due_total + payment.due_value,
      paid_total: accumulator.paid_total + payment.paid_value,
    }),
    {
      due_total: 0,
      paid_total: 0,
    }
  );

  const phones = paid.rows.map(payment => payment.phone);

  const debit = await User.findAndCountAll({
    raw: true,
    nest: true,
    attributes: ['id', 'name', 'phone'],
    where: {
      phone: {
        [Op.notIn]: phones,
      },
    },
    include: [
      {
        model: ClubPlayer,
        attributes: ['monthly_payment', 'position'],
        where: {
          club_id: {
            [Op.eq]: user_request.club_id,
          },
        },
      },
    ],
  });

  const debitTotal = debit.rows.reduce((accumulator, debitCurrent) => {
    const value =
      debitCurrent.ClubPlayers.position === 'COLABORADOR'
        ? 0
        : debitCurrent.ClubPlayers.monthly_payment;
    return accumulator + value;
  }, 0);

  const totalReceivable = paidTotal.due_total + debitTotal;
  const totalReceived = paidTotal.paid_total;
  const totalDue = totalReceivable - paidTotal.paid_total;

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
      pageNumber = 0,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const paid = await MonthlyPayment.findAndCountAll({
      limit: pageSize,
      order: [['name', 'asc']],
      offset: (pageNumber - 1) * pageSize,
      where: {
        club_id: user_request.club_id,
        referent: {
          [Op.gte]: new Date(`${year}-${month}-01`),
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
    });

    const totalizers = await getTotalizers({ user_request, year, month });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(paid.count / pageSize),
      totalizers,
      data: paid.rows,
    });
  }

  async listDebit(req, res) {
    const { user_request } = req.body;
    const {
      pageSize = 10,
      pageNumber = 0,
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
    } = req.query;

    const paid = await MonthlyPayment.findAndCountAll({
      where: {
        club_id: user_request.club_id,
        referent: {
          [Op.gte]: new Date(`${year}-${month}-01`),
          [Op.lte]: new Date(`${year}-${month}-31`),
        },
      },
    });

    const phones = paid.rows.map(payment => payment.phone);

    const debit = await User.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      attributes: ['id', 'name', 'phone'],
      order: [['name', 'asc']],
      where: {
        phone: {
          [Op.notIn]: phones,
        },
      },
      include: [
        {
          model: ClubPlayer,
          attributes: [
            'id',
            'user_id',
            'monthly_payment',
            'created_at',
            'position',
          ],
          where: {
            club_id: {
              [Op.eq]: user_request.club_id,
            },
          },
        },
      ],
    });

    const totalizers = await getTotalizers({ user_request, year, month });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(debit.count / pageSize),
      totalizers,
      data: debit.rows,
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

    const totalizers = await getTotalizers({ user_request, year, month });
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
      attributes: ['id', 'user_id', 'position'],
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
      position: findClubPlayer.position,
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
