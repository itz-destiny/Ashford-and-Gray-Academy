import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { mockCourses, mockEvents } from "@/lib/data";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { month: "January", progress: 65 },
  { month: "February", progress: 59 },
  { month: "March", progress: 80 },
  { month: "April", progress: 81 },
  { month: "May", progress: 56 },
  { month: "June", progress: 70 },
]

const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const activeCourses = mockCourses.filter(c => c.progress > 0 && c.progress < 100);
  
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (grade >= 80) return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (grade >= 70) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>
              Pick up where you left off in your active courses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCourses.slice(0, 3).map((course) => (
              <div key={course.id}>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{course.title}</h4>
                  <span className="text-sm font-medium text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} aria-label={`${course.title} progress`} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your schedule for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockEvents.map((event) => (
                <li key={event.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.course}</p>
                    <p className="text-sm text-muted-foreground">{event.startTime}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>Your latest assessment results.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Advanced JavaScript</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getGradeColor(92)}>A (92%)</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Python for Data Analysis</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getGradeColor(85)}>B (85%)</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Principles of UX/UI Design</TableCell>
                  <TableCell className="text-right">
                    <Badge className={getGradeColor(98)}>A+ (98%)</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
            <CardDescription>Modules completed over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="progress" fill="var(--color-progress)" radius={4} />
                </BarChart>
              </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
