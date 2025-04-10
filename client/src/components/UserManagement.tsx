import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRobloxUser } from '@/hooks/useRobloxUser';

// Define the User type based on the API response
interface User {
  id: number;
  username: string;
  role: "user" | "admin" | "owner";
  createdAt: string;
  tokenCount: number;
  adsWatched: number;
  gameCompleted: boolean;
}

interface UserManagementProps {
  isOwner: boolean;
}

export default function UserManagement({ isOwner }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{ [key: string]: string }>({});
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [updateSuccess, setUpdateSuccess] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const { user: currentUser } = useRobloxUser();

  // Function to fetch users from the API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create basic auth header using current user credentials
      const authHeader = 'Basic ' + btoa(`${currentUser?.username}:${currentUser?.password}`);
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': authHeader
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users. Access denied.');
      }
      
      const data = await response.json();
      setUsers(data);
      
      // Initialize selectedRole state with current roles
      const initialRoles: { [key: string]: string } = {};
      data.forEach((user: User) => {
        initialRoles[user.username] = user.role;
      });
      setSelectedRole(initialRoles);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      toast({
        title: 'Error',
        description: 'Failed to load users.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  // Function to update a user's role
  const updateUserRole = async (username: string, newRole: string) => {
    // Don't update if role hasn't changed
    if (selectedRole[username] === newRole) return;
    
    // Don't allow non-owners to set owner role
    if (newRole === 'owner' && !isOwner) {
      toast({
        title: 'Permission Denied',
        description: 'Only owners can promote users to owner role.',
        variant: 'destructive',
      });
      return;
    }
    
    setUpdating({ ...updating, [username]: true });
    
    try {
      // Create basic auth header using current user credentials
      const authHeader = 'Basic ' + btoa(`${currentUser?.username}:${currentUser?.password}`);
      
      const response = await fetch(`/api/admin/users/${username}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user role');
      }
      
      // Update was successful
      setUpdateSuccess({ ...updateSuccess, [username]: true });
      setTimeout(() => {
        setUpdateSuccess({ ...updateSuccess, [username]: false });
      }, 3000);
      
      toast({
        title: 'Role Updated',
        description: `User ${username} role updated to ${newRole}`,
      });
      
      // Refresh user list
      fetchUsers();
      
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setUpdating({ ...updating, [username]: false });
    }
  };

  // Filter out the current user from the list to prevent self-demotion
  const filteredUsers = users.filter(u => u.username !== currentUser?.username);

  if (loading) {
    return <div className="flex justify-center p-8">Loading user data...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!isOwner && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>
              As an admin, you can only promote users to admin role. Owner privileges are required to assign the owner role.
            </AlertDescription>
          </Alert>
        )}
        
        <Table>
          <TableCaption>List of all users in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No users found</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      user.role === 'owner' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Select
                        value={selectedRole[user.username]}
                        onValueChange={(value) => setSelectedRole({...selectedRole, [user.username]: value})}
                        disabled={updating[user.username]}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={() => updateUserRole(user.username, selectedRole[user.username])}
                        disabled={user.role === selectedRole[user.username] || updating[user.username]}
                        size="sm"
                      >
                        {updating[user.username] ? 'Updating...' : 'Update'}
                      </Button>
                      
                      {updateSuccess[user.username] && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}