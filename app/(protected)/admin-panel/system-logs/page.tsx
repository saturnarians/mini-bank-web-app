
export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemLogsPage() {
	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>System Logs</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">Audit and system logs will appear here.</p>
				</CardContent>
			</Card>
		</div>
	);
}
