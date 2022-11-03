import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

type CreateContact = Parameters<typeof db.contact.create>[0]["data"];

const contacts: CreateContact[] = [
  { first: "Dennis", last: "Beatty" },
  { first: "Greg", last: "Brimble" },
  { first: "Ryan", last: "Dahl" },
  { first: "Sarah", last: "Dayan" },
  { first: "Ceora", last: "Ford" },
  { first: "Anthony", last: "Frehner" },
  { first: "Ariza", last: "Fukuzaki" },
  {
    first: "Henri",
    last: "Helvetica",
    avatar:
      "https://pbs.twimg.com/profile_images/960605708202004481/MMNCgNgM_400x400.jpg",
    twitter: "@HenriHelvetica",
    favorite: true,
    notes: "How To WebPageTest",
  },
  { first: "Michael", last: "Jackson" },
];

async function seed() {
  await Promise.all(
    contacts.map((contact) => {
      return db.contact.create({ data: contact });
    })
  );
}

seed();
