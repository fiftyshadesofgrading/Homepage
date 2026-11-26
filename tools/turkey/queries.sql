-- queries.sql: the summaries behind the Wild Turkey post. Run after load-bbs.sql:
--   psql -h <host> -U <user> -d <database> -f queries.sql
-- Writes three CSVs into the current folder for build-turkey.mjs.

\set ON_ERROR_STOP on

-- Every year: how many US routes were run, and how often turkeys turned up
CREATE OR REPLACE VIEW bbs.turkey_us_yearly AS
SELECT t.year,
       count(*)                                         AS routes_run,
       count(*) FILTER (WHERE t.turkeys > 0)            AS routes_with_turkeys,
       round(100.0 * avg((t.turkeys > 0)::int), 1)      AS pct_routes_with_turkeys,
       round(avg(t.turkeys), 2)                         AS turkeys_per_route
FROM bbs.turkey_runs t
JOIN bbs.routes r USING (route_id)
WHERE r.country_num = 840
GROUP BY t.year;

-- Every US route, every decade it was run: average turkeys counted per run
CREATE OR REPLACE VIEW bbs.turkey_route_decade AS
SELECT r.route_id, r.route_name, r.state_name,
       round(r.latitude::numeric, 4) AS latitude, round(r.longitude::numeric, 4) AS longitude,
       (t.year / 10) * 10            AS decade,
       count(*)                      AS runs,
       round(avg(t.turkeys), 2)      AS turkeys_per_run
FROM bbs.turkey_runs t
JOIN bbs.routes r USING (route_id)
WHERE r.country_num = 840
GROUP BY r.route_id, r.route_name, r.state_name, r.latitude, r.longitude, (t.year / 10) * 10;

-- Each state, then and now: share of routes with turkeys in the 1970s vs 2015-2025
CREATE OR REPLACE VIEW bbs.turkey_state_change AS
SELECT r.state_name,
       round(100.0 * avg((t.turkeys > 0)::int) FILTER (WHERE t.year BETWEEN 1970 AND 1979), 1) AS pct_1970s,
       round(100.0 * avg((t.turkeys > 0)::int) FILTER (WHERE t.year >= 2015), 1)              AS pct_recent,
       count(DISTINCT t.route_id) FILTER (WHERE t.year >= 2015)                               AS routes_recent
FROM bbs.turkey_runs t
JOIN bbs.routes r USING (route_id)
WHERE r.country_num = 840 AND r.state_name IS NOT NULL
GROUP BY r.state_name;

\copy (SELECT * FROM bbs.turkey_us_yearly ORDER BY year) TO 'turkey_us_yearly.csv' WITH (FORMAT csv, HEADER true)
\copy (SELECT * FROM bbs.turkey_route_decade ORDER BY route_id, decade) TO 'turkey_route_decade.csv' WITH (FORMAT csv, HEADER true)
\copy (SELECT * FROM bbs.turkey_state_change ORDER BY state_name) TO 'turkey_state_change.csv' WITH (FORMAT csv, HEADER true)
\copy (SELECT r.route_id, r.country_num, r.state_name, r.route_name, round(r.latitude::numeric,4) AS latitude, round(r.longitude::numeric,4) AS longitude, t.year, t.turkeys FROM bbs.turkey_runs t JOIN bbs.routes r USING (route_id) ORDER BY 1, 7) TO 'turkey_runs.csv' WITH (FORMAT csv, HEADER true)
