import React, { useState, useEffect } from "react";
import {
  Users,
  Wrench,
  FileCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";

// Reusable components to reduce repetition
const SummaryCard = ({ title, value, change, icon: Icon, children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="flex flex-row items-center justify-between pb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <Icon className="h-4 w-4 text-gray-400" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {change && (
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span
          className={`${
            change.startsWith("+") ? "text-emerald-500" : "text-red-500"
          } font-medium`}
        >
          {change}
        </span>{" "}
        {change.endsWith("%")
          ? "from last month"
          : change.includes("new")
          ? "new this week"
          : "from last week"}
      </div>
    )}
    {children}
  </div>
);

const ChartCard = ({ title, description, height = "72", children }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <div className="mb-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div className={`h-${height}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    COMPLETED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  const icons = {
    COMPLETED: <CheckCircle2 className="mr-1 h-3 w-3" />,
    IN_PROGRESS: <Activity className="mr-1 h-3 w-3" />,
    PENDING: <Clock className="mr-1 h-3 w-3" />,
    ACCEPTED: <CheckCircle2 className="mr-1 h-3 w-3" />,
    REJECTED: <Clock className="mr-1 h-3 w-3" />,
  };

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
        styles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {icons[status] || <Clock className="mr-1 h-3 w-3" />}
      {status.replace("_", " ")}
    </span>
  );
};

// Common tooltip style
const tooltipStyle = {
  backgroundColor: "white",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

export function DashboardContent() {
  // State to store dashboard data
  const [dashboardData, setDashboardData] = useState({
    userStats: { total: 0, growth: 0 },
    workshopStats: { total: 0, pending: 0 },
    serviceRequestStats: {
      total: 0,
      growth: 0,
      new: 0,
      inProgress: 0,
      completed: 0,
    },
    revenueStats: { total: 0, growth: 0, pending: 0 },
    serviceDistribution: [],
    paymentDistribution: [],
    userGrowth: [],
    recentServiceRequests: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from backend
  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axiosInstance.get("/admin_side/dashboard/");

        if (isMounted) {
          setDashboardData(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    // Optional: Set up a polling interval to refresh data
    const interval = setInterval(fetchDashboardData, 300000); // 5 minutes

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return `₹${parseFloat(value).toLocaleString("en-IN")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 text-center">
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-red-800">
            Failed to load dashboard
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    userStats,
    workshopStats,
    serviceRequestStats,
    revenueStats,
    serviceDistribution,
    paymentDistribution,
    userGrowth,
    recentServiceRequests,
  } = dashboardData;
  console.log("paymentdist:", paymentDistribution);
  console.log("servicedist:", serviceDistribution);

  // Payment colors for the pie chart
  const paymentColors = {
    SUCCESS: "#10b981",
    PENDING: "#f59e0b",
    FAILED: "#ef4444",
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={userStats.total.toLocaleString()}
          change={`${userStats.growth >= 0 ? "+" : ""}${userStats.growth}%`}
          icon={Users}
        >
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(10, userStats.growth * 5 + 50)
                )}%`,
              }}
            ></div>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Total Workshops"
          value={workshopStats.total.toLocaleString()}
          change={`+${workshopStats.new || 0} new`}
          icon={Wrench}
        >
          <div className="mt-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 flex items-center w-fit">
              <Clock className="mr-1 h-3 w-3" /> {workshopStats.pending} pending
              approval
            </span>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Service Requests"
          value={serviceRequestStats.total.toLocaleString()}
          change={`${serviceRequestStats.growth >= 0 ? "+" : ""}${
            serviceRequestStats.growth
          }%`}
          icon={FileCheck}
        >
          <div className="mt-3 flex flex-wrap gap-1 text-xs">
            <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">
              {serviceRequestStats.new} New
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700">
              {serviceRequestStats.inProgress} In Progress
            </span>
            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
              {serviceRequestStats.completed} Completed
            </span>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Revenue"
          value={formatCurrency(revenueStats.total)}
          change={`${revenueStats.growth >= 0 ? "+" : ""}${
            revenueStats.growth
          }%`}
          icon={DollarSign}
        >
          <div className="mt-3 text-xs">
            <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 w-fit">
              {formatCurrency(revenueStats.pending)} pending
            </span>
          </div>
        </SummaryCard>
      </div>

      {/* Charts Section */}
      {serviceDistribution?.length > 0 ||
      paymentDistribution?.some((item) => item.value > 0) ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bar Chart */}
          {serviceDistribution.length > 0 && (
            <ChartCard
              title="Service Requests by Category"
              description="Distribution of service requests by type"
            >
              <BarChart
                data={serviceDistribution}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          )}

          {/* Pie Chart */}
          {paymentDistribution.some((item) => item.value > 0) && (
            <ChartCard
              title="Payment Distribution"
              description="Breakdown of payment status"
            >
              <PieChart>
                <Pie
                  data={paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {paymentDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={paymentColors[entry.status] || "#9ca3af"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Amount",
                  ]}
                  contentStyle={tooltipStyle}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ChartCard>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 italic mt-4">
          No chart data available at the moment.
        </div>
      )}

      {/* Line Chart */}
      <ChartCard
        title="User Growth Trend"
        description="Monthly user registration over time"
      >
        <LineChart
          data={userGrowth}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="count"
            name="Users"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartCard>

      {/* Recent Service Requests Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Recent Service Requests</h3>
          <p className="text-sm text-gray-500">
            Latest service requests from users
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {[
                  "User",
                  "Service",
                  "Vehicle",
                  "Workshop",
                  "Status",
                  "Date",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentServiceRequests.length > 0 ? (
                recentServiceRequests.map((request, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.userName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {request.serviceName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {request.vehicleType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {request.workshopName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {request.timeAgo}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No recent service requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <button className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            View All Requests
          </button>
        </div>
      </div>
    </div>
  );
}
