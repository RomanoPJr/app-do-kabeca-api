import * as Yup from 'yup';

import { Op } from 'sequelize';
import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';

class MonthlyPaymentController {
  async index(req, res) {
    const {
      year = new Date().getFullYear(),
      month = new Date().getMonth() + 1,
      pageSize = 10,
      pageNumber = 1,
    } = req.query;
    const { user_request } = req.body;

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

    let totalReceivable = 0;
    rows.map(({ dataValues: { monthly_payment, MonthlyPayments } }) => {
      if (MonthlyPayments.length > 0) {
        totalReceivable += MonthlyPayments[0].due_value;
      } else {
        totalReceivable += monthly_payment;
      }
    });

    const totalReceived = rows.reduce(
      (a, b) =>
        a +
        (b.MonthlyPayments.length > 0 && b.MonthlyPayments[0].paid_value
          ? b.MonthlyPayments[0].paid_value
          : 0),
      0
    );

    const totalDue = totalReceivable - totalReceived;

    return res.json({
      pageSize,
      pageNumber,
      pageTotal: Math.ceil(count / pageSize),
      data: rows,
      totalizers: {
        totalReceivable,
        totalReceived,
        totalDue,
      },
    });
  }

  async store(req, res) {
    const { user_request, ...body_request } = req.body;
    const { club_id } = user_request;

    const schema = Yup.object().shape({
      club_player_id: Yup.string().required('Nenhum jogador foi informado'),
      due_value: Yup.number().required('Valor a pagar'),
      paid_value: Yup.number().required('Valor pago'),
      referent: Yup.date('Data de Referência é inválida').required(
        'Data de Referência é obrigatória'
      ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.errors ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findClubPlayer = await ClubPlayer.findOne({
      club_id,
      club_player_id: body_request.club_player_id,
    });

    if (!findClubPlayer) {
      return res.status(400).json({
        error: 'Jogador não pertence ao seu clube',
      });
    }

    await MonthlyPayment.create(body_request);
    return res.json({ message: 'Success' });
  }

  async update(req, res) {
    const { ...body_request } = req.body;

    const schema = Yup.object().shape({
      club_player_id: Yup.string().required('Nenhum Jogador Informado'),
      due_value: Yup.number().required('Valor a pagar'),
      paid_value: Yup.number().required('Valor pago'),
      referent: Yup.date('Referência é inválida').required(
        'Referente é obrigatório'
      ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findPayment = await MonthlyPayment.findOne({
      where: {
        id: body_request.id,
        club_player_id: body_request.club_player_id,
      },
    });

    if (!findPayment) {
      return res.status(400).json({
        error: 'Pagamento não encontrado',
      });
    }

    const { value, referent } = body_request;
    await findPayment.update({
      value,
      referent,
    });

    return res.json({ message: 'Registro Atualizado com sucesso!' });
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
