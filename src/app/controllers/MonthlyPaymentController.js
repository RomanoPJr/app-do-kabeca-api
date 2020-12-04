import * as Yup from 'yup';

import { Op } from 'sequelize';
import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';
import Club from '../models/Club';

const getTotalizers = async ({ club_id, startDate, endDate }) => {
  const data = await MonthlyPayment.findAll({
    include: [
      {
        model: ClubPlayer,
        where: {
          club_id: {
            [Op.eq]: club_id,
          },
        },
      },
    ],
    where: {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lt]: endDate,
      },
    },
  });

  const totals = data.reduce(
    (accumulator, payment) => {
      return {
        due_total: accumulator.due_total + Number(payment.due_value),
        paid_total: accumulator.paid_total + Number(payment.paid_value),
      };
    },
    {
      due_total: 0,
      paid_total: 0,
    }
  );

  return {
    totalReceivable: totals.due_total,
    totalReceived: totals.paid_total,
    totalDue: totals.due_total - totals.paid_total,
  };
};
class MonthlyPaymentController {
  async listPaid(req, res) {
    const {
      headers,
      body: { user_request },
      query: { pageSize = 10, pageNumber = 0, year = new Date().getFullYear(), month = new Date().getMonth() + 1 },
    } = req;

    let club_id = null;
    const filterByUser = {};

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    if (headers.club_id) {
      club_id = headers.club_id;

      const club = await Club.findOne({
        raw: true,
        nest: true,
        where: { id: club_id },
      });
      if (club && club.payment_module_view_type !== 'ALL') {
        filterByUser.id = user_request.id;
      }
    } else {
      club_id = user_request.club_id;
    }

    const data = await MonthlyPayment.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      where: {
        referent: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      include: [
        {
          model: ClubPlayer,
          where: {
            club_id: {
              [Op.eq]: club_id,
            },
            created_at: {
              [Op.lt]: endDate,
            },
          },
          include: [
            {
              model: User,
              where: filterByUser,
            },
          ],
        },
      ],
      order: [['name', 'asc']],
    });

    const totalizers = await getTotalizers({ club_id, startDate, endDate });

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(data.count / pageSize),
      totalizers,
      data: data.rows,
    });
  }

  async listDebit(req, res) {
    const {
      headers,
      body: { user_request },
      query: { pageSize = 10, pageNumber = 0, year = new Date().getFullYear(), month = new Date().getMonth() + 1 },
    } = req;

    let club_id = null;
    const filterByUser = {};

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    if (headers.club_id) {
      club_id = headers.club_id;

      const club = await Club.findOne({
        raw: true,
        nest: true,
        where: { id: club_id },
      });

      if (club && club.payment_module_view_type !== 'ALL') {
        filterByUser.id = user_request.id;
      }
    } else {
      club_id = user_request.club_id;
    }

    const data = await MonthlyPayment.findAndCountAll({
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      order: [['name', 'asc']],
      where: {
        referent: null,
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      include: [
        {
          model: ClubPlayer,
          where: {
            club_id: {
              [Op.eq]: club_id,
            },
            created_at: {
              [Op.lt]: endDate,
            },
          },
          include: [
            {
              model: User,
              where: filterByUser,
            },
          ],
        },
      ],
    });

    const totalizers = await getTotalizers({ club_id, startDate, endDate });
    let hasPaid;
    if (data.count === 0) {
      hasPaid = await MonthlyPayment.count({
        raw: true,
        nest: true,
        where: {
          referent: {
            [Op.gte]: startDate,
            [Op.lt]: endDate,
          },
        },
        include: [
          {
            model: ClubPlayer,
            where: {
              club_id: {
                [Op.eq]: club_id,
              },
              created_at: {
                [Op.lt]: endDate,
              },
            },
            include: [
              {
                model: User,
                where: filterByUser,
              },
            ],
          },
        ],
      });
    }

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(data.count / pageSize),
      totalizers,
      data: data.count === 0 && hasPaid > 0 ? false : data.rows,
    });
  }

  async storeAll(req, res) {
    const { month, year } = req.query;
    const { user_request } = req.body;

    const findClubPlayer = await ClubPlayer.findAll({
      raw: true,
      nest: true,
      where: {
        club_id: user_request.club_id,
      },
      include: [
        {
          model: User,
        },
      ],
    });

    const dues = findClubPlayer.map(i => {
      return {
        due_value: i.monthly_payment,
        paid_value: 0,
        player_id: i.id,
        club_id: i.club_id,
        name: i.User.name,
        createdAt: new Date(year, month - 1, 1),
        phone: i.User.phone,
      };
    });

    await MonthlyPayment.bulkCreate(dues);

    return res.json({});
  }

  async storeNonPaying(req, res) {
    const { user_request } = req.body;
    const { year, month } = req.query;

    const endDate = new Date(year, month, 1);

    if (!year || !month) {
      return res.status(400).json({ message: 'Informe o mês e o Ano' });
    }

    const debit = await MonthlyPayment.findAll({
      raw: true,
      nest: true,
      where: {
        referent: null,
      },
      include: [
        {
          model: ClubPlayer,
          where: {
            club_id: {
              [Op.eq]: user_request.club_id,
            },
            created_at: {
              [Op.lt]: endDate,
            },
            monthly_payment: 0,
          },
        },
      ],
    });

    const payments = debit.map(item => item.id);

    const responseB = await MonthlyPayment.update(
      {
        referent: `${year}-${month}-01`,
      },
      {
        where: {
          id: {
            [Op.in]: payments,
          },
        },
      }
    );

    return res.json(responseB);
  }

  async update(req, res) {
    const body_request = req.body;

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

    const { due_value, paid_value, year, month } = body_request;

    const updatePayment = {
      due_value,
      paid_value,
    };

    if (year && month) {
      updatePayment.referent = new Date(body_request.year, body_request.month - 1, 1);
    }

    const updatedPayment = await findPayment.update(updatePayment);

    return res.json(updatedPayment);
  }
}

export default new MonthlyPaymentController();
