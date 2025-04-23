import React, { useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { ArrowRight, Mail, Plus, Users } from 'lucide-react'
import { Button } from './button'
import { Input } from "@/components/ui/input";
import { toast } from './use-toast';


export default function CustomerAccountCreation() {
      const [showCreateAccount, setShowCreateAccount] = useState(false);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [customerEmail, setCustomerEmail] = useState("");
      const emailInputRef = useRef(null);

       const handleCreateAccount = (e: any) => {
          e.preventDefault();
          if (!customerEmail) {
            toast({
              title: "Email required",
              description: "Please enter a customer email address",
              variant: "destructive",
            });
            return;
          }
      
          setIsSubmitting(true);
      
          // Simulate API call
          setTimeout(() => {
            setIsSubmitting(false);
            toast({
              title: "Invitation sent",
              description: `An account creation invitation has been sent to ${customerEmail}`,
            });
            setCustomerEmail("");
            setShowCreateAccount(false);
          }, 1500);
        };

  return (
    <div>
        {/* Customer Account Creation */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-cyan-500" />
                      Customer Account Management
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateAccount(!showCreateAccount)}
                      className="text-cyan-500 hover:text-cyan-600 dark:text-cyan-400 dark:hover:text-cyan-300"
                    >
                      {showCreateAccount ? "Cancel" : "Create Customer Account"}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showCreateAccount ? (
                    <form onSubmit={handleCreateAccount} className="space-y-4">
                      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 dark:from-cyan-500/5 dark:to-purple-500/5 p-4 rounded-lg border border-cyan-200/50 dark:border-cyan-800/30">
                        <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-white">
                          Create Customer Account
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                          Enter the customer's email address to send them an
                          invitation to create an account.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                            <Input
                              ref={emailInputRef}
                              type="email"
                              placeholder="customer@example.com"
                              className="pl-10 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              required
                            />
                          </div>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                          >
                            {isSubmitting ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Sending...
                              </>
                            ) : (
                              <>
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Send Invitation
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 dark:from-cyan-500/5 dark:to-purple-500/5 rounded-lg border border-cyan-200/50 dark:border-cyan-800/30">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-cyan-100 dark:bg-cyan-900/50">
                          <Users className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                            Manage Customer Accounts
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            Create and manage customer accounts for installment
                            tracking
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowCreateAccount(true)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Customer Account
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

    </div>
  )
}
