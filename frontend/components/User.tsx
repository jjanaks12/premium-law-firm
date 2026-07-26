import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { UserWithRole } from "@/lib/dictionary/adminNav";

export function User({ user }: { user: UserWithRole }) {
  const fullName = [user.first_name, user.last_name].join(" ");
  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-12 rounded-lg bg-primary-100">
        {user.avatar?.url ? (
          <AvatarImage
            src={user.avatar.url}
            alt={user.first_name + " " + user.last_name}
          />
        ) : (
          <AvatarFallback className="text-primary bg-primary-100">
            {fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="hidden xl:flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="block text-sm font-semibold text-foreground truncate">
          {fullName}
        </span>
        <span className="block text-xs font-medium text-muted-foreground truncate">
          {user.email}
        </span>
      </div>
    </div>
  );
}
