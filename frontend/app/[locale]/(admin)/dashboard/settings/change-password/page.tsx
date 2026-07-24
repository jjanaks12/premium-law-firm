import ChangePasswordForm from "./ChangePasswordForm";

export default function ChangePasswordPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          Change Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Keep your account secure by updating your password regularly.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
