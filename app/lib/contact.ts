import { db } from "~/lib/db.server";

export type { Contact } from "@prisma/client";

function matchCaseInsensitive(query: string, text?: string) {
  return text && text.toLocaleLowerCase().includes(query);
}

export async function getContacts(query?: string) {
  await fakeNetwork(`getContacts:${query}`);
  let contacts = await db.contact.findMany({
    orderBy: [{ first: "asc" }, { last: "asc" }],
  });
  return query
    ? contacts.filter(
        (contact) =>
          matchCaseInsensitive(query, contact.first ?? undefined) ||
          matchCaseInsensitive(query, contact.last ?? undefined)
      )
    : contacts;
}

export async function createContact() {
  await fakeNetwork();
  let contact = await db.contact.create({ data: {} });
  return contact;
}

export async function getContact(id: string) {
  await fakeNetwork(`contact:${id}`);
  let contact = await db.contact.findUnique({ where: { id } });
  return contact;
}

export async function updateContact(
  id: string,
  updates: Parameters<typeof db.contact.update>[0]["data"]
) {
  await fakeNetwork();
  let contact = await db.contact.update({ where: { id }, data: updates });
  return contact;
}

export async function deleteContact(id: string) {
  let contact = await db.contact.delete({ where: { id } });
  return contact;
}

// fake a cache so we don't slow down stuff we've already seen
let fakeCache: Record<string, boolean> = {};

async function fakeNetwork(key?: string) {
  if (!key) {
    fakeCache = {};
    return;
  }
  if (fakeCache[key]) {
    return;
  }

  fakeCache[key] = true;
  return new Promise((res) => {
    setTimeout(res, Math.random() * 800);
  });
}
