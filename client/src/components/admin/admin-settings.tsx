import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Plus, Trash2, UserCheck, UserX, Settings } from "lucide-react";
import { type User } from "@shared/schema";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  isSystemAdmin: boolean;
  adminLevel: 'super' | 'standard' | 'readonly';
  grantedBy?: string;
  grantedAt?: string;
}

export function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminLevel, setNewAdminLevel] = useState<'super' | 'standard' | 'readonly'>('standard');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  // Fetch admin users
  const { data: adminUsers, isLoading } = useQuery({
    queryKey: ['/api/admin/admins'],
  });

  // Fetch admin settings
  const { data: adminSettings } = useQuery({
    queryKey: ['/api/admin/settings'],
  });

  // Add admin mutation
  const addAdminMutation = useMutation({
    mutationFn: async (data: { email: string; adminLevel: string }) => {
      return await apiRequest('/api/admin/admins', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Admin Added",
        description: "New admin user has been granted access successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
      setNewAdminEmail("");
      setIsAddingAdmin(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove admin mutation
  const removeAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest(`/api/admin/admins/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Admin Removed",
        description: "Admin privileges have been revoked successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update admin level mutation
  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, adminLevel }: { userId: number; adminLevel: string }) => {
      return await apiRequest(`/api/admin/admins/${userId}`, {
        method: 'PATCH',
        body: { adminLevel },
      });
    },
    onSuccess: () => {
      toast({
        title: "Admin Updated",
        description: "Admin privileges have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/admins'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddAdmin = () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    addAdminMutation.mutate({
      email: newAdminEmail.trim(),
      adminLevel: newAdminLevel,
    });
  };

  const getAdminLevelColor = (level: string) => {
    switch (level) {
      case 'super': return 'bg-red-500';
      case 'standard': return 'bg-blue-500';
      case 'readonly': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getAdminLevelDescription = (level: string) => {
    switch (level) {
      case 'super': return 'Full system access, can manage other admins';
      case 'standard': return 'Can view all data and manage users/events';
      case 'readonly': return 'Can only view data, no modification rights';
      default: return 'Unknown access level';
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Privilege Management
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage who has administrative access to RealConnect and their permission levels.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {adminUsers?.filter((admin: AdminUser) => admin.adminLevel === 'super').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Super Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {adminUsers?.filter((admin: AdminUser) => admin.adminLevel === 'standard').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Standard Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {adminUsers?.filter((admin: AdminUser) => admin.adminLevel === 'readonly').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Read-Only Admins</div>
            </div>
          </div>

          {/* Add New Admin */}
          <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Admin Privileges</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminEmail">User Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="user@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminLevel">Admin Level</Label>
                  <select
                    id="adminLevel"
                    value={newAdminLevel}
                    onChange={(e) => setNewAdminLevel(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="readonly">Read-Only Admin</option>
                    <option value="standard">Standard Admin</option>
                    <option value="super">Super Admin</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getAdminLevelDescription(newAdminLevel)}
                  </p>
                </div>
                <Button 
                  onClick={handleAddAdmin} 
                  disabled={addAdminMutation.isPending}
                  className="w-full"
                >
                  {addAdminMutation.isPending ? 'Adding...' : 'Grant Admin Access'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Current Administrators</CardTitle>
          <p className="text-sm text-muted-foreground">
            All users with administrative privileges and their access levels.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading admin users...</div>
            </div>
          ) : adminUsers && adminUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Admin Level</TableHead>
                  <TableHead>Granted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((admin: AdminUser) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {admin.isSystemAdmin && (
                          <Shield className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium">{admin.fullName || admin.username}</div>
                          <div className="text-sm text-muted-foreground">@{admin.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge className={`${getAdminLevelColor(admin.adminLevel)} text-white`}>
                        {admin.adminLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {admin.grantedAt ? new Date(admin.grantedAt).toLocaleDateString() : 'System'}
                        {admin.grantedBy && (
                          <div className="text-xs text-muted-foreground">by {admin.grantedBy}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {!admin.isSystemAdmin && (
                          <>
                            <select
                              value={admin.adminLevel}
                              onChange={(e) => updateAdminMutation.mutate({
                                userId: admin.id,
                                adminLevel: e.target.value,
                              })}
                              className="text-xs p-1 border rounded"
                              disabled={updateAdminMutation.isPending}
                            >
                              <option value="readonly">Read-Only</option>
                              <option value="standard">Standard</option>
                              <option value="super">Super</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAdminMutation.mutate(admin.id)}
                              disabled={removeAdminMutation.isPending}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {admin.isSystemAdmin && (
                          <Badge variant="outline" className="text-xs">
                            System Admin
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <div className="text-muted-foreground">No admin users found</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Access Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Access Level Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-red-500 text-white mt-1">super</Badge>
              <div>
                <div className="font-medium">Super Administrator</div>
                <div className="text-sm text-muted-foreground">
                  Full system access including user management, event management, admin privilege control, 
                  and all administrative functions. Can grant/revoke admin access for other users.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-500 text-white mt-1">standard</Badge>
              <div>
                <div className="font-medium">Standard Administrator</div>
                <div className="text-sm text-muted-foreground">
                  Can view all data, manage users and events, access analytics and reports. 
                  Cannot manage other admin privileges or modify system settings.
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-green-500 text-white mt-1">readonly</Badge>
              <div>
                <div className="font-medium">Read-Only Administrator</div>
                <div className="text-sm text-muted-foreground">
                  Can only view data and analytics. No modification rights for users, events, 
                  or system settings. Perfect for monitoring and reporting purposes.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}