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

    let query = `
        select
          users.name,
          users.birth_date,
          TO_CHAR(birth_date :: DATE, 'dd/mm') date
        from club_players cp
        join users on users.id = cp.user_id
        where cp.club_id = ${user_request.club_id}
        and EXTRACT(month FROM users.birth_date) between '${dateStart}' and '${dateEnd}'
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

  async pontuacaoGeral(req, res) {
    const conexao = new Sequelize(databaseConfig);
    const { user_request } = req.body;
    const { pageNumber, pageSize, dateStart, dateEnd } = req.query;

    if (!dateStart || !dateEnd) {
      return res.status(400).json({
        error: 'Informe data de início e fim',
      });
    }

    let query = `
      SELECT user_id,
        name,
        POSITION,
        COALESCE((
          SELECT count(*)
          FROM
            (
              SELECT user_id
              FROM matches_escalations
              JOIN matches ON matches.id = matches_escalations.match_id
              WHERE matches.club_id = ${user_request.club_id}
                AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
              GROUP BY user_id, match_id
              ORDER BY user_id
            ) AS table1
          WHERE cp.user_id = table1.user_id
          GROUP BY user_id
        ),0) AS qtd_jogos,
        COALESCE((
          SELECT sum(me.value) AS total_pontos
          FROM matches_events me
          INNER JOIN matches ON matches.id = me.match_id
          WHERE matches.club_id = ${user_request.club_id}
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.user_id = me.user_id
          GROUP BY user_id
        ),0) AS total_pontos,
        COALESCE((
          SELECT count(*)
          FROM view_vencedores_por_partida
          JOIN matches ON matches.id = view_vencedores_por_partida.id
          JOIN (
            SELECT DISTINCT ON (me2.match_id) *
            FROM matches_escalations me2
            WHERE cp.user_id = me2.user_id
          ) AS me2 ON me2.match_id = view_vencedores_por_partida.id
          WHERE matches.club_id = ${user_request.club_id}
            AND vencedor = me2.team::text
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
          GROUP BY vencedor
        ),0) AS vitorias,
        COALESCE((
          SELECT count(*)
          FROM view_vencedores_por_partida
          JOIN matches ON matches.id = view_vencedores_por_partida.id
          JOIN (
            SELECT DISTINCT ON (me2.match_id) *
            FROM matches_escalations me2
            WHERE cp.user_id = me2.user_id
          ) AS me2 ON me2.match_id = view_vencedores_por_partida.id
          WHERE matches.club_id = ${user_request.club_id}
            AND vencedor = 'EMPATE'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
          GROUP BY vencedor
        ),0) AS empates,
        COALESCE((
          SELECT count(*)
          FROM view_vencedores_por_partida
          JOIN matches ON matches.id = view_vencedores_por_partida.id
          JOIN (
            SELECT DISTINCT ON (me2.match_id) *
            FROM matches_escalations me2
            WHERE cp.user_id = me2.user_id
          ) AS me2 ON me2.match_id = view_vencedores_por_partida.id
          WHERE matches.club_id = ${user_request.club_id}
            AND vencedor != me2.team::text
            AND vencedor != 'EMPATE'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
          GROUP BY vencedor
        ),0) AS derrotas,
        COALESCE((
          SELECT count(*)
          FROM matches_events me2
          JOIN matches ON me2.match_id = matches.id
          WHERE cp.user_id = me2.user_id
            AND me2.type = 'EVENTO 1'
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.club_id = ${user_request.club_id}
          GROUP BY user_id
        ),0) AS evento_1,
        COALESCE((
          SELECT count(*)
          FROM matches_events me2
          JOIN matches ON me2.match_id = matches.id
          WHERE cp.user_id = me2.user_id
            AND me2.type = 'EVENTO 2'
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.club_id = ${user_request.club_id}
          GROUP BY user_id
        ),0) AS evento_2,
        COALESCE((
          SELECT count(*)
          FROM matches_events me2
          JOIN matches ON me2.match_id = matches.id
          WHERE cp.user_id = me2.user_id
            AND me2.type = 'EVENTO 3'
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.club_id = ${user_request.club_id}
          GROUP BY user_id
        ),0) AS evento_3,
        COALESCE((
          SELECT count(*)
          FROM matches_events me2
          JOIN matches ON me2.match_id = matches.id
          WHERE cp.user_id = me2.user_id
            AND me2.type = 'EVENTO 4'
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.club_id = ${user_request.club_id}
          GROUP BY user_id
        ),0) AS evento_4,
        COALESCE((
          SELECT count(*)
          FROM matches_events me2
          JOIN matches ON me2.match_id = matches.id
          WHERE cp.user_id = me2.user_id
            AND me2.type = 'EVENTO 5'
            AND matches.score_type = 'RANKEADA'
            AND matches.date BETWEEN '${dateStart}' and '${dateEnd}'
            AND cp.club_id = ${user_request.club_id}
          GROUP BY user_id
        ),0) AS evento_5
      FROM club_players cp
      INNER JOIN users ON cp.user_id = users.id
      WHERE cp.club_id = ${user_request.club_id}
      ORDER BY total_pontos DESC
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
