import { ActionFunctionArgs, redirect } from "react-router-dom";
import { deleteContact } from "../contact";

export async function action({ params }: ActionFunctionArgs) {
  await deleteContact(params.contactId!);
  return redirect("/");
}