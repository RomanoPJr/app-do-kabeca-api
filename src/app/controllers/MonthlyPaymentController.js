import * as Yup from 'yup';

import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';

class MonthlyPaymentController {
  async index(req, res) {
    const { pageSize = 10, pageNumber = 1 } = req.query;
    const { user_request } = req.body;

    const dataCount = await MonthlyPayment.count({
      where: { club_id: user_request.club_id },
    });

    const dataFindAll = await MonthlyPayment.findAll({
      where: { club_id: user_request.club_id },
      offset: (pageNumber - 1) * pageSize,
      limit: pageSize,
      attributes: ['id', 'value', 'referent', 'user_id'],
      order: [['id', 'asc']],
      include: [
        {
          model: User,
          attributes: ['name', 'type', 'phone'],
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

    const schema = Yup.object().shape({
      club_player_id: Yup.string().required('Nenhum jogador foi informado'),
      value: Yup.number().required('Valor é obrigatório'),
      referent: Yup.date('Referência é inválida').required(
        'Referente à é obrigatório'
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
    const { user_request, ...body_request } = req.body;
    const { club_id } = user_request;

    const schema = Yup.object().shape({
      club_player_id: Yup.string().required('Nenhum Jogador Informado'),
      value: Yup.number().required('Valor é obrigatório'),
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
