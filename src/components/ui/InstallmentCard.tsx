import { useState } from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import { Avatar } from "./avatar";
import { Progress } from "./progress";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useSelector } from "react-redux";

interface Guarantor {
  id: number;
  name: string;
  image: string;
  role: string;
}

interface Investor {
  id: number;
  name: string;
  image: string;
  contribution: number;
  percentage: number;
}

interface InstallmentDetail {
  month: number;
  date: string;
  amount: number;
  status: "paid" | "due" | "pending" | "late";
}

interface Installment {
  id: number;
  itemName: string;
  itemImage: string;
  customerName: string;
  customerImage: string;
  investorName: string;
  investorImage: string;
  date: string;
  rate: number;
  status: "active" | "inactive" | "completed" | "defaulted";
  guarantors: Guarantor[];
  investors: Investor[];
  totalAmount: number;
  currency: string;
  description: string;
  installments: InstallmentDetail[];
  completedPayments: number;
  totalPayments: number;
}


export default function InstallmentCard({ installment }: { installment: Installment }) {
  const [expanded, setExpanded] = useState(false);
  const isMobile = useSelector((state: any) => state.app.isMobile);

  const formatCurrency = (amount: any, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  // Calculate progress percentage
  const progressPercentage = Math.round(
    (installment.completedPayments / installment.totalPayments) * 100
  );

  // Count payments by status
  const paidPayments = installment.installments.filter(
    (p: any) => p.status === "paid"
  ).length;
  const duePayments = installment.installments.filter(
    (p: any) => p.status === "due"
  ).length;
  const pendingPayments = installment.installments.filter(
    (p: any) => p.status === "pending"
  ).length;

  return (
    <div  className="bg-white mb-4 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="p-2 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 md:h-14 md:w-14  rounded-xl border border-slate-300 dark:border-slate-600">
                <img
                  src={installment.customer.image || "/placeholder.svg"}
                  alt={installment.customer.name}
                  className="object-cover h-12 w-12 md:h-14 md:w-14 rounded-xl border border-slate-300 dark:border-slate-600"
                />
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-medium text-white ring-2 ring-white dark:ring-slate-800">
                {installment.investors.length}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-lg text-slate-900 dark:text-white">
                {installment.itemName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{installment.customer.name}</span>
                {!isMobile && (
                  <>
                    <span>•</span>
                    <span>{installment.customer.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 px-2.5 py-0.5">
              {formatCurrency(installment.totalAmount, installment.currency)}
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2.5 py-0.5">
              {installment.totalPayments} months
            </Badge>
            
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-300">
              Progress: {paidPayments} of {installment.totalPayments} payments
            </span>
            <span className="font-medium text-cyan-600 dark:text-cyan-400">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Payment Status Summary */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Paid
            </div>
            <div className="text-lg font-medium text-emerald-600 dark:text-emerald-400">
              {paidPayments}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Due
            </div>
            <div className="text-lg font-medium text-amber-600 dark:text-amber-400">
              {duePayments}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg text-center">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Pending
            </div>
            <div className="text-lg font-medium text-slate-600 dark:text-slate-300">
              {pendingPayments}
            </div>
          </div>
        </div>

        {/* Investors */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Investors
          </h4>
          <div className="flex flex-wrap gap-2">
            {installment.investors.map((investor: any) => (
              <div
                key={investor.id}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700/50 rounded-full pl-1 pr-3 py-1"
              >
                <Avatar className="h-6 w-6 bg-cyan-100/50 dark:bg-cyan-200/20 border border-cyan-200/50 dark:border-cyan-300/30">
                  <img
                    src={investor.image || "/placeholder.svg"}
                    alt={investor.name}
                  />
                </Avatar>
                <span className="text-xs">{investor.name}</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] px-1.5">
                  {investor.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

      
      </div>
    </div>
  );
}
