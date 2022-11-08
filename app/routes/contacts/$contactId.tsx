import { Outlet, useCatch } from "@remix-run/react";
import ErrorPage from "~/lib/error-page";

export default function ContactId() {
  return <Outlet />;
}

export function CatchBoundary() {
  const caught = useCatch();
  return <ErrorPage error={caught} />;
}

export function ErrorBoundary({
  error,
}: {
  error: Error & { statusText?: string };
}) {
  return <ErrorPage error={error} />;
}
