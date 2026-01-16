'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/users-slice';
import { UserFormData } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/user/profile-form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateUser({ id: user.id, data })).unwrap();
      toast({ title: 'Success', description: 'Profile updated successfully' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleColor: Record<typeof user.role, string> = {
    superadmin: 'bg-red-400 text-red-800 dark:bg-red-900 dark:text-red-200',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account information</p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge className={`mt-2 ${roleColor[user.role]}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                User ID
              </p>
              <p className="font-mono text-sm">{user.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Member Since
              </p>
              <p className="text-sm">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access Level
              </p>
              <p className="text-sm capitalize">{user.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="text-sm break-all">{user.email}</p>
            </div>
            {user.phone && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </p>
                <p className="text-sm">{user.phone}</p>
              </div>
            )}
            {user.address && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </p>
                <p className="text-sm">{user.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm
            user={user}
            isLoading={isSubmitting}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Password</h4>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <button className="text-primary hover:underline text-sm font-medium">
              Change Password
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <button className="text-primary hover:underline text-sm font-medium">
              Enable 2FA
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Active Sessions</h4>
              <p className="text-sm text-muted-foreground">1 device logged in</p>
            </div>
            <button className="text-primary hover:underline text-sm font-medium">
              Manage Sessions
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
