import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Voice, AudioGeneration, UserStats } from "@shared/schema";
import {
  TbMicrophone, 
  TbFileText, 
  TbHourglassHigh, 
  TbUsers, 
  TbDownload, 
  TbArrowRight
} from "react-icons/tb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface UserStatsData {
  totalGenerations: number;
  totalCharacters: number;
  totalDuration: number;
  totalDownloads: number;
  recentActivity: {
    date: string;
    generations: number;
    characters: number;
  }[];
  popularVoices: {
    name: string;
    count: number;
  }[];
  monthlyQuota: number;
  remainingQuota: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState<UserStatsData | null>(null);
  
  const { data: userStats, isLoading: isLoadingStats } = useQuery<any>({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });
  
  const { data: generations, isLoading: isLoadingGenerations } = useQuery<AudioGeneration[]>({
    queryKey: ["/api/user/generations"],
    enabled: !!user,
  });
  
  const { data: voices, isLoading: isLoadingVoices } = useQuery<Voice[]>({
    queryKey: ["/api/voices"],
  });
  
  useEffect(() => {
    if (userStats && generations && voices) {
      // Calculate voice usage statistics
      const voiceUsage: Record<string, number> = {};
      generations.forEach(gen => {
        if (voiceUsage[gen.voiceId]) {
          voiceUsage[gen.voiceId]++;
        } else {
          voiceUsage[gen.voiceId] = 1;
        }
      });
      
      // Get voice names
      const popularVoices = Object.entries(voiceUsage)
        .map(([voiceId, count]) => {
          const voice = voices.find(v => v.id === voiceId);
          return {
            name: voice?.name || "Unknown",
            count
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Process recent activity
      const activity = userStats.recentActivity || [];
      const recentActivity = activity.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        generations: day.generationCount,
        characters: day.characterCount,
      }));
      
      // Set formatted stats data
      setStatsData({
        totalGenerations: userStats.totalGenerations || 0,
        totalCharacters: userStats.totalCharacters || 0,
        totalDuration: userStats.totalDuration || 0,
        totalDownloads: userStats.totalDownloads || 0,
        recentActivity,
        popularVoices,
        monthlyQuota: userStats.monthlyQuota || 100,
        remainingQuota: (userStats.monthlyQuota || 100) - (userStats.usedQuota || 0),
      });
    }
  }, [userStats, generations, voices]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };
  
  if (isLoadingStats || isLoadingGenerations || isLoadingVoices) {
    return (
      <div className="container mx-auto p-6 h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Voices</p>
                <h3 className="text-2xl font-bold">{statsData?.totalGenerations || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TbMicrophone size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-1">
            <p className="text-xs text-muted-foreground">
              Audio files you've created
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                <h3 className="text-2xl font-bold">{statsData?.totalDownloads || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                <TbDownload size={24} className="text-blue-500" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-1">
            <p className="text-xs text-muted-foreground">
              Audio files you've downloaded
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Characters Processed</p>
                <h3 className="text-2xl font-bold">{statsData?.totalCharacters?.toLocaleString() || 0}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TbFileText size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-1">
            <p className="text-xs text-muted-foreground">
              Total text length converted to speech
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Audio Duration</p>
                <h3 className="text-2xl font-bold">{formatTime(statsData?.totalDuration || 0)}</h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TbHourglassHigh size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-1">
            <p className="text-xs text-muted-foreground">
              Combined length of all audio
            </p>
          </CardFooter>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Quota</p>
                <h3 className="text-2xl font-bold">
                  {statsData?.remainingQuota || 0}/{statsData?.monthlyQuota || 100}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TbUsers size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-6 pt-1">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{
                  width: `${(statsData?.remainingQuota || 0) / (statsData?.monthlyQuota || 100) * 100}%`
                }}
              ></div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Your recent text-to-speech generation activity</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statsData?.recentActivity || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="generations" name="Generations" fill="#8884d8" />
                <Bar dataKey="characters" name="Characters (x100)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <Link href="/library">
              <Button variant="outline" className="w-full">
                View All Activity <TbArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Voices</CardTitle>
            <CardDescription>Your most used voices</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {statsData?.popularVoices?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsData?.popularVoices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="name"
                    label={(entry) => entry.name}
                  >
                    {statsData?.popularVoices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  You haven't used any voices yet
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Try Different Voices <TbArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
            <CardDescription>Your latest audio creations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="recent">
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Most Downloaded</TabsTrigger>
              </TabsList>
              <TabsContent value="recent" className="mt-6">
                {generations && generations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generations.slice(0, 6).map((generation) => (
                      <Card key={generation.id}>
                        <CardContent className="p-4">
                          <div className="font-medium">{generation.voiceName || "Unknown Voice"}</div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {generation.text.substring(0, 50)}
                            {generation.text.length > 50 ? "..." : ""}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="text-xs text-muted-foreground">
                              {generation.createdAt ? new Date(generation.createdAt).toLocaleDateString() : "Unknown date"}
                            </div>
                            <Link href="/library">
                              <Button variant="ghost" size="sm">Play</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No generations yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Create your first voice on the home page
                    </p>
                    <Link href="/">
                      <Button className="mt-4">Get Started</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="popular" className="mt-6">
                {generations && generations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...generations]
                      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                      .slice(0, 6)
                      .map((generation) => (
                        <Card key={generation.id}>
                          <CardContent className="p-4">
                            <div className="font-medium">{generation.voiceName || "Unknown Voice"}</div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {generation.text.substring(0, 50)}
                              {generation.text.length > 50 ? "..." : ""}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-xs text-muted-foreground">
                                {generation.downloadCount || 0} downloads
                              </div>
                              <Link href="/library">
                                <Button variant="ghost" size="sm">Play</Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium">No generations yet</h3>
                    <p className="text-muted-foreground mt-2">
                      Create your first voice on the home page
                    </p>
                    <Link href="/">
                      <Button className="mt-4">Get Started</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Link href="/library">
              <Button variant="outline" className="w-full">
                View All Generations <TbArrowRight className="ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}