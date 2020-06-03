import * as Yup from 'yup';
import Club from '../models/Club';

class ClubController {
  async index(req, res) {
    const { body } = req;

    const findOneData = await Club.findOne({
      where: { user_id: body.user_request.id },
    });

    if (!findOneData) {
      return res.status(404).json({ error: 'Nenhum clube configurado' });
    }

    return res.json(findOneData);
  }

  async store(req, res) {
    const {
      body: { user_request, ...body_request },
    } = req;

    const schema = Yup.object().shape({
      name: Yup.string().required('Nome da pelada é obrigatório'),
      time: Yup.string().required('Horário da pelada é obrigatório'),
      city: Yup.string().required('Cidade da pelada é obrigatório'),
      state: Yup.string().required('Estado da pelada é obrigatório'),
      logo_url: Yup.string(),
      day: Yup.string()
        .required('Email é obrigatório')
        .oneOf(
          [
            'SEGUNDA-FEIRA',
            'TERÇA-FEIRA',
            'QUARTA-FEIRA',
            'QUINTA-FEIRA',
            'SEXTA-FEIRA',
            'SÁBADO',
            'DOMINGO',
          ],
          'Dia é inválido'
        ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const ClubExists = await Club.findOne({
      where: { user_id: user_request.id },
    });

    if (ClubExists) {
      return res.status(400).json({
        error: 'Este Organizador já possui um clube',
      });
    }

    body_request.user_id = user_request.id;
    body_request.payment_module_view_type = 'ALL';

    const createdData = await Club.create(body_request);
    return res.json(createdData);
  }

  async update(req, res) {
    const {
      body: { user_request, ...body_request },
    } = req;

    const schema = Yup.object().shape({
      id: Yup.number().required('ID da pelada é obrigatório'),
      name: Yup.string().required('Nome da pelada é obrigatório'),
      time: Yup.string().required('Horário da pelada é obrigatório'),
      city: Yup.string().required('Cidade da pelada é obrigatório'),
      state: Yup.string().required('Estado da pelada é obrigatório'),
      logo_url: Yup.string(),
      payment_module_view_type: Yup.string()
        .required('Tipo de Visualização do módulo de pagamentos é obrigatório')
        .oneOf(['ALL', 'INDIVIDUAL'], 'Tipo de Visualização é inválido'),
      day: Yup.string()
        .required('Dia é obrigatório')
        .oneOf(
          [
            'SEGUNDA-FEIRA',
            'TERÇA-FEIRA',
            'QUARTA-FEIRA',
            'QUINTA-FEIRA',
            'SEXTA-FEIRA',
            'SÁBADO',
            'DOMINGO',
          ],
          'Dia é inválido'
        ),
    });

    const validate = await schema.validate(body_request).catch(err => {
      return err.message ? { error: err.message } : {};
    });

    if (validate.error) {
      return res.status(400).json({ error: validate.error });
    }

    const findResponse = await Club.findByPk(body_request.id);

    if (!findResponse) {
      return res.status(400).json({
        error: 'Clube não encontrado',
      });
    }

    if (findResponse.user_id !== user_request.id) {
      return res.status(401).json({
        error: 'Você não possui permissão para editar este clube',
      });
    }

    if (findResponse.user_id !== user_request.id) {
      return res.status(401).json({
        error: 'Você não possui permissão para editar este clube',
      });
    }

    const updatedData = await findResponse.update({
      id: body_request.id,
      day: body_request.day,
      name: body_request.name,
      time: body_request.time,
      city: body_request.city,
      state: body_request.state,
      logo_url: body_request.logo_url,
      payment_module_view_type: body_request.payment_module_view_type,
    });
    return res.json(updatedData);
  }

  async delete(req, res) {
    const { id } = req.params;
    await Club.destroy({
      where: {
        id,
      },
    });
    return res.status(200).json({});
  }
}

export default new ClubController();
