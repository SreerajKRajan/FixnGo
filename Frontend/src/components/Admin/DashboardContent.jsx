import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function DashboardContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-sm text-gray-400">+20% from last month</p>
        </CardContent>
      </Card>
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white">Total Workshops</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">56</div>
          <p className="text-sm text-gray-400">+5 new this week</p>
        </CardContent>
      </Card>
      <Card className="bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white">Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-sm text-gray-400">3 new since yesterday</p>
        </CardContent>
      </Card>
    </div>
  );
}
