import ResetPasswordClient from "./ResetPasswordClient";

export function generateStaticParams() {
  return [{ token: "placeholder" }];
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
