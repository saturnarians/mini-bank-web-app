'use client';
import React from 'react';
import { LoginForm } from '@/components/public/login-form';
import { PageWrapper } from '@/components/public/page-wrapper';

export default function LoginPage() {
    return (
        <div className="flex justify-center items-center py-6 w-auto border border-border m-8 rounded-lg shadow-lg">
        <PageWrapper isActive={true}>
        <LoginForm />
        </PageWrapper>
        </div>
    )
};

