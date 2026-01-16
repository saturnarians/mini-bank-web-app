"use client";

import { useState } from "react";
// Highlighting changes: Import your Radix-based UI components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  email: string;
};

export function ProfileForm({ name, email }: Props) {
  const [values, setValues] = useState({ name, email });

  return (
    <form className="space-y-4 max-w-sm">
      {/* Highlighting changes: Wrapped in divs with Labels linked by htmlFor/id */}
      <div className="grid gap-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          placeholder="John Doe"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          placeholder="john@example.com"
        />
      </div>

      <Button type="submit" className="w-full">
        Save
      </Button>
    </form>
  );
}