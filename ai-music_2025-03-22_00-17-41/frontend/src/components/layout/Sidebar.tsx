import { Home, Library, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";
import { Separator } from "../ui/Separator";

export function Sidebar() {
  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-background">
      <div className="flex-1 p-4 space-y-4">
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Library className="mr-2 h-4 w-4" />
            Library
          </Button>
        </nav>
        <Separator />
        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </div>
    </div>
  );
}
