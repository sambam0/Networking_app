import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  TrendingUp,
  Activity,
  Globe,
  UserPlus
} from "lucide-react";

interface AnalyticsData {
  eventTimeDistribution: Array<{
    hour: number;
    count: number;
    label: string;
  }>;
  eventDayDistribution: Array<{
    day: string;
    count: number;
  }>;
  userRegistrationTrend: Array<{
    date: string;
    count: number;
    cumulative: number;
  }>;
  locationDistribution: Array<{
    location: string;
    userCount: number;
    eventCount: number;
  }>;
  eventLocationDistribution: Array<{
    location: string;
    count: number;
  }>;
  userActivityHeatmap: Array<{
    hour: number;
    day: string;
    activity: number;
  }>;
  accountCreationByMonth: Array<{
    month: string;
    count: number;
    provider: string;
  }>;
  topStates: Array<{
    state: string;
    count: number;
  }>;
  topColleges: Array<{
    college: string;
    count: number;
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/admin/analytics'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Timing Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Event Time Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              When events are typically scheduled throughout the day
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.eventTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="label" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [`${value} events`, 'Count']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Day Distribution
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Which days of the week are most popular for events
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.eventDayDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value, name) => [`${value} events`, 'Count']} />
                <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Registration and Activity Trends */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Registration Trend
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Daily user registrations and cumulative growth
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.userRegistrationTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} ${name === 'count' ? 'new users' : 'total users'}`, 
                    name === 'count' ? 'Daily' : 'Cumulative'
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Creation by Auth Method
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Monthly breakdown of registration methods
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.accountCreationByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              User Locations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Where users are from (by state)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topStates}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ state, percent }) => `${state} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.topStates.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} users`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Event Locations
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Where events are being held
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {analytics.eventLocationDistribution.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">
                    {location.location}
                  </span>
                  <Badge variant="secondary" className="shrink-0">
                    {location.count} events
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Colleges
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most represented educational institutions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {analytics.topColleges.map((college, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate flex-1 mr-2">
                    {college.college}
                  </span>
                  <Badge variant="outline" className="shrink-0">
                    {college.count} users
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Location Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Activity Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Combined view of user and event distribution by location
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analytics.locationDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="location" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value, name) => [
                  `${value} ${name === 'userCount' ? 'users' : 'events'}`, 
                  name === 'userCount' ? 'Users' : 'Events'
                ]}
              />
              <Bar dataKey="userCount" fill="#8884d8" name="Users" />
              <Bar dataKey="eventCount" fill="#82ca9d" name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}