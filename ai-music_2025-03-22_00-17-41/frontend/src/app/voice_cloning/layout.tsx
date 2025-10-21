import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Mic, Box, Activity, Users, Settings } from "lucide-react";
import Link from "next/link";

export default function VoiceCloningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="border-b">
        <div className="container flex h-16 items-center gap-6">
          <Tabs defaultValue="record">
            <TabsList>
              <Link href="/voice_cloning/record">
                <TabsTrigger value="record">
                  <Mic className="h-4 w-4 mr-2" />
                  Record
                </TabsTrigger>
              </Link>
              <Link href="/voice_cloning/models">
                <TabsTrigger value="models">
                  <Box className="h-4 w-4 mr-2" />
                  Models
                </TabsTrigger>
              </Link>
              <Link href="/voice_cloning/analytics">
                <TabsTrigger value="analytics">
                  <Activity className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </Link>
              <Link href="/voice_cloning/collaboration">
                <TabsTrigger value="collaboration">
                  <Users className="h-4 w-4 mr-2" />
                  Collaboration
                </TabsTrigger>
              </Link>
              <Link href="/voice_cloning/settings">
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>
      {children}
    </div>
  );
} 

