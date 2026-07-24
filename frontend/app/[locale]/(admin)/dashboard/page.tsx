import NotificationLog from './NotificationLog';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-serif text-foreground">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">Total Clients</h3>
          <p className="text-3xl font-bold text-primary mt-2">1,248</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">Active Cases</h3>
          <p className="text-3xl font-bold text-primary mt-2">42</p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">Revenue</h3>
          <p className="text-3xl font-bold text-primary mt-2">$84,000</p>
        </div>
      </div>

      <NotificationLog />
    </div>
  );
}
