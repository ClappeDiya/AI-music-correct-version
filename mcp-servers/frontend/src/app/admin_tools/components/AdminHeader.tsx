"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Bell, Search } from "lucide-react";
import { useState } from "react";

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("Search query:", searchQuery);
    }
  };

  return (
    <div className="flex h-16 items-center px-4 border-b">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="ml-auto flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 w-[200px] lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600" />
        </Button>
      </div>
    </div>
  );
}
