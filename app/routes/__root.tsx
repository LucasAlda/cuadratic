import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import appCss from "@/styles/app.css?url";
import { schema } from "@/lib/zero";
import { Zero } from "@rocicorp/zero";
import { ZeroProvider } from "@rocicorp/zero/react";
import { Toaster } from "sonner";

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
      <Toaster richColors />
      <Outlet />
    </RootDocument>
  );
}

export const zero = new Zero({
  userID: "anon",
  // auth: () => encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema: schema,
  // This is often easier to develop with if you're frequently changing
  // the schema. Switch to 'idb' for local-persistence.
  kvStore: typeof window !== "undefined" ? "idb" : "mem",
});

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ZeroProvider zero={zero}>
          {children}

          <Scripts />
        </ZeroProvider>
      </body>
    </html>
  );
}
