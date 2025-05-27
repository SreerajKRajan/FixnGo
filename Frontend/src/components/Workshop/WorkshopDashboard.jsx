"use client";

import { useState, useEffect, memo, useMemo } from "react";
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
import { Button } from "@/components/ui/Button";
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

// Shimmer loading animation CSS class
const shimmerClass = "animate-pulse bg-slate-200 rounded";

// Memoized shimmer components for better performance
const ShimmerCard = memo(() => (
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
));

const ShimmerChart = memo(() => (
  <Card className="col-span-1">
    <CardHeader>
      <div className={`${shimmerClass} h-6 w-40 mb-2`}></div>
      <div className={`${shimmerClass} h-4 w-64`}></div>
    </CardHeader>
    <CardContent>
      <div className={`${shimmerClass} h-80 w-full`}></div>
    </CardContent>
  </Card>
));

const ShimmerActivity = memo(() => (
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
));

const ShimmerTable = memo(() => (
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
      {Array.from({ length: 4 }).map((_, i) => (
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
));

// Memoized components for better performance
const SummaryCard = memo(({ title, icon: Icon, value, change, stars }) => (
  <Card>
    <CardHeader className="p-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="text-2xl font-bold">{value}</div>
      {stars ? (
        <div className="flex mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < stars ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500">{change}</p>
      )}
    </CardContent>
  </Card>
));

const ActivityItem = memo(({ item }) => (
  <div className="flex items-start gap-4">
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
));

const ServiceRow = memo(({ service }) => (
  <TableRow>
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
));

// Charts components
const ServiceRequestChart = memo(({ data }) => (
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
          <LineChart data={data}>
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
));

const RatingDistributionChart = memo(({ data }) => (
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
              data={data}
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
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} reviews`, name]}
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
));

const ErrorDisplay = memo(({ error, onRetry }) => (
  <div className="flex min-h-screen w-full flex-col bg-muted/40">
    <WorkshopHeader />
    <main className="flex-1 p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-red-500">{error}</p>
        <Button 
          onClick={onRetry} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    </main>
    <WorkshopFooter />
  </div>
));

export default function WorkshopDashboard() {
  // State variables for dashboard data
  const [dashboardData, setDashboardData] = useState({
    summaryCards: [],
    serviceRequestData: [],
    recentActivity: [],
    serviceData: []
  });
  const [reviewData, setReviewData] = useState({
    ratingDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeServiceTab, setActiveServiceTab] = useState("all");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parallel API requests for better performance
      const [dashboardResponse, trendResponse, activityResponse, servicesResponse] = await Promise.all([
        axiosInstance.get("/workshop/dashboard/"),
        axiosInstance.get("/workshop/dashboard/service-requests/trends/"),
        axiosInstance.get("/workshop/dashboard/recent-activity/"),
        axiosInstance.get("/workshop/dashboard/services/")
      ]);
      
      // Process summary cards data
      const summaryCards = [
        {
          title: "Total Requests",
          icon: HelpCircle,
          value: dashboardResponse.data.total_requests.toString(),
          change: `${dashboardResponse.data.req_percent_change > 0 ? '+' : ''}${dashboardResponse.data.req_percent_change}% from last month`,
        },
        { 
          title: "Pending", 
          icon: Clock, 
          value: dashboardResponse.data.total_pending.toString(), 
          change: `${dashboardResponse.data.pending_percent_change > 0 ? '+' : ''}${dashboardResponse.data.pending_percent_change}% from last week` 
        },
        {
          title: "Completed",
          icon: CheckCircle2,
          value: dashboardResponse.data.total_completed.toString(),
          change: `${dashboardResponse.data.completed_percent_change > 0 ? '+' : ''}${dashboardResponse.data.completed_percent_change}% from last month`,
        },
        {
          title: "Total Earnings",
          icon: DollarSign,
          value: `$${dashboardResponse.data.total_earnings.toLocaleString()}`,
          change: `${dashboardResponse.data.earnings_percent_change > 0 ? '+' : ''}${dashboardResponse.data.earnings_percent_change}% from last month`,
        },
      ];

      // Process service request trends
      const serviceRequestData = trendResponse.data.trends || [
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

      // Process recent activity
      const recentActivity = (activityResponse.data.activities || []).map(activity => {
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

      // Process services data
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
        recentActivity: recentActivity.slice(0, 4), // Show only latest 4 activities
        serviceData
      });
      
      // Fetch review data
      await fetchReviewData();
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to fetch dashboard data. Please try again.");
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewData = async () => {
    try {          
      // Fetch rating distribution data
      const ratingDistResponse = await axiosInstance.get("/workshop/dashboard/rating-distribution/");
      
      // Process rating distribution data
      const ratingDistributionData = [
        { name: "5 Stars", value: ratingDistResponse.data.five_star || 0, fill: "#22c55e" },
        { name: "4 Stars", value: ratingDistResponse.data.four_star || 0, fill: "#3b82f6" },
        { name: "3 Stars", value: ratingDistResponse.data.three_star || 0, fill: "#eab308" },
        { name: "2 Stars", value: ratingDistResponse.data.two_star || 0, fill: "#f97316" },
        { name: "1 Star", value: ratingDistResponse.data.one_star || 0, fill: "#ef4444" },
      ];
      
      // Add average rating to summary cards
      const averageRating = ratingDistResponse.data.average_rating || 0;
      const ratingCard = {
        title: "Avg. Rating",
        icon: Star,
        value: averageRating.toFixed(1),
        stars: Math.round(averageRating)
      };
      
      setDashboardData(prev => ({
        ...prev,
        summaryCards: [...prev.summaryCards, ratingCard]
      }));
      
      setReviewData({
        ratingDistribution: ratingDistributionData,
      });
      
    } catch (error) {
      console.error("Failed to fetch review data:", error);
      toast.error("Failed to fetch review data. Please try again.");
      
      // Fallback to dummy data if API fails
      const fallbackRatingData = [
        { name: "5 Stars", value: 65, fill: "#22c55e" },
        { name: "4 Stars", value: 25, fill: "#3b82f6" },
        { name: "3 Stars", value: 7, fill: "#eab308" },
        { name: "2 Stars", value: 2, fill: "#f97316" },
        { name: "1 Star", value: 1, fill: "#ef4444" },
      ];
      
      setReviewData({
        ratingDistribution: fallbackRatingData,
      });
    }
  };

  // Filter services based on active tab
  const filteredServiceData = useMemo(() => {
    if (activeServiceTab === "all") {
      return dashboardData.serviceData;
    } else if (activeServiceTab === "approved") {
      return dashboardData.serviceData.filter(service => service.status === "Approved");
    } else {
      return dashboardData.serviceData.filter(service => service.status === "Pending");
    }
  }, [dashboardData.serviceData, activeServiceTab]);

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveServiceTab(value);
  };

  if (error) {
    return <ErrorDisplay error={error} onRetry={() => window.location.reload()} />;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {loading ? (
              // Show shimmer for cards when loading
              Array.from({ length: 5 }).map((_, index) => (
                <ShimmerCard key={index} />
              ))
            ) : (
              // Show actual cards when data is loaded
              dashboardData.summaryCards.map((card, index) => (
                <SummaryCard key={index} {...card} />
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
                <ServiceRequestChart data={dashboardData.serviceRequestData} />
                <RatingDistributionChart data={reviewData.ratingDistribution} />
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
                  Array.from({ length: 4 }).map((_, i) => <ShimmerActivity key={i} />)
                ) : dashboardData.recentActivity.length > 0 ? (
                  dashboardData.recentActivity.map((item, i) => (
                    <ActivityItem key={i} item={item} />
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
                <Tabs defaultValue="all" value={activeServiceTab} onValueChange={handleTabChange}>
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
              ) : filteredServiceData.length > 0 ? (
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
                    {filteredServiceData.map((service, i) => (
                      <ServiceRow key={i} service={service} />
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