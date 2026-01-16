"use client";

// Highlighting changes: Import from your local UI library
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

type Props = {
  label: string;
  balance: number;
  currency?: string;
};

export function BalanceCard({ label, balance, currency = "USD" }: Props) {
  // Format the currency nicely using Intl.NumberFormat
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(balance);

  return (
    <Card>
      <CardHeader className="pb-2">
        {/* Highlighting changes: Use CardTitle for semantic heading and consistent size */}
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Highlighting changes: Improved typography and layout */}
        <div className="text-2xl font-bold">
          {formattedBalance}
        </div>
      </CardContent>
    </Card>
  );
}