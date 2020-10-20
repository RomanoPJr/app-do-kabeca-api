import Sequelize from 'sequelize';
import databaseConfig from '../../config/database';

class ReportController {
  async artilharia(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const { user_request } = req.body;
    const { pageNumber, pageSize, dateStart, dateEnd } = req.query;

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
        and matches_events.club_id = ${user_request.club_id}
        and matches.score_type = 'RANKEADA'
        and matches.date between '${dateStart}' and '${dateEnd}'
        group by user_id, matches_events.club_id, matches_events.type, users.name
        order by qtd_gols desc
      `;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(results.length / pageSize),
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
    const { user_request } = req.body;
    const { pageNumber, pageSize } = req.query;

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
          club_players.club_id = ${user_request.club_id}
        order by
          name asc
      `;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(results.length / pageSize),
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
    const { user_request } = req.body;
    const { pageNumber, pageSize, dateStart, dateEnd } = req.query;

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
        where club_id = ${user_request.club_id}
        and referent between '${dateStart}' and '${dateEnd}'
      `;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(results.length / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    return res.json({
      data: results,
    });
  }

  async aniversario(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const { user_request } = req.body;
    const { pageNumber, pageSize, dateStart, dateEnd } = req.query;

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
        where cp.club_id = ${user_request.club_id}
        and EXTRACT(month FROM users.birth_date) between '${monthStart}' and '${monthEnd}'
        order by users.birth_date asc
      `;

    if (pageNumber && pageSize) {
      query += `
        offset ${(pageNumber - 1) * pageSize}
        limit ${pageSize}
      `;
      const [results] = await conexao.query(query);
      return res.json({
        pageSize,
        pageNumber,
        pageTotal: Math.ceil(results.length / pageSize),
        data: results,
      });
    }
    const [results] = await conexao.query(query);
    return res.json({
      data: results,
    });
  }
}

export default new ReportController();
