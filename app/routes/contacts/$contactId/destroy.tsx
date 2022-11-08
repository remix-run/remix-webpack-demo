import { ActionArgs, redirect } from "@remix-run/node";

import { deleteContact } from "~/lib/contact";

export async function action({ params }: ActionArgs) {
  await deleteContact(params.contactId!);
  return redirect("/");
}
