import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminDashboard() {
  const { logout } = useAdmin();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={logout}>
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ad Configuration</CardTitle>
            <CardDescription>
              Manage your ad network settings and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Configure Google AdSense, AdMob, Ezoic, and Adsterra settings for your BloxToken app.
            </p>
            <Link href="/ad-config">
              <Button>Go to Ad Configuration</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Developer Guide</CardTitle>
            <CardDescription>
              Documentation and technical information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Access technical documentation for developers working with the BloxToken platform.
            </p>
            <Link href="/docs">
              <Button>View Developer Guide</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}