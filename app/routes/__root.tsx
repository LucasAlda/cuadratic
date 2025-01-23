import { Outlet, ScrollRestoration, createRootRoute } from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/start";
import type { ReactNode } from "react";
import appCss from "@/styles/app.css?url";
import { schema } from "@/lib/zero";
import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}
export const z = new Zero({
  userID: "anon",
  // auth: () => encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema: schema,
  // This is often easier to develop with if you're frequently changing
  // the schema. Switch to 'idb' for local-persistence.
  kvStore: "mem",
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        <ZeroProvider zero={z}>
          {children}
          <ScrollRestoration />
          <Scripts />
        </ZeroProvider>
      </body>
    </html>
  );
}