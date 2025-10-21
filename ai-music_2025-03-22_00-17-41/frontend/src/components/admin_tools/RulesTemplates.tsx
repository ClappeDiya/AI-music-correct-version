import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Settings, Book, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

export function RulesTemplates() {
  const [activeTab, setActiveTab] = useState("moderation-rules");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rules & Templates</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="moderation-rules">Moderation Rules</TabsTrigger>
          <TabsTrigger value="bulk-templates">Bulk Templates</TabsTrigger>
          <TabsTrigger value="compliance">Compliance References</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation-rules">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ModerationRuleCard />
            {/* Add more rule cards */}
          </div>
        </TabsContent>

        <TabsContent value="bulk-templates">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <BulkTemplateCard />
            {/* Add more template cards */}
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ComplianceReferenceCard />
            {/* Add more compliance cards */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ModerationRuleCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">
          Hate Speech Detection
        </CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Automatically detects and flags potential hate speech in content
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Edit
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BulkTemplateCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">
          Mass Content Removal
        </CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Template for removing multiple pieces of content that violate
            guidelines
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Use Template
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ComplianceReferenceCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-medium">GDPR Guidelines</CardTitle>
        <Book className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reference guide for GDPR compliance in content moderation
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              View Details
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
