'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateProfile } from '@/store/slices/auth-slice';
import { UserFormData } from '@/lib/schemas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileForm } from '@/components/user/profile/profile-form';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Shield, Upload, FileText, Camera, CheckCircle2, XCircle, Clock3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAccountsQuery, useUpdateAccountMutation } from '@/store/services/accountsApi';
import type { AccountType } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingId, setIsUploadingId] = useState(false);
  const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);
  const [accountDrafts, setAccountDrafts] = useState<Record<string, AccountType>>({});
  const { toast } = useToast();
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const idInputRef = useRef<HTMLInputElement | null>(null);

  const { data: accounts = [], isLoading: accountsLoading } = useGetAccountsQuery({});
  const [updateAccount] = useUpdateAccountMutation();

  if (!user) {
    return null;
  }

  const handleSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        updateProfile({
          name: data.name,
          phone: data.phone,
          address: data.address,
        }),
      ).unwrap();
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

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });

  const onProfilePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Profile photo must be an image', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Use an image under 5MB', variant: 'destructive' });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const profilePhotoUrl = await readFileAsDataUrl(file);
      await dispatch(updateProfile({ profilePhotoUrl })).unwrap();
      toast({ title: 'Photo updated', description: 'Your profile photo has been uploaded' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload profile photo',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const onIdCardSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) {
      toast({ title: 'Invalid file', description: 'Upload an image or PDF ID card', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Use a file under 10MB', variant: 'destructive' });
      return;
    }

    setIsUploadingId(true);
    try {
      const idCardUrl = await readFileAsDataUrl(file);
      await dispatch(
        updateProfile({
          idCardUrl,
          kycStatus: 'pending',
          kycUpdatedAt: new Date().toISOString(),
        }),
      ).unwrap();

      toast({
        title: 'ID submitted',
        description: 'Your ID card has been uploaded and KYC status is now pending',
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload ID card',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingId(false);
      event.target.value = '';
    }
  };

  const onAccountTypeChange = (accountId: string, value: AccountType) => {
    setAccountDrafts(prev => ({ ...prev, [accountId]: value }));
  };

  const onSaveAccount = async (accountId: string, currentType: AccountType) => {
    const nextType = accountDrafts[accountId] ?? currentType;
    if (nextType === currentType) {
      toast({ title: 'No changes', description: 'Select a different account type first' });
      return;
    }

    setUpdatingAccountId(accountId);
    try {
      await updateAccount({ id: accountId, data: { accountType: nextType } }).unwrap();
      toast({ title: 'Account updated', description: `Account type changed to ${nextType}` });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Could not update account',
        variant: 'destructive',
      });
    } finally {
      setUpdatingAccountId(null);
    }
  };

  const roleColor: Record<typeof user.role, string> = {
    superadmin: 'bg-red-400 text-red-800 dark:bg-red-900 dark:text-red-200',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    user: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const kycBadgeClass = useMemo(() => {
    switch (user.kycStatus) {
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  }, [user.kycStatus]);

  const kycLabel = user.kycStatus
    ? user.kycStatus.charAt(0).toUpperCase() + user.kycStatus.slice(1).replace('_', ' ')
    : 'Not submitted';

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
                {user.profilePhotoUrl ? (
                  <AvatarImage src={user.profilePhotoUrl} alt={user.name} />
                ) : null}
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile Photo Upload
            </CardTitle>
            <CardDescription>Upload an image for your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={onProfilePhotoSelected}
              disabled={isUploadingPhoto}
            />
            <Button
              variant="outline"
              className="gap-2"
              disabled={isUploadingPhoto}
              onClick={() => photoInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC & ID Verification
            </CardTitle>
            <CardDescription>Submit your ID card for KYC review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={kycBadgeClass}>
                {kycLabel}
              </Badge>
              {user.kycStatus === 'verified' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : null}
              {user.kycStatus === 'rejected' ? <XCircle className="h-4 w-4 text-red-600" /> : null}
              {user.kycStatus === 'pending' ? <Clock3 className="h-4 w-4 text-yellow-600" /> : null}
            </div>
            <Input
              ref={idInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={onIdCardSelected}
              disabled={isUploadingId}
            />
            <Button
              variant="outline"
              className="gap-2"
              disabled={isUploadingId}
              onClick={() => idInputRef.current?.click()}
            >
              <FileText className="h-4 w-4" />
              {isUploadingId ? 'Uploading...' : 'Upload ID Card'}
            </Button>
            {user.idCardUrl ? (
              <Button
                variant="ghost"
                className="px-0"
                onClick={() => window.open(user.idCardUrl, '_blank', 'noopener,noreferrer')}
              >
                View Uploaded ID
              </Button>
            ) : null}
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

      <Card>
        <CardHeader>
          <CardTitle>Account Update</CardTitle>
          <CardDescription>Update account type for your active accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountsLoading ? (
            <p className="text-sm text-muted-foreground">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts found.</p>
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg border p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{account.accountType} - ****{account.accountNumber.slice(-4)}</p>
                  <p className="text-sm text-muted-foreground">Status: {account.status}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={accountDrafts[account.id] ?? account.accountType}
                    onValueChange={(value: AccountType) => onAccountTypeChange(account.id, value)}
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    disabled={updatingAccountId === account.id}
                    onClick={() => onSaveAccount(account.id, account.accountType)}
                  >
                    {updatingAccountId === account.id ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            ))
          )}
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
