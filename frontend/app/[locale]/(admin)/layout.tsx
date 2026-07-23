export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="w-64 border-r border-border bg-background p-4 flex flex-col">
        <div className="h-12 flex items-center font-bold text-lg text-primary border-b border-border mb-4">
          Admin Dashboard
        </div>
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="px-3 py-2 bg-primary/10 text-primary rounded-md text-sm font-medium">Dashboard</a>
          <a href="/admin/users" className="px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium">Users</a>
          <a href="/admin/settings" className="px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md text-sm font-medium">Settings</a>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border bg-background flex items-center justify-end px-6">
          <span className="text-sm font-medium text-muted-foreground">Admin User</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
