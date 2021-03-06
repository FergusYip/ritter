import { ActionFunction, LoaderFunction, redirect } from "remix";
import { destroySession, getSession } from "~/session.server";

export let loader: LoaderFunction = async () => redirect("/");

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));

  return redirect("/", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
};
