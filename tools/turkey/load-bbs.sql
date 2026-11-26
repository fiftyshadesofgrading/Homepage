-- load-bbs.sql: load the USGS North American Breeding Bird Survey into PostGIS.
-- Source: 2026 Release, North American Breeding Bird Survey Dataset (1966-2025),
--         https://doi.org/10.5066/P144YU3S  (public domain)
--
-- Run it from the folder that holds Routes.csv, us-states.geojson and the unzipped States\ folder:
--   psql -h <host> -U <user> -d <database> -f load-bbs.sql
-- It creates (or rebuilds) one schema, bbs, and touches nothing else.
-- The user needs CREATE on the database. Loads ~7.5 million rows; give it a few minutes.

\set ON_ERROR_STOP on
CREATE EXTENSION IF NOT EXISTS postgis;
DROP SCHEMA IF EXISTS bbs CASCADE;
CREATE SCHEMA bbs;

-- 1. Routes: one row per survey route, with the start point as a geometry
CREATE TABLE bbs.routes (
  country_num int, state_num text, route text, route_name text, active int,
  latitude double precision, longitude double precision,
  stratum int, bcr int, route_type_id int, route_type_detail_id int
);
\copy bbs.routes FROM 'Routes.csv' WITH (FORMAT csv, HEADER true, ENCODING 'LATIN1')
ALTER TABLE bbs.routes ADD COLUMN route_id text GENERATED ALWAYS AS (country_num || '-' || state_num || '-' || route) STORED;
ALTER TABLE bbs.routes ADD COLUMN geom geometry(Point, 4326);
UPDATE bbs.routes SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
CREATE INDEX ON bbs.routes USING gist (geom);

-- 2. Counts: one row per route, year and species (only species that were seen)
CREATE TABLE bbs.counts (
  route_data_id bigint, country_num int, state_num text, route text, rpid int, year int, aou int,
  count10 int, count20 int, count30 int, count40 int, count50 int, stop_total int, species_total int
);
\copy bbs.counts FROM 'States/Alabama.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Alaska.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Alberta.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Arizona.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Arkansa.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/BritCol.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Califor.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Colorad.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Connect.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Delawar.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Florida.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Georgia.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Idaho.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Illinoi.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Indiana.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Iowa.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Kansas.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Kentuck.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Louisia.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Maine.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Manitob.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Marylan.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Massach.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Michiga.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Minneso.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Mississ.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Missour.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Montana.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NBrunsw.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NCaroli.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NDakota.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NHampsh.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NJersey.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NMexico.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NWTerri.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NYork.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Nebrask.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Nevada.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Newfoun.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/NovaSco.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Nunavut.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Ohio.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Oklahom.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Ontario.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Oregon.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/PEI.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Pennsyl.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Quebec.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/RhodeIs.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/SCaroli.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/SDakota.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Saskatc.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Tenness.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Texas.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Utah.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Vermont.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Virgini.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/W_Virgi.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Washing.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Wiscons.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Wyoming.csv' WITH (FORMAT csv, HEADER true)
\copy bbs.counts FROM 'States/Yukon.csv' WITH (FORMAT csv, HEADER true)
ALTER TABLE bbs.counts ADD COLUMN route_id text GENERATED ALWAYS AS (country_num || '-' || state_num || '-' || route) STORED;
CREATE INDEX ON bbs.counts (aou);
CREATE INDEX ON bbs.counts (route_id, year);

-- 3. US state outlines (from us-atlas), loaded from a one-line GeoJSON file
CREATE TEMP TABLE states_doc (doc jsonb);
\copy states_doc FROM 'us-states.geojson'
CREATE TABLE bbs.us_states AS
SELECT f->'properties'->>'fips' AS fips,
       f->'properties'->>'name' AS name,
       ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON(f->>'geometry'), 4326))::geometry(MultiPolygon, 4326) AS geom
FROM states_doc, jsonb_array_elements(doc->'features') AS f;
CREATE INDEX ON bbs.us_states USING gist (geom);

-- 4. The spatial join: which state is each route in? (point-in-polygon)
ALTER TABLE bbs.routes ADD COLUMN state_name text;
UPDATE bbs.routes r SET state_name = s.name FROM bbs.us_states s WHERE ST_Intersects(r.geom, s.geom);
-- A few routes start right on the coast, just outside the simplified outline: take the nearest state (KNN with <->)
UPDATE bbs.routes r SET state_name = (SELECT s.name FROM bbs.us_states s ORDER BY s.geom <-> r.geom LIMIT 1)
WHERE r.country_num = 840 AND r.state_name IS NULL;

-- 5. Survey effort: every standard run (RPID 101) of a route in a year, turkeys or not
CREATE TABLE bbs.runs AS
SELECT DISTINCT route_id, year FROM bbs.counts WHERE rpid = 101;
CREATE INDEX ON bbs.runs (route_id, year);

-- 6. Wild Turkey is AOU 3100 (see SpeciesList.csv). Zero-fill: a run with no turkey row saw 0 turkeys.
CREATE TABLE bbs.turkey_runs AS
SELECT ru.route_id, ru.year, COALESCE(c.species_total, 0) AS turkeys
FROM bbs.runs ru
LEFT JOIN bbs.counts c ON c.route_id = ru.route_id AND c.year = ru.year AND c.rpid = 101 AND c.aou = 3100;
CREATE INDEX ON bbs.turkey_runs (route_id, year);

ANALYZE;
SELECT (SELECT count(*) FROM bbs.routes) AS routes,
       (SELECT count(*) FROM bbs.counts) AS count_rows,
       (SELECT count(*) FROM bbs.runs) AS runs,
       (SELECT count(*) FROM bbs.turkey_runs WHERE turkeys > 0) AS runs_with_turkeys;
