CREATE DATABASE cuadratic;
CREATE DATABASE cuadratic_cvr;
CREATE DATABASE cuadratic_cdb;

\c cuadratic;

CREATE TABLE "boards" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "description" VARCHAR NOT NULL
);

CREATE TABLE "members" (
  "id" VARCHAR PRIMARY KEY,
  "boardId" VARCHAR REFERENCES "boards"(id),
  "userId" INT
);

CREATE TABLE "categories" (
  "id" VARCHAR PRIMARY KEY,
  "boardId" VARCHAR REFERENCES "boards"(id),
  "name" VARCHAR NOT NULL,
  "sort_order" int NOT NULL,
  "color" VARCHAR NOT NULL
);

CREATE TYPE status_enum AS ENUM ('TODO', 'NEXT', 'IN_PROGRESS', 'BLOCKED', 'DONE');

CREATE TABLE "tickets" (
  "id" VARCHAR PRIMARY KEY,
  "shortId" SERIAL,
  "boardId" VARCHAR REFERENCES "boards"(id),
  "senderId" INT NOT NULL,
  "assigneeId" INT,
  "categoryId" VARCHAR REFERENCES "categories"(id),
  "status" status_enum DEFAULT 'TODO',
  "title" VARCHAR NOT NULL,
  "body" VARCHAR,
  "dueDate" TIMESTAMP,
  "priority" INT NOT NULL DEFAULT -1,
  "timestamp" TIMESTAMP not null default now(),
  "sortOrder" FLOAT NOT NULL
);

-- TODO: Add seed data
INSERT INTO "boards" (id, name, description) VALUES ('1', 'Zero Sync Board', 'First board for testing');

INSERT INTO "categories" (id, "boardId", name, sort_order, color) VALUES ('1', 1, 'Bug', 1.0, '#000000');
INSERT INTO "categories" (id, "boardId", name, sort_order, color) VALUES ('2', 1, 'Feature', 2.0, '#000000');
INSERT INTO "categories" (id, "boardId", name, sort_order, color) VALUES ('3', 1, 'Idea', 3.0, '#000000');

INSERT INTO "members" (id, "boardId", "userId") VALUES ('1', 1, 1);
INSERT INTO "members" (id, "boardId", "userId") VALUES ('2', 1, 2);
INSERT INTO "members" (id, "boardId", "userId") VALUES ('3', 1, 3);
INSERT INTO "members" (id, "boardId", "userId") VALUES ('4', 1, 4);

INSERT INTO "tickets" (id, "boardId", "senderId", "categoryId", title, timestamp, "sortOrder") VALUES ('1', 1, 1, 1, 'First ticket', '2025-01-01 00:00:00', 1);
INSERT INTO "tickets" (id, "boardId", "senderId", "categoryId", title, timestamp, "sortOrder") VALUES ('2', 1, 2, 2, 'Second ticket', '2025-01-02 00:00:00', 2);
INSERT INTO "tickets" (id, "boardId", "senderId", "categoryId", title, timestamp, "sortOrder") VALUES ('3', 1, 3, 3, 'Third ticket', '2025-01-03 00:00:00', 3);
INSERT INTO "tickets" (id, "boardId", "senderId", "categoryId", title, timestamp, "sortOrder") VALUES ('4', 1, 4, 1, 'Fourth ticket', '2025-01-04 00:00:00', 4);


