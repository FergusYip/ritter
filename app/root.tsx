import { User } from "@prisma/client";
import React from "react";
import type { LinksFunction, LoaderFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
} from "remix";
import globalStylesUrl from "~/styles/global.css";
import { authenticator } from "~/auth.server";
import Header from "./components/Header";
import PageMargins from "./layouts/PageMargins";

/**
 * The `links` export is a function that returns an array of objects that map to
 * the attributes for an HTML `<link>` element. These will load `<link>` tags on
 * every route in the app, but individual routes can include their own links
 * that are automatically unloaded when a user navigates away from the route.
 *
 * https://remix.run/api/app#links
 */
export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStylesUrl }];
};

/**
 * The root module's default export is a component that renders the current
 * route via the `<Outlet />` component. Think of this as the global layout
 * component for your app.
 */
export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  );
}

type LoaderData = { user?: User };

export let loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request, {});
  const data: LoaderData = {
    user: user ?? undefined,
  };
  return data;
};

function Layout({ children }: React.PropsWithChildren<{}>) {
  const { user } = useLoaderData<LoaderData>();

  return (
    <PageMargins>
      <Header title="Ritter" user={user} />
      {children}
    </PageMargins>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>;
      break;
    case 404:
      message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <ErrorLayout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </ErrorLayout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <ErrorLayout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>Hey, developer, you should replace this with what you want your users to see.</p>
        </div>
      </ErrorLayout>
    </Document>
  );
}
const ErrorLayout = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <PageMargins>
      <Header title="Ritter" showLogin={false} />
      {children}
    </PageMargins>
  );
};
