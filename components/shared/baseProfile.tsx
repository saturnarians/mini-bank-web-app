"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfile, changePassword, logoutUser } from "@/store/slices/auth-slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BaseProfile({ children }: { children?: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isLoading, error } = useAppSelector((state) => state.auth);

  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(updateProfile(profileForm)).unwrap();
    alert("Profile updated!");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(changePassword(passwordForm)).unwrap();
    alert("Password changed!");
    setPasswordForm({ currentPassword: "", newPassword: "" });
  };

  return (
    <div className="space-y-8">
      {/* This is where Admin-specific info will appear */}
      {children}

      <section className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Update Profile</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <Input placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} />
          <Input placeholder="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
          <Input placeholder="Address" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} />
          <Button type="submit" disabled={isLoading}>Save Changes</Button>
        </form>
      </section>

      <section className="p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Security</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input type="password" placeholder="Current Password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
          <Input type="password" placeholder="New Password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
          <Button type="submit" disabled={isLoading} variant="outline">Update Password</Button>
        </form>
      </section>

      <Button variant="destructive" onClick={() => dispatch(logoutUser())}>Logout</Button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}