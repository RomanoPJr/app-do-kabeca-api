import Sequelize, { Op } from 'sequelize';
import databaseConfig from '../../config/database';
import User from '../models/User';
import ClubPlayer from '../models/ClubPlayer';
import MonthlyPayment from '../models/MonthlyPayment';

class ReportController {
  async artilharia(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      body: { user_request },
      query: { pageNumber, pageSize, dateStart, dateEnd },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    let query = `
      select
        users.name,
        user_id,
        matches_events.club_id,
        matches_events.type,
        count(*) as qtd_gols
      from matches_events
      join users on matches_events.user_id = users.id
      left join matches on matches_events.match_id = matches.id
      where matches_events.type = 'GOL'
      and matches_events.club_id = ${club_id}
      and matches.score_type = 'RANKEADA'
      and matches.date between '${dateStart}' and '${dateEnd}'
      group by user_id, matches_events.club_id, matches_events.type, users.name
      order by qtd_gols desc
    `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    return res.json({
      data: results,
    });
  }

  async jogadores(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      query: { pageNumber, pageSize },
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    let query = `
        select
          name,
          position,
          monthly_payment,
          phone,
          type,
          case
            when email is null then ''
            else email
          end as email,
          case
            when club_players.created_at is null then ''
            else TO_CHAR(club_players.created_at :: DATE, 'dd/mm/yyyy')
          end as created_at,
          case
            when birth_date is null then ''
            else TO_CHAR(birth_date :: DATE, 'dd/mm/yyyy')
          end as birth_date
        from
          club_players
        inner join users on
          club_players.user_id = users.id
        where
          club_players.club_id = ${club_id}
        order by
          name asc
      `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;

      const response = await conexao.query(query);
      const [results] = response;
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    return res.json({
      data: results,
    });
  }

  async financeiro(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      query: { pageNumber, pageSize, dateStart, dateEnd },
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    let query = `
        select
          name,
          due_value,
          paid_value
        from
          monthly_payments mp
        where club_id = ${club_id}
        and referent between '${dateStart}' and '${dateEnd}'
      `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }

    const listDebit = async (dateStart, dateEnd, club_id) => {
      const paid = await MonthlyPayment.findAndCountAll({
        where: {
          club_id,
          referent: {
            [Op.gte]: new Date(dateStart),
            [Op.lte]: new Date(dateEnd),
          },
        },
      });

      const phones = paid.rows.map(payment => payment.phone);

      const debit = await User.findAndCountAll({
        raw: true,
        nest: true,
        order: [['name', 'asc']],
        where: {
          phone: {
            [Op.notIn]: phones,
          },
        },
        include: [
          {
            model: ClubPlayer,
            attributes: ['id', 'user_id', 'monthly_payment', 'created_at', 'position'],
            where: {
              club_id: {
                [Op.eq]: club_id,
              },
              created_at: {
                [Op.lte]: new Date(dateEnd),
              },
            },
          },
        ],
      });

      return debit.rows;
    };

    const debit = await listDebit(dateStart, dateEnd, club_id);

    const formatedDebit = debit.map(x => {
      if (x.ClubPlayers) {
        return {
          ...x,
          due_value: x.ClubPlayers.monthly_payment,
          paid_value: '0.00',
        };
      }
    });

    const [results] = await conexao.query(query);
    return res.json({
      data: [...results, ...formatedDebit],
    });
  }

  async aniversario(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      query: { pageNumber, pageSize, dateStart, dateEnd },
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    const monthStart = dateStart.split('-')[1];
    const monthEnd = dateEnd.split('-')[1];

    let query = `
        select
          users.name,
          users.birth_date,
          TO_CHAR(birth_date :: DATE, 'dd/mm') date
        from club_players cp
        join users on users.id = cp.user_id
        where cp.club_id = ${club_id}
        and EXTRACT(month FROM users.birth_date) between '${monthStart}' and '${monthEnd}'
        order by users.birth_date asc
      `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;

      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    return res.json({
      data: results,
    });
  }

  async pontuacaoGeral(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      query: { pageNumber, pageSize, dateStart, dateEnd },
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    let query = `
      select
        user_id,
        name,
        position,
        coalesce(( select count(*) from ( select user_id from matches_escalations join matches on matches.id = matches_escalations.match_id where matches.club_id = ${club_id} and matches.date between '${dateStart}' and '${dateEnd}' group by user_id, match_id order by user_id ) as table1 where cp.user_id = table1.user_id group by user_id ), 0) as qtd_jogos,
        (
            (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = me2.team::text and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'VITORIA'))
          + (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'EMPATE'))
          + (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor != me2.team::text and vencedor != 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'DERROTA'))
          + (coalesce((select sum(me.value) from matches_events me inner join matches on matches.id = me.match_id where matches.club_id = ${club_id} and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.user_id = me.user_id group by user_id ), 0))
        ) as total_pontos,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = me2.team::text and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as vitorias,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as empates,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor != me2.team::text and vencedor != 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as derrotas,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 1' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_1,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 2' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_2,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 3' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_3,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 4' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_4,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 5' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_5
      from
        club_players cp
      inner join users on
        cp.user_id = users.id
      where
        cp.club_id = ${club_id}
      order by
        total_pontos desc
    `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);

      results.map(x => {
        x.total_pontos = x.total_pontos && x.total_pontos !== null ? parseFloat(x.total_pontos, 10).toFixed(2) : '0.00';
      });

      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    results.map(x => {
      x.total_pontos = x.total_pontos && x.total_pontos !== null ? parseFloat(x.total_pontos, 10).toFixed(2) : '0.00';
    });

    return res.json({
      data: results,
    });
  }

  async pontuacaoGeralPorPontuacao(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const {
      headers,
      query: { pageNumber, pageSize, dateStart, dateEnd, position },
      body: { user_request },
    } = req;

    let club_id = null;

    if (headers.club_id) {
      club_id = headers.club_id;
    } else {
      club_id = user_request.club_id;
    }

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    let query = `
      select
        user_id,
        name,
        position,
        coalesce(( select count(*) from ( select user_id from matches_escalations join matches on matches.id = matches_escalations.match_id where matches.club_id = ${club_id} and matches.date between '${dateStart}' and '${dateEnd}' group by user_id, match_id order by user_id ) as table1 where cp.user_id = table1.user_id group by user_id ), 0) as qtd_jogos,
        (
            (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = me2.team::text and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'VITORIA'))
          + (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'EMPATE'))
          + (coalesce((select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor != me2.team::text and vencedor != 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id),0) * (select value / 100 from events where club_id = ${club_id} and description = 'DERROTA'))
          + (coalesce((select sum(me.value) from matches_events me inner join matches on matches.id = me.match_id where matches.club_id = ${club_id} and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.user_id = me.user_id group by user_id ), 0))
        ) as total_pontos,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = me2.team::text and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as vitorias,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor = 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as empates,
        coalesce(( select count(*) from view_vencedores_por_partida join matches on matches.id = view_vencedores_por_partida.id join ( select distinct on (me2.match_id) * from matches_escalations me2 where cp.user_id = me2.user_id ) as me2 on me2.match_id = view_vencedores_por_partida.id where matches.club_id = ${club_id} and vencedor != me2.team::text and vencedor != 'EMPATE' and matches.date between '${dateStart}' and '${dateEnd}' group by user_id ), 0) as derrotas,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 1' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_1,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 2' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_2,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 3' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_3,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 4' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_4,
        coalesce(( select count(*) from matches_events me2 join matches on me2.match_id = matches.id where cp.user_id = me2.user_id and me2.type = 'EVENTO 5' and matches.score_type = 'RANKEADA' and matches.date between '${dateStart}' and '${dateEnd}' and cp.club_id = ${club_id} group by user_id ), 0) as evento_5
      from
        club_players cp
      inner join users on
        cp.user_id = users.id
      where
        cp.club_id = ${club_id}
        and cp.position = '${position}'
      order by
        total_pontos desc
    `;

    let responseCount = await conexao.query(query);
    responseCount = responseCount[0].length;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);

      results.map(x => {
        x.total_pontos = x.total_pontos && x.total_pontos !== null ? parseFloat(x.total_pontos, 10).toFixed(2) : '0.00';
      });

      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(responseCount / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);

    results.map(x => {
      x.total_pontos = x.total_pontos && x.total_pontos !== null ? parseFloat(x.total_pontos, 10).toFixed(2) : '0.00';
    });

    return res.json({
      data: results,
    });
  }
}

export default new ReportController();
