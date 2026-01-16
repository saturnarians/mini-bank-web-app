'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/auth-slice';

export function ProfileForm() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);
  const [name, setName] = useState(user?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ name }));
    
    if (updateProfile.fulfilled.match(result)) {
      alert('Profile updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
        placeholder="Your Name"
      />
      <button 
        type="submit" 
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Saving...' : 'Update Profile'}
      </button>
    </form>
  );
}