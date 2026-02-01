'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from '@/store/slices/users-slice';
import { User } from '@/lib/types';
import { UserFormData } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserTable } from '@/components/user/user-table';
import { UserDialog } from '@/components/user/user-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle, Users, Shield, Crown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BaseProfile } from "@/components/shared/baseProfile";

export default function AdminPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: currentUser } = useAppSelector(state => state.auth);
  const { users, isLoading, error } = useAppSelector(state => state.users);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
    if (!users || users.length === 0) dispatch(fetchUsers());
  }, [dispatch]);

  const handleOpenDialog = (user?: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(undefined);
  };

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await dispatch(updateUser({ id: selectedUser.id, data })).unwrap();
        toast({ title: 'Success', description: 'User updated successfully' });
      } else {
        await dispatch(createUser(data)).unwrap();
        toast({ title: 'Success', description: 'User created successfully' });
      }
      handleCloseDialog();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast({ title: 'Success', description: 'User deleted successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const superAdmins = users.filter(u => u.role === 'superadmin').length;
  const admins = users.filter(u => u.role === 'admin').length;
  // const managers = users.filter(u => u.role === 'manager').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const canManageAdmins = currentUser?.role === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Administration</h1>
          {/* Admin Specific Info Card */}
        <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-mono text-lg">Welcome, {currentUser?.email}</p>
        </div>
        <BaseProfile />
        {/* Add more admin stats here if needed */}
       </div>
        </div>
        <Button onClick={() => handleOpenDialog()} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New User
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{users.length}</p>
            )}
          </CardContent>
        </Card>

        {canManageAdmins && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Super Admins</span>
                <Crown className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{superAdmins}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Admins</span>
              <Shield className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{admins}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Managers</span>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          {/* <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{managers}</p>
            )}
          </CardContent> */}
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Regular Users</span>
              <Users className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-bold">{regularUsers}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <Skeleton className="h-80 rounded-lg" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage system users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <UserTable
              users={users}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <UserDialog
        open={dialogOpen}
        user={selectedUser}
        isLoading={isSubmitting}
        onOpenChange={handleCloseDialog}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// adding this with the refactored code 
// useGetAccountsQuery({
//   status: 'active',
//   includeSuspended: isAdmin,
// });
