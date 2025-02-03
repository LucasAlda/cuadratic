// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  ANYONE_CAN,
  createSchema,
  table,
  definePermissions,
  Row,
  string,
  relationships,
  number,
  enumeration,
} from "@rocicorp/zero";
import { AuthData } from "node_modules/@rocicorp/zero/out/zero-client/src/client/replicache-types";

const board = table("boards")
  .columns({
    id: string(),
    name: string(),
    description: string(),
  })
  .primaryKey("id");

const member = table("members")
  .columns({
    id: string(),
    boardId: string(),
    userId: number(),
  })
  .primaryKey("id");

const memberRelations = relationships(member, ({ one }) => {
  return {
    board: one({
      sourceField: ["boardId"],
      destField: ["id"],
      destSchema: board,
    }),
  };
});

const category = table("categories")
  .columns({
    id: string(),
    boardId: string(),
    name: string(),
    order: string(),
    color: string(),
  })
  .primaryKey("id");

const categoryRelations = relationships(category, ({ one }) => {
  return {
    board: one({
      sourceField: ["boardId"],
      destField: ["id"],
      destSchema: board,
    }),
  };
});

const ticket = table("tickets")
  .columns({
    id: string(),
    shortId: number().optional(),
    boardId: string(),
    senderId: number(),
    assigneeId: number().optional(),
    categoryId: string(),
    status: enumeration<"TODO" | "NEXT" | "IN_PROGRESS" | "BLOCKED" | "DONE">(),
    title: string(),
    body: string().optional(),
    dueDate: number().optional(),
    priority: number(),
    timestamp: number(),
    sortOrder: number(),
  })
  .primaryKey("id");

const ticketRelations = relationships(ticket, ({ one }) => {
  return {
    board: one({
      sourceField: ["boardId"],
      destField: ["id"],
      destSchema: board,
    }),
    category: one({
      sourceField: ["categoryId"],
      destField: ["id"],
      destSchema: category,
    }),
  };
});

export const schema = createSchema(1, {
  tables: [board, member, category, ticket],
  relationships: [memberRelations, categoryRelations, ticketRelations],
});

export type Schema = typeof schema;
export type Board = Row<typeof schema.tables.boards>;
export type Member = Row<typeof schema.tables.members>;
export type Category = Row<typeof schema.tables.categories>;
export type Ticket = Row<typeof schema.tables.tickets>;

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
