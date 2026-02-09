/**
 * Segments Page
 * Manage reusable push notification segments
 */

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Users,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  useSegments,
  useSegment,
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
  useSegmentPreview,
} from "@/hooks/usePushBroadcast";
import { SegmentRuleBuilder } from "@/components/admin/push/SegmentRuleBuilder";
import AdminProtectedRoute from "@/components/auth/AdminProtectedRoute";
import type { SegmentRules, PushSegment } from "@/lib/pushBroadcast";

function SegmentsPageContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<SegmentRules>({});

  const { data: segments, isLoading } = useSegments();
  const { data: editSegment } = useSegment(editId || undefined);
  const createMutation = useCreateSegment();
  const updateMutation = useUpdateSegment();
  const deleteMutation = useDeleteSegment();
  const { data: preview } = useSegmentPreview(rules, isCreateOpen || !!editId);

  // Load edit segment data
  useState(() => {
    if (editSegment) {
      setName(editSegment.name);
      setDescription(editSegment.description || "");
      setRules(editSegment.rules_json);
    }
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name,
      description,
      rules_json: rules,
      estimated_count: preview?.count || 0,
    });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await updateMutation.mutateAsync({
      id: editId,
      updates: {
        name,
        description,
        rules_json: rules,
        estimated_count: preview?.count || 0,
      },
    });
    closeEdit();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMutation.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (segment: PushSegment) => {
    setName(segment.name);
    setDescription(segment.description || "");
    setRules(segment.rules_json);
    setSearchParams({ edit: segment.id });
  };

  const closeEdit = () => {
    setSearchParams({});
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRules({});
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/push")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Segments</h1>
          <p className="text-muted-foreground">
            Create reusable audience segments for targeting
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Segment
        </Button>
      </div>

      {/* Segments List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Segments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : segments && segments.length > 0 ? (
            <div className="space-y-3">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{segment.name}</p>
                      {segment.description && (
                        <p className="text-sm text-muted-foreground">
                          {segment.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          ~{segment.estimated_count.toLocaleString()} users
                        </Badge>
                        {!segment.is_active && (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(segment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(segment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No segments yet</p>
              <p className="text-sm">Create your first segment to start targeting users</p>
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Segment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editId} onOpenChange={(open) => {
        if (!open) {
          if (editId) closeEdit();
          else setIsCreateOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Segment" : "Create Segment"}
            </DialogTitle>
            <DialogDescription>
              Define rules to target specific user groups
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Segment Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Inactive Customers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this segment used for?"
                rows={2}
              />
            </div>

            <SegmentRuleBuilder
              rules={rules}
              onChange={setRules}
              showPreview={true}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (editId) closeEdit();
                else setIsCreateOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editId ? handleUpdate : handleCreate}
              disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editId ? "Save Changes" : "Create Segment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Segment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Campaigns using this segment will need to select a new segment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function SegmentsPage() {
  return (
    <AdminProtectedRoute allowedRoles={["admin", "super_admin", "operations"]}>
      <SegmentsPageContent />
    </AdminProtectedRoute>
  );
}
