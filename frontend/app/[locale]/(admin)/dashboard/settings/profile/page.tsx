import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-serif text-foreground">
          Personal Details
        </h1>
        <p className="text-muted-foreground text-sm">
          Update your profile information and how your name appears across the
          system.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <ProfileForm />
      </div>
    </div>
  );
}
