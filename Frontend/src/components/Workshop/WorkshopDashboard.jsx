"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  DollarSign,
  HelpCircle,
  Search,
  Star,
  Wrench,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import WorkshopHeader from "../../components/Workshop/WorkshopHeader";
import WorkshopFooter from "../../components/Workshop/WorkshopFooter";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";

// Static rating data (as per your requirement)
const ratingData = [
  { name: "5 Stars", value: 65, fill: "#22c55e" },
  { name: "4 Stars", value: 25, fill: "#3b82f6" },
  { name: "3 Stars", value: 7, fill: "#eab308" },
  { name: "2 Stars", value: 2, fill: "#f97316" },
  { name: "1 Star", value: 1, fill: "#ef4444" },
];

// Shimmer loading animation CSS class
const shimmerClass = "animate-pulse bg-slate-200 rounded";

// Shimmer loading components
const ShimmerCard = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <div className={`${shimmerClass} h-4 w-24`}></div>
      <div className={`${shimmerClass} h-4 w-4`}></div>
    </CardHeader>
    <CardContent>
      <div className={`${shimmerClass} h-8 w-20 mb-2`}></div>
      <div className={`${shimmerClass} h-3 w-32`}></div>
    </CardContent>
  </Card>
);

const ShimmerChart = () => (
  <Card className="col-span-1">
    <CardHeader>
      <div className={`${shimmerClass} h-6 w-40 mb-2`}></div>
      <div className={`${shimmerClass} h-4 w-64`}></div>
    </CardHeader>
    <CardContent>
      <div className={`${shimmerClass} h-80 w-full`}></div>
    </CardContent>
  </Card>
);

const ShimmerActivity = () => (
  <div className="flex items-start gap-4">
    <div className={`${shimmerClass} h-10 w-10 rounded-full`}></div>
    <div className="flex-1 space-y-2">
      <div className="flex items-center justify-between">
        <div className={`${shimmerClass} h-4 w-24`}></div>
        <div className={`${shimmerClass} h-5 w-20`}></div>
      </div>
      <div className={`${shimmerClass} h-4 w-full`}></div>
      <div className={`${shimmerClass} h-3 w-32`}></div>
    </div>
  </div>
);

const ShimmerTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>
          <div className={`${shimmerClass} h-4 w-24`}></div>
        </TableHead>
        <TableHead>
          <div className={`${shimmerClass} h-4 w-16`}></div>
        </TableHead>
        <TableHead>
          <div className={`${shimmerClass} h-4 w-20`}></div>
        </TableHead>
        <TableHead className="text-right">
          <div className={`${shimmerClass} h-4 w-16 ml-auto`}></div>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[1, 2, 3, 4].map((i) => (
        <TableRow key={i}>
          <TableCell>
            <div className={`${shimmerClass} h-4 w-32`}></div>
          </TableCell>
          <TableCell>
            <div className={`${shimmerClass} h-4 w-20`}></div>
          </TableCell>
          <TableCell>
            <div className={`${shimmerClass} h-4 w-10`}></div>
          </TableCell>
          <TableCell className="text-right">
            <div className={`${shimmerClass} h-4 w-6 ml-auto`}></div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default function WorkshopDashboard() {
  // State variables for dashboard data
  const [dashboardData, setDashboardData] = useState({
    summaryCards: [],
    serviceRequestData: [],
    recentActivity: [],
    serviceData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/workshop/dashboard/");
        
        // Process data from API and format it for the dashboard
        const summaryCards = [
          {
            title: "Total Requests",
            icon: HelpCircle,
            value: response.data.total_requests.toString(),
            change: "+12% from last month",
          },
          { 
            title: "Pending", 
            icon: Clock, 
            value: response.data.total_pending.toString(), 
            change: "-4% from last week" 
          },
          {
            title: "Completed",
            icon: CheckCircle2,
            value: response.data.total_completed.toString(),
            change: "+18% from last month",
          },
          {
            title: "Total Earnings",
            icon: DollarSign,
            value: `$${response.data.total_earnings.toLocaleString()}`,
            change: "+23% from last month",
          },
          { title: "Avg. Rating", icon: Star, value: "4.8", stars: 4 },
        ];

        // Fetch service request trends
        const trendResponse = await axiosInstance.get("/workshop/dashboard/service-requests/trends/");
        const serviceRequestData = trendResponse.data.trends || [
          // Default data if API doesn't provide trends
          { month: "Jan", requests: 65 },
          { month: "Feb", requests: 59 },
          { month: "Mar", requests: 80 },
          { month: "Apr", requests: 81 },
          { month: "May", requests: 56 },
          { month: "Jun", requests: 55 },
          { month: "Jul", requests: 40 },
          { month: "Aug", requests: 70 },
          { month: "Sep", requests: 90 },
          { month: "Oct", requests: 110 },
          { month: "Nov", requests: 95 },
          { month: "Dec", requests: 85 },
        ];

        // Fetch recent activity
        const activityResponse = await axiosInstance.get("/workshop/dashboard/recent-activity/");
        const recentActivity = activityResponse.data.activities || [];
        
        // Format activity data
        const formattedActivity = recentActivity.map(activity => {
          let statusColor = "";
          if (activity.status === "Completed") {
            statusColor = "bg-green-50 text-green-700";
          } else if (activity.status === "Pending") {
            statusColor = "bg-yellow-50 text-yellow-700";
          } else if (activity.status === "Rejected") {
            statusColor = "bg-red-50 text-red-700";
          } else if (activity.status === "In Progress") {
            statusColor = "bg-blue-50 text-blue-700";
          }
          
          const nameParts = activity.user_name ? activity.user_name.split(" ") : ["User"];
          const initials = nameParts.length > 1 
            ? `${nameParts[0][0]}${nameParts[1][0]}` 
            : `${nameParts[0][0]}${nameParts[0][1] || ""}`;
            
          return {
            name: activity.user_name || "User",
            initials: initials.toUpperCase(),
            status: activity.status,
            action: `Requested a ${activity.service_name} service`,
            time: new Date(activity.created_at).toLocaleString(),
            statusColor
          };
        });

        // Fetch service data
        const servicesResponse = await axiosInstance.get("/workshop/dashboard/services/");
        const serviceData = servicesResponse.data.map(service => {
          let statusColor = "bg-yellow-50 text-yellow-700";
          if (service.is_approved) {
            statusColor = "bg-green-50 text-green-700";
          }
          
          return {
            name: service.name,
            price: `$${parseFloat(service.base_price).toFixed(2)}`,
            status: service.is_approved ? "Approved" : "Pending",
            bookings: service.bookings_count || 0,
            statusColor
          };
        });

        setDashboardData({
          summaryCards,
          serviceRequestData,
          recentActivity: formattedActivity.slice(0, 4), // Show only latest 4 activities
          serviceData
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to fetch dashboard data. Please try again.");
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <WorkshopHeader />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-500">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </main>
        <WorkshopFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <WorkshopHeader />

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <Link to="/workshop/service-requests">
              <Button className="group flex items-center gap-2 px-6 py-2 text-sm font-medium">
                Service Requests
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {loading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <ShimmerCard key={i} />
                ))}
              </>
            ) : (
              dashboardData.summaryCards.map((card, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <card.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                    {card.stars ? (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= card.stars
                                  ? "fill-yellow-400 text-yellow-400"
                                  : ""
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-1">based on 156 reviews</span>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {card.change}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {loading ? (
              <>
                <ShimmerChart />
                <ShimmerChart />
              </>
            ) : (
              <>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Service Request Trends</CardTitle>
                    <CardDescription>
                      Number of service requests over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.serviceRequestData}>
                          <CartesianGrid strokeDasharray="10 10" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip
                            formatter={(value) => [`${value} requests`, "Requests"]}
                            contentStyle={{
                              background: "white",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="requests"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: "#3b82f6", r: 4 }}
                            activeDot={{
                              fill: "#3b82f6",
                              r: 6,
                              strokeWidth: 2,
                              stroke: "#fff",
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-1">
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
                    <CardDescription>
                      Customer feedback ratings (1-5 stars)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ratingData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={2}
                            cornerRadius={4}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {ratingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value}%`, "Percentage"]}
                            contentStyle={{
                              background: "white",
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend
                            verticalAlign="middle"
                            align="right"
                            layout="vertical"
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest service requests and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  [...Array(4)].map((_, i) => <ShimmerActivity key={i} />)
                ) : dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage
                          src="/placeholder.svg?height=40&width=40"
                          alt={item.name}
                        />
                        <AvatarFallback>{item.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{item.name}</p>
                          <Badge variant="outline" className={item.statusColor}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent activity found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Service Summary</CardTitle>
                  <CardDescription>
                    All services offered by your workshop
                  </CardDescription>
                </div>
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ShimmerTable />
              ) : dashboardData.serviceData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.serviceData.map((service, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>{service.price}</TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Activity className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No services found</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <WorkshopFooter />
    </div>
  );
}