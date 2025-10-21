"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { useToast } from "@/components/ui/usetoast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface IdentityBridge {
  id: string;
  provider: string;
  type: string;
  isEnabled: boolean;
  config: Record<string, any>;
  createdAt: string;
}

export default function IdentityPage() {
  const { toast } = useToast();
  const [bridges, setBridges] = useState<IdentityBridge[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [providerName, setProviderName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchIdentityBridges();
  }, []);

  const fetchIdentityBridges = async () => {
    try {
      const response = await fetch("/api/identity-bridges");
      if (!response.ok) throw new Error("Failed to fetch identity bridges");
      const data = await response.json();
      setBridges(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load identity bridges",
        variant: "destructive",
      });
    }
  };

  const handleAddBridge = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/identity-bridges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          provider: providerName,
        }),
      });

      if (!response.ok) throw new Error("Failed to add identity bridge");

      await fetchIdentityBridges();
      setIsAddDialogOpen(false);
      setSelectedType("");
      setProviderName("");
      toast({
        title: "Success",
        description: "Identity bridge added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add identity bridge",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBridge = async (id: string, enable: boolean) => {
    try {
      const response = await fetch(`/api/identity-bridges/${id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enable }),
      });

      if (!response.ok) throw new Error("Failed to toggle identity bridge");

      await fetchIdentityBridges();
      toast({
        title: "Success",
        description: `Identity bridge ${enable ? "enabled" : "disabled"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle identity bridge",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Identity Providers</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Identity Provider
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Identity Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bridges.map((bridge) => (
                <TableRow key={bridge.id}>
                  <TableCell>{bridge.provider}</TableCell>
                  <TableCell>{bridge.type}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        bridge.isEnabled
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {bridge.isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleBridge(bridge.id, !bridge.isEnabled)
                      }
                    >
                      {bridge.isEnabled ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Identity Provider</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={setSelectedType} value={selectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSO">Single Sign-On</SelectItem>
                  <SelectItem value="BLOCKCHAIN">Blockchain</SelectItem>
                  <SelectItem value="OAUTH">OAuth</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provider Name</Label>
              <Input
                id="provider"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Enter provider name"
              />
            </div>
            <Button
              onClick={handleAddBridge}
              disabled={isLoading || !selectedType || !providerName}
            >
              {isLoading ? "Adding..." : "Add Identity Provider"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
