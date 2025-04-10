import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { useRobloxUser } from '@/hooks/useRobloxUser';

interface StatisticsResult {
  totalAdsWatched: number;
  totalTokensEarned: number;
  totalCodesRedeemed: number;
}

export default function AdminStatistics() {
  const { toast } = useToast();
  const { user } = useRobloxUser();
  const [timeRange, setTimeRange] = useState<'today' | 'specific' | 'month' | 'year'>('today');
  const [statistics, setStatistics] = useState<StatisticsResult | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch statistics when time range changes
  useEffect(() => {
    fetchStatistics();
  }, [timeRange, selectedDate, selectedMonth, selectedYear]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      let url = '';
      
      switch (timeRange) {
        case 'today':
          url = '/api/admin/statistics/today';
          break;
        case 'specific':
          if (!selectedDate) return;
          const dateStr = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
          url = `/api/admin/statistics/date/${dateStr}`;
          break;
        case 'month':
          url = `/api/admin/statistics/month/${selectedYear}/${selectedMonth}`;
          break;
        case 'year':
          url = `/api/admin/statistics/year/${selectedYear}`;
          break;
      }
      
      // Create basic auth header for admin API authentication
      const authHeader = user 
        ? 'Basic ' + btoa(`${user.username}:${(user as any).password}`) 
        : '';
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch statistics data',
        variant: 'destructive'
      });
      // Set empty statistics
      setStatistics({
        totalAdsWatched: 0,
        totalTokensEarned: 0,
        totalCodesRedeemed: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Generate year options (last 5 years to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="w-full sm:w-64">
          <Label htmlFor="time-range" className="mb-2 block">Time Range</Label>
          <Select 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="specific">Specific Day</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {timeRange === 'specific' && (
          <div className="w-full sm:w-auto">
            <Label className="mb-2 block">Select Date</Label>
            <DatePicker 
              date={selectedDate} 
              setDate={setSelectedDate}
              className="w-full"
            />
          </div>
        )}

        {timeRange === 'month' && (
          <>
            <div className="w-full sm:w-48">
              <Label className="mb-2 block">Month</Label>
              <Select 
                value={String(selectedMonth)} 
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Label className="mb-2 block">Year</Label>
              <Select 
                value={String(selectedYear)} 
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {timeRange === 'year' && (
          <div className="w-full sm:w-48">
            <Label className="mb-2 block">Year</Label>
            <Select 
              value={String(selectedYear)} 
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatisticCard 
          title="Total Ads Watched" 
          value={statistics?.totalAdsWatched || 0} 
          loading={isLoading}
          icon="📺"
        />
        <StatisticCard 
          title="Total Tokens Earned" 
          value={statistics?.totalTokensEarned || 0} 
          loading={isLoading}
          icon="🪙"
        />
        <StatisticCard 
          title="Total Codes Redeemed" 
          value={statistics?.totalCodesRedeemed || 0} 
          loading={isLoading}
          icon="🎮"
        />
      </div>
    </div>
  );
}

interface StatisticCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon: string;
}

function StatisticCard({ title, value, loading, icon }: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-xl">{icon}</span> {title}
        </CardTitle>
        <CardDescription>
          {loading ? 'Loading...' : title === 'Total Ads Watched' ? 'Number of ad views' : 
            title === 'Total Tokens Earned' ? 'Tokens earned by users' : 'Codes redeemed in Roblox'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>{value.toLocaleString()}</>
          )}
        </div>
      </CardContent>
    </Card>
  );
}