// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import { ANYONE_CAN, createSchema, createTableSchema, definePermissions, Row, Zero } from "@rocicorp/zero";
import { AuthData } from "node_modules/@rocicorp/zero/out/zero-client/src/client/replicache-types";

const boardSchema = createTableSchema({
  tableName: "boards",
  columns: {
    id: "string",
    name: "string",
    description: "string",
  },
  primaryKey: "id",
});

const memberSchema = createTableSchema({
  tableName: "members",
  columns: {
    id: "string",
    boardId: "string",
    userId: "number",
  },
  primaryKey: "id",
  relationships: {
    board: {
      sourceField: "boardId",
      destSchema: boardSchema,
      destField: "id",
    },
  },
});

const stateSchema = createTableSchema({
  tableName: "states",
  columns: {
    id: "string",
    boardId: "string",
    name: "string",
    order: "number",
  },
  primaryKey: "id",
  relationships: {
    board: {
      sourceField: "boardId",
      destSchema: boardSchema,
      destField: "id",
    },
  },
});

const ticketSchema = createTableSchema({
  tableName: "tickets",
  columns: {
    id: "string",
    boardId: "string",
    senderId: "number",
    stateId: "string",
    body: "string",
    timestamp: "number",
  },
  primaryKey: "id",
  relationships: {
    board: {
      sourceField: "boardId",
      destSchema: boardSchema,
      destField: "id",
    },
    state: {
      sourceField: "stateId",
      destSchema: stateSchema,
      destField: "id",
    },
  },
});

export const schema = createSchema({
  version: 1,
  tables: {
    boards: boardSchema,
    members: memberSchema,
    states: stateSchema,
    tickets: ticketSchema,
  },
});

export type Schema = typeof schema;
export type Board = Row<typeof boardSchema>;
export type Member = Row<typeof memberSchema>;
export type State = Row<typeof stateSchema>;
export type Ticket = Row<typeof ticketSchema>;

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  // const allowIfLoggedIn = (authData: AuthData, { cmpLit }: ExpressionBuilder<TableSchema>) =>
  //   cmpLit(authData.sub, "IS NOT", null);

  // const allowIfMessageSender = (authData: AuthData, { cmp }: ExpressionBuilder<typeof messageSchema>) =>
  //   cmp("senderID", "=", authData.sub ?? "");

  return {
    boards: { row: ANYONE_CAN },
    members: { row: ANYONE_CAN },
    states: { row: ANYONE_CAN },
    tickets: { row: ANYONE_CAN },
  };
});
