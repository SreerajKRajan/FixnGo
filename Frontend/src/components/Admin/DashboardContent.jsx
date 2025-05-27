import React, { useState, useEffect } from "react";
import {
  Users,
  Wrench,
  FileCheck,
  DollarSign,
  CheckCircle2,
  Clock,
  Activity,
  Wallet,
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
  ComposedChart,
} from "recharts";
import axiosInstance from "../../utils/axiosInstance";

// Styling constants
const CHART_HEIGHT = 300;
const CHART_COLORS = {
  SUCCESS: "#10b981",
  PENDING: "#f59e0b",
  FAILED: "#ef4444",
  primary: "#6366f1",
  adminFee: "#8b5cf6",
  workshopAmount: "#3b82f6",
  secondary: "#f97316",
};
const TOOLTIP_STYLE = {
  backgroundColor: "white",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  padding: "8px",
};

// Status badge helper
const StatusBadge = ({ status }) => {
  const statusValue = status || "PENDING";

  const STYLES = {
    COMPLETED: "bg-green-100 text-green-800",
    IN_PROGRESS: "bg-blue-100 text-blue-800",
    PENDING: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-blue-100 text-blue-800",
    REJECTED: "bg-red-100 text-red-800",
    SUCCESS: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  const ICONS = {
    COMPLETED: <CheckCircle2 className="mr-1 h-3 w-3" />,
    IN_PROGRESS: <Activity className="mr-1 h-3 w-3" />,
    PENDING: <Clock className="mr-1 h-3 w-3" />,
    ACCEPTED: <CheckCircle2 className="mr-1 h-3 w-3" />,
    REJECTED: <Clock className="mr-1 h-3 w-3" />,
    SUCCESS: <CheckCircle2 className="mr-1 h-3 w-3" />,
    FAILED: <Clock className="mr-1 h-3 w-3" />,
  };

  return (
    <span
      className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
        STYLES[statusValue] || "bg-gray-100 text-gray-800"
      }`}
    >
      {ICONS[statusValue] || <Clock className="mr-1 h-3 w-3" />}
      {statusValue.replace("_", " ")}
    </span>
  );
};

// Reusable components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
    {children}
  </div>
);

const SummaryCard = ({ title, value, change, icon: Icon, children }) => (
  <Card>
    <div className="flex items-center justify-between pb-2">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <Icon className="h-4 w-4 text-gray-400" />
    </div>
    <div className="text-2xl font-bold">{value}</div>
    {change && (
      <div className="flex items-center text-xs text-gray-500 mt-1">
        <span
          className={`${
            parseFloat(change) >= 0 ? "text-emerald-500" : "text-red-500"
          } font-medium`}
        >
          {change.startsWith("+") || change.startsWith("-")
            ? change
            : `+${change}`}
        </span>
        {change.endsWith("%")
          ? " from last month"
          : change.includes("new")
          ? " new this week"
          : " from last week"}
      </div>
    )}
    {children}
  </Card>
);

const ChartCard = ({ title, description, children }) => (
  <Card>
    <div className="mb-4">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <div style={{ height: `${CHART_HEIGHT}px`, width: "100%" }}>
      <ResponsiveContainer>{children}</ResponsiveContainer>
    </div>
  </Card>
);

// Service Requests Table Component with Pagination
const ServiceRequestsTable = ({ initialRequests = [] }) => {
  const [serviceRequests, setServiceRequests] = useState(initialRequests);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const ITEMS_PER_PAGE = 5;

  // Format currency helper
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "₹0" : `₹${num.toLocaleString("en-IN")}`;
  };

  const loadMoreRequests = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      // Calculate the next page
      const nextPage = page + 1;

      // Make API call for paginated data
      const response = await axiosInstance.get(
        `/admin_side/service-requests/?page=${nextPage}&limit=${ITEMS_PER_PAGE}`
      );

      const newRequests = response.data.results || [];

      // Check if there are more items to load
      setHasMore(newRequests.length === ITEMS_PER_PAGE);

      // Append new requests to the existing list
      setServiceRequests([...serviceRequests, ...newRequests]);

      // Update page number
      setPage(nextPage);
      setError(null);
    } catch (err) {
      console.error("Error loading more service requests:", err);
      setError("Failed to load more requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-lg font-medium">Recent Service Requests</h3>
        <p className="text-sm text-gray-500">
          Latest service requests from users with payment details
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
                "Payment",
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
            {serviceRequests?.length > 0 ? (
              serviceRequests.map((request, i) => (
                <tr key={`${request.id}-${i}`}>
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
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {request.payment ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className="font-medium">
                            {formatCurrency(request.payment.amount ?? 0)}
                          </span>
                          {request.payment.status && (
                            <StatusBadge status={request.payment.status} />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Admin:{" "}
                          {formatCurrency(request.payment.platformFee ?? 0)} |{" "}
                          Workshop:{" "}
                          {formatCurrency(request.payment.workshopAmount ?? 0)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No payment</span>
                    )}
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

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="mt-4">
        <button
          className={`w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium
            ${
              hasMore
                ? "text-gray-700 hover:bg-gray-50"
                : "text-gray-400 cursor-not-allowed"
            }
            ${loading ? "bg-gray-100" : ""}`}
          onClick={loadMoreRequests}
          disabled={loading || !hasMore}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : hasMore ? (
            "View More Requests"
          ) : (
            "No More Requests"
          )}
        </button>
      </div>
    </Card>
  );
};

export function DashboardContent() {
  // State
  const [data, setData] = useState({
    userStats: { total: 0, growth: 0 },
    workshopStats: { total: 0, pending: 0, new: 0 },
    serviceRequestStats: {
      total: 0,
      growth: 0,
      new: 0,
      inProgress: 0,
      completed: 0,
    },
    revenueStats: {
      total: 0,
      growth: 0,
      pending: 0,
      adminFee: { total: 0, growth: 0, pending: 0 },
      workshopAmount: { total: 0, pending: 0 },
    },
    serviceDistribution: [],
    paymentDistribution: [],
    userGrowth: [],
    revenueTrend: [],
    recentServiceRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format helpers
  const formatCurrency = (value) =>
    `₹${parseFloat(value).toLocaleString("en-IN")}`;
  const formatPercentage = (value) => `${value >= 0 ? "+" : ""}${value}%`;

  // Fetch initial dashboard data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/admin_side/dashboard/");
        if (isMounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (isMounted) setError(err.message || "Something went wrong");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 minutes
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
  } = data;

  // Revenue distribution data
  const feeBreakdownData = [
    {
      name: "Platform Fee",
      value: revenueStats.adminFee?.total || 0,
      fill: CHART_COLORS.adminFee,
    },
    {
      name: "Workshop Amount",
      value: revenueStats.workshopAmount?.total || 0,
      fill: CHART_COLORS.workshopAmount,
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value={userStats.total.toLocaleString()}
          change={formatPercentage(userStats.growth)}
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
            />
          </div>
        </SummaryCard>

        <SummaryCard
          title="Total Workshops"
          value={workshopStats.total.toLocaleString()}
          change={`${workshopStats.new || 0} new`}
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
          change={formatPercentage(serviceRequestStats.growth)}
          icon={FileCheck}
        >
          <div className="mt-3 flex flex-wrap gap-1 text-xs">
            {[
              {
                label: "New",
                value: serviceRequestStats.new,
                className: "bg-blue-50 text-blue-700",
              },
              {
                label: "In Progress",
                value: serviceRequestStats.inProgress,
                className: "bg-amber-50 text-amber-700",
              },
              {
                label: "Completed",
                value: serviceRequestStats.completed,
                className: "bg-emerald-50 text-emerald-700",
              },
            ].map((item) => (
              <span
                key={item.label}
                className={`px-2 py-1 rounded-full ${item.className}`}
              >
                {item.value} {item.label}
              </span>
            ))}
          </div>
        </SummaryCard>

        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(revenueStats.total)}
          change={formatPercentage(revenueStats.growth)}
          icon={DollarSign}
        >
          <div className="mt-3 flex flex-wrap gap-1 text-xs">
            <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 flex items-center">
              <Wallet className="mr-1 h-3 w-3" /> Admin Fee:{" "}
              {formatCurrency(revenueStats.adminFee?.total || 0)}
            </span>
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 flex items-center">
              <Clock className="mr-1 h-3 w-3" /> Pending:{" "}
              {formatCurrency(revenueStats.pending)}
            </span>
          </div>
        </SummaryCard>
      </div>

      {/* Admin Fee & Workshop Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {["adminFee", "workshopAmount"].map((type, i) => (
          <SummaryCard
            key={type}
            title={
              type === "adminFee" ? "Admin Fee Revenue" : "Workshop Revenue"
            }
            value={formatCurrency(revenueStats[type]?.total || 0)}
            change={formatPercentage(
              type === "adminFee"
                ? revenueStats[type]?.growth || 0
                : revenueStats.growth
            )}
            icon={type === "adminFee" ? Wallet : Wrench}
          >
            <div className="mt-3 text-xs">
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 flex items-center w-fit">
                <Clock className="mr-1 h-3 w-3" />{" "}
                {formatCurrency(revenueStats[type]?.pending || 0)} pending
              </span>
            </div>
          </SummaryCard>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Distribution Pie Chart */}
        <ChartCard
          title="Revenue Distribution"
          description="Breakdown of admin fees vs workshop payouts"
        >
          <PieChart>
            <Pie
              data={feeBreakdownData}
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
              {feeBreakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `₹${value.toLocaleString("en-IN")}`,
                "Amount",
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ChartCard>

        {/* Service Distribution Bar Chart */}
        {serviceDistribution?.length > 0 && (
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
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar
                dataKey="count"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartCard>
        )}
      </div>

      {/* User Growth Line Chart */}
      {userGrowth?.length > 0 && (
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
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line
              type="monotone"
              dataKey="count"
              name="Users"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartCard>
      )}

      {/* Payment Status Distribution */}
      {paymentDistribution?.some((item) => item.value > 0) && (
        <ChartCard
          title="Payment Status Distribution"
          description="Breakdown of payment status with fee allocation"
        >
          <ComposedChart
            data={paymentDistribution}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(value, name) => {
                const labels = {
                  value: "Total Amount",
                  platformFee: "Admin Fee",
                  workshopAmount: "Workshop Amount",
                };
                return [
                  `₹${value.toLocaleString("en-IN")}`,
                  labels[name] || name,
                ];
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              name="Total Amount"
              fill={CHART_COLORS.primary}
              radius={[4, 4, 0, 0]}
            >
              {paymentDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[entry.status] || "#9ca3af"}
                />
              ))}
            </Bar>
            <Bar
              dataKey="platformFee"
              name="Admin Fee"
              fill={CHART_COLORS.adminFee}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="workshopAmount"
              name="Workshop Amount"
              fill={CHART_COLORS.workshopAmount}
              radius={[4, 4, 0, 0]}
            />
          </ComposedChart>
        </ChartCard>
      )}

      {/* Recent Service Requests with Pagination */}
      <ServiceRequestsTable initialRequests={recentServiceRequests} />
    </div>
  );
}
