import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

interface UserListProps {
  users: User[]
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'CUSTOMER' | 'ADMIN' | 'INVESTOR' | 'GUARANTOR'; // Add other roles if applicable
  companyId: string;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date if you parse it
  profileImage?: string; // Optional, in case some users don't have a profile image
};

  
export default function UserList({ users }: UserListProps) {
if (!users) {
  return (
   <Box
  sx={{
    px: 4,
    py: 6,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  }}
  className="text-muted-foreground h-40"
>
  <Skeleton
    sx={{
      bgcolor: '#f8f8f221',
      border: '1px solid #e2e8f0', // ✅ Tailwind border-slate-200
      borderRadius: 2,             // OR use '8px' directly
      width: {
        xs: '100%',
        sm: '100%',
        md: '100%',
        lg: '100%',
      },
      height: {
        xs: 100,
        sm: 120,
        md: 120,
      },
    }}
    variant="rectangular"
  />
</Box>


  );
}
  return (
    <div className="space-y-4 p-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden hover:shadow-md transition-all duration-200  border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700/30 hover:border-cyan-500/50 dark:hover:border-cyan-500/30">
          <CardContent className="p-0">
            <div className="flex items-center p-4 gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={user?.profileImage || "/placeholder.svg"} alt={user?.firstName} />
                <AvatarFallback>{user.firstName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-medium text-lg">{user.firstName + " " + user.lastName}</h3>
                <p className="text-sm text-muted-foreground">Active since: {user.updatedAt}</p>
              </div>

              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
