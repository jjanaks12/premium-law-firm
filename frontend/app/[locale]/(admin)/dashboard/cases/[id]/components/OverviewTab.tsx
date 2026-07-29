import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OverviewTab({ caseData, refresh }: { caseData: any; refresh: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Case Number</p>
            <p className="font-medium">{caseData.caseNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Registration Date</p>
            <p className="font-medium">{caseData.registrationDate ? new Date(caseData.registrationDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{caseData.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nature</p>
            <p className="font-medium">{caseData.nature?.name || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lawyers</CardTitle>
        </CardHeader>
        <CardContent>
          {caseData.lawyers && caseData.lawyers.length > 0 ? (
            <ul className="space-y-2">
              {caseData.lawyers.map((l: any) => (
                <li key={l.userId} className="flex items-center space-x-2">
                  <span className="font-medium">{l.user?.first_name} {l.user?.last_name}</span>
                  {l.isLead && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Lead</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No lawyers assigned.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
