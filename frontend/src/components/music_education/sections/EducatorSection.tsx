"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Search, Pencil, Trash2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Educator, musicEducationApi } from "@/services/music_education/api";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

// Temporary EducatorCard component
function EducatorCard({ 
  educator, 
  onEdit, 
  onDelete 
}: { 
  educator: Educator; 
  onEdit: (educator: Educator) => void; 
  onDelete: (id: number) => void 
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{educator.name?.charAt(0) || 'E'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium text-lg">{educator.name}</h3>
            {educator.specialization && (
              <p className="text-sm text-muted-foreground mb-2">{educator.specialization}</p>
            )}
            {educator.bio && (
              <p className="text-sm text-muted-foreground mt-2">{educator.bio}</p>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => onEdit(educator)}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(educator.id)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Temporary CreateEducatorDialog component
function CreateEducatorDialog({
  open,
  onOpenChange,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Educator>>({
    name: '',
    specialization: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await musicEducationApi.createEducator(formData);
      onSuccess();
      setFormData({
        name: '',
        specialization: '',
        bio: ''
      });
    } catch (error) {
      console.error("Failed to create educator:", error);
      toast.error("Failed to create educator");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Educator</DialogTitle>
          <DialogDescription>
            Add a new educator to your team.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create Educator</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Temporary EditEducatorDialog component
function EditEducatorDialog({
  educator,
  open,
  onOpenChange,
  onSuccess
}: {
  educator: Educator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<Partial<Educator>>({
    name: '',
    specialization: '',
    bio: ''
  });

  useEffect(() => {
    if (educator) {
      setFormData({
        name: educator.name,
        specialization: educator.specialization,
        bio: educator.bio
      });
    }
  }, [educator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!educator) return;
    
    try {
      await musicEducationApi.updateEducator(educator.id, formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to update educator:", error);
      toast.error("Failed to update educator");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Educator</DialogTitle>
          <DialogDescription>
            Update educator information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-specialization">Specialization</Label>
            <Input
              id="edit-specialization"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Update Educator</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EducatorSection() {
  const [educators, setEducators] = useState<Educator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEducator, setSelectedEducator] = useState<Educator | null>(null);

  useEffect(() => {
    loadEducators();
  }, []);

  const loadEducators = async () => {
    try {
      const response = await musicEducationApi.getEducators();
      setEducators(response);
    } catch (error) {
      console.error("Failed to load educators:", error);
      toast.error("Failed to load educators");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadEducators();
    toast.success("Educator created successfully");
  };

  const handleEditSuccess = () => {
    setSelectedEducator(null);
    loadEducators();
    toast.success("Educator updated successfully");
  };

  const handleDelete = async (id: number) => {
    try {
      await musicEducationApi.deleteEducator(id);
      loadEducators();
      toast.success("Educator deleted successfully");
    } catch (error) {
      console.error("Failed to delete educator:", error);
      toast.error("Failed to delete educator");
    }
  };

  const filteredEducators = educators.filter((educator) =>
    educator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    educator.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search educators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Educator
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEducators.map((educator) => (
          <EducatorCard
            key={educator.id}
            educator={educator}
            onEdit={() => setSelectedEducator(educator)}
            onDelete={() => handleDelete(educator.id)}
          />
        ))}
        {filteredEducators.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No educators found matching your search criteria.
            </CardContent>
          </Card>
        )}
      </div>

      <CreateEducatorDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />

      <EditEducatorDialog
        open={!!selectedEducator}
        onOpenChange={() => setSelectedEducator(null)}
        educator={selectedEducator}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
