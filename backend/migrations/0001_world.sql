-- Majakka cooperative world (D1). No player GPS, home address or routes.
-- Deliberately separate from any other user's business databases.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  balance INTEGER NOT NULL DEFAULT 6 CHECK (balance >= 0 AND balance <= 20),
  earned_day TEXT NOT NULL DEFAULT '',
  earned_today INTEGER NOT NULL DEFAULT 0 CHECK (earned_today >= 0 AND earned_today <= 36),
  channel_at INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS world_nodes (
  node_id TEXT PRIMARY KEY NOT NULL,
  archetype TEXT NOT NULL CHECK (archetype IN ('art','history','nature','culture')),
  charge INTEGER NOT NULL DEFAULT 0 CHECK (charge BETWEEN 0 AND 2),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TABLE IF NOT EXISTS operations (
  operation_id TEXT PRIMARY KEY NOT NULL,
  player_id TEXT NOT NULL REFERENCES players(id),
  kind TEXT NOT NULL CHECK (kind IN ('attune','channel')),
  node_id TEXT REFERENCES world_nodes(node_id),
  applied INTEGER NOT NULL DEFAULT 0 CHECK (applied IN (0,1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  CHECK ((kind='attune' AND node_id IS NOT NULL) OR (kind='channel' AND node_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS one_attune_per_player_node
  ON operations(player_id,node_id) WHERE kind='attune';
CREATE INDEX IF NOT EXISTS operations_by_node ON operations(node_id,created_at);
