import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface UserListProps {
  users: User[]
}

 export interface User {
    id: string
    name: string
    profileImage: string
    activeSince: string
    type: "Customer" | "Investor" | "Guarantor"
  }
  
export default function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return <div className="flex justify-center items-center h-40 text-muted-foreground">No users found</div>
  }

  return (
    <div className="space-y-4 p-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden hover:shadow-md transition-all duration-200  border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-700/30 hover:border-cyan-500/50 dark:hover:border-cyan-500/30">
          <CardContent className="p-0">
            <div className="flex items-center p-4 gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Active since: {user.activeSince}</p>
              </div>

              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {user.type}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
