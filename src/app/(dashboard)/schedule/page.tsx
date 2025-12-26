import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEvents } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CalendarCheck, FileText, Video } from "lucide-react";

export default function SchedulePage() {

  const getEventTypeProps = (type: string) => {
    switch (type) {
      case 'Live Class':
        return { icon: Video, color: 'bg-blue-500' };
      case 'Quiz Due':
        return { icon: CalendarCheck, color: 'bg-red-500' };
      case 'Assignment':
        return { icon: FileText, color: 'bg-yellow-500' };
      default:
        return { icon: Video, color: 'bg-gray-500' };
    }
  }
  
  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
            <CardContent className="p-0">
                <Calendar
                    mode="single"
                    className="p-3 w-full"
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-4 w-full",
                        table: "w-full border-collapse space-y-1",
                        row: "flex w-full mt-2",
                        cell: "h-16 w-full text-center text-sm p-1 relative [&:has([aria-selected])]:bg-accent/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                        day: "h-full w-full p-1 font-normal aria-selected:opacity-100",
                        day_selected: "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md",
                        day_today: "bg-secondary text-secondary-foreground rounded-md",
                    }}
                />
            </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Today's Agenda</CardTitle>
            <CardDescription>All events scheduled for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvents.map((event) => {
                const { icon: Icon, color } = getEventTypeProps(event.type);
                return (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className={cn("mt-1 flex h-8 w-8 items-center justify-center rounded-full text-white", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.course}</p>
                      <p className="text-sm font-medium text-primary">{event.startTime}</p>
                    </div>
                    <Badge variant="outline" className="mt-1">{event.type}</Badge>
                  </div>
                )
              })}
               {mockEvents.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p>No events scheduled for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
