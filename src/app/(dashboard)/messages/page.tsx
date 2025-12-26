import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockUser } from "@/lib/data";
import { Paperclip, Search, Send, Smile } from "lucide-react";

export default function MessagesPage() {
  const contacts = [
    { name: 'Dr. Evelyn Reed', message: 'Sounds good, I will review it.', time: '5m', online: true, avatar: 'https://picsum.photos/seed/prof1/100/100' },
    { name: 'Maria Garcia', message: 'Yes, the deadline is Friday.', time: '1h', online: false, avatar: 'https://picsum.photos/seed/prof2/100/100' },
    { name: 'Design Principles Group', message: 'Alex: Here is my part.', time: '3h', online: true, avatar: 'https://picsum.photos/seed/group1/100/100' },
  ];
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <Card className="h-[calc(100vh-10rem)] w-full grid md:grid-cols-3 lg:grid-cols-4">
      <div className="md:col-span-1 lg:col-span-1 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y">
            {contacts.map(contact => (
              <div key={contact.name} className="p-4 flex gap-4 cursor-pointer hover:bg-secondary/50">
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-xs text-muted-foreground">{contact.time}</p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full">
        <div className="p-4 border-b flex items-center gap-4">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/prof1/100/100" />
            <AvatarFallback>ER</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg">Dr. Evelyn Reed</h2>
            <p className="text-sm text-green-500">Online</p>
          </div>
        </div>
        <ScrollArea className="flex-1 p-6 bg-secondary/30">
          <div className="space-y-6">
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/prof1/100/100" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <div className="bg-background p-3 rounded-lg rounded-bl-none max-w-lg shadow">
                <p>Hi Alex, I've received your submission for the final project. It looks promising.</p>
                <p className="text-xs text-muted-foreground text-right mt-1">10:30 AM</p>
              </div>
            </div>
            <div className="flex items-end gap-2 justify-end">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-br-none max-w-lg shadow">
                <p>Great to hear! I had a question about the optional performance optimization task. Is it okay if I use Web Workers?</p>
                <p className="text-xs text-primary-foreground/70 text-right mt-1">10:32 AM</p>
              </div>
               <Avatar className="h-8 w-8">
                <AvatarImage src={mockUser.avatarUrl} />
                <AvatarFallback>{getInitials(mockUser.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-end gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/prof1/100/100" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
              <div className="bg-background p-3 rounded-lg rounded-bl-none max-w-lg shadow">
                <p>Absolutely, that's an excellent approach. Sounds good, I will review it.</p>
                <p className="text-xs text-muted-foreground text-right mt-1">10:35 AM</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Input placeholder="Type a message..." className="pr-28" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
              <Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon"><Paperclip className="h-5 w-5" /></Button>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
