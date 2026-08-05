"use client";

import { useEffect, useState } from "react";
import { useAxios } from "@/lib/services/axios.service";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "@/src/i18n/routing";

export default function AdminPage() {
  const { axios } = useAxios();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCases: 0,
    revenue: 0,
    upcomingHearings: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/cases/dashboard/stats");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center text-muted-foreground">
        <Loader2Icon className="h-8 w-8 animate-spin mb-4" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-serif text-foreground">
        Overview
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">
            Total Clients
          </h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {stats.totalClients}
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">
            Active Cases
          </h3>
          <p className="text-3xl font-bold text-primary mt-2">
            {stats.activeCases}
          </p>
        </div>
        <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
          <h3 className="text-lg font-medium text-card-foreground">Revenue</h3>
          <p className="text-3xl font-bold text-primary mt-2">
            Rs. {stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold font-serif text-foreground mb-4">
          Upcoming Hearings
        </h2>
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          {stats.upcomingHearings && stats.upcomingHearings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Case Name</th>
                    <th className="px-4 py-3 font-medium">Case Number</th>
                    <th className="px-4 py-3 font-medium">Court Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.upcomingHearings.map((hearing: any) => (
                    <tr
                      key={hearing.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/dashboard/cases/${hearing.caseId}?tab=hearings`,
                        )
                      }
                    >
                      <td className="px-4 py-3 font-medium text-primary">
                        {new Date(hearing.nextHearingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {hearing.case?.courtDetails?.[0]?.caseName || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {hearing.case?.courtDetails?.[0]?.caseNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {hearing.case?.courtDetails?.[0]?.courtName ||
                          hearing.case?.courtDetails?.[0]?.courtType ||
                          "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No upcoming hearings scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
