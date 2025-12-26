import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockResources } from "@/lib/data";
import { Download, FileText, Search, SlidersHorizontal, Video, Presentation } from "lucide-react";
import Image from "next/image";

export default function ResourcesPage() {
    const getResourceTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <FileText className="h-8 w-8 text-destructive" />;
            case 'Video':
                return <Video className="h-8 w-8 text-blue-500" />;
            case 'Slides':
                return <Presentation className="h-8 w-8 text-yellow-500" />;
            default:
                return <FileText className="h-8 w-8 text-muted-foreground" />;
        }
    }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search resources..." className="pl-10" />
                </div>
                <div className="flex gap-4">
                    <Select>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="slides">Slides</SelectItem>
                        </SelectContent>
                    </Select>
                     <Button variant="outline" size="icon">
                        <SlidersHorizontal className="h-5 w-5" />
                        <span className="sr-only">Filters</span>
                    </Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mockResources.map((resource) => (
          <Card key={resource.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{resource.title}</CardTitle>
              {getResourceTypeIcon(resource.type)}
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-xs text-muted-foreground">Course: {resource.course}</p>
              <p className="text-xs text-muted-foreground">Added: {resource.dateAdded}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
