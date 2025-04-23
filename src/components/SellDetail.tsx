"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Shield,
  User,
  Users,
  Percent,
  CheckCircle,
  Clock3,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  CreditCard,
} from "lucide-react";
import { stat } from "fs";
import { sellItemsData } from "./api/installments";
import { AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ThemeProvider } from "./theme/theme-provider";

export function SellItemDetails({ item, onBack }: any) {
  const profile = {
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    contact: "+92 300 1234567",
    cnicNumber: "61101-1234567-8",
    address: "123 Tech Avenue, Innovation District, Islamabad, Pakistan",
    activeSince: "January 15, 2022",
    profilePicture: "/placeholder.svg?height=200&width=200",
    cnicFrontImage: "/placeholder.svg?height=300&width=500",
    cnicBackImage: "/placeholder.svg?height=300&width=500",
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingInstallmentIndex, setEditingInstallmentIndex] = useState(null);
  const [paidAmount, setPaidAmount] = useState<Record<number, number>>({});
  const [paymentOption, setPaymentOption] = useState<any>({});
  const [installments, setInstallments] = useState(item.installments || []);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const [paymentDates, setPaymentDates] = useState(() => {
    return new Date().toISOString().split("T")[0]; // today's date
  });

  console.log(paymentOption, "paymentOption");
  console.log(paymentDates, "paymentDates");

  useEffect(() => {
    if (
      paymentOption?.type === "distribute" &&
      typeof paymentOption.id === "number"
    ) {
      distributeRemainingAmountToSellItem(paymentOption.id);
      console.log("Distribute logic triggered via paymentOption");
    }
    if (
      paymentOption?.type === "next" &&
      typeof paymentOption.id === "number"
    ) {
      distributeToNextInstallmentOnly(paymentOption.id);
      console.log("Distribute logic triggered via paymentOption");
    }
  }, [paymentOption]);

  const distributeRemainingAmountToSellItem = (index: number) => {
    const updated = [...installments];
    const expectedMonthly = updated[index]?.amount || 5000;
    const received = paidAmount[index];

    if (received === undefined || !updated[index]) {
      console.warn(
        `Invalid installment index or no paidAmount found for index ${index}`
      );
      return;
    }

    const remaining = expectedMonthly - received;

    // Step 1: mark this one paid
    updated[index] = {
      ...updated[index],
      amount: received,
      status: "paid",
      paidDate: paymentDates,
    };

    // Step 2: distribute remaining
    if (remaining > 0) {
      const futureUnpaid = updated.filter(
        (_, i) => i > index && updated[i].status !== "paid"
      );

      if (futureUnpaid.length === 0) {
        console.warn(
          "No future unpaid installments to distribute the remaining amount"
        );
      } else {
        const per = Math.floor(remaining / futureUnpaid.length);
        const leftover = remaining % futureUnpaid.length;

        let applied = 0;
        for (let i = index + 1; i < updated.length; i++) {
          if (updated[i].status !== "paid") {
            const extra = applied === 0 ? leftover : 0;
            updated[i].amount =
              (updated[i].amount || expectedMonthly) + per + extra;
            applied++;
          }
        }
      }
    }

    setInstallments(updated);

    // Manual update to sellItemsData
    const targetIndex = sellItemsData.findIndex((s) => s.id === item.id);
    if (targetIndex !== -1) {
      sellItemsData[targetIndex].completedPayments += 1;
      sellItemsData[targetIndex].installments = updated;
    }

    setEditingInstallmentIndex(null);
    console.log("Installment update + distribute complete");
  };

  const distributeToNextInstallmentOnly = (index: number) => {
    const updated = [...installments];
    const expectedMonthly = updated[index]?.amount || 5000;
    const received = paidAmount[index];

    if (received === undefined || !updated[index]) {
      console.warn(
        `Invalid installment index or no paidAmount found at index ${index}`
      );
      return;
    }

    const remaining = expectedMonthly - received;

    // Step 1: Mark current as paid
    updated[index] = {
      ...updated[index],
      amount: received,
      status: "paid",
      paidDate: paymentDates,
    };

    // Step 2: Add remaining to just the next unpaid installment
    if (remaining > 0) {
      const nextIndex = updated.findIndex(
        (inst, i) => i > index && inst.status !== "paid"
      );

      if (nextIndex !== -1) {
        updated[nextIndex].amount =
          (updated[nextIndex].amount || expectedMonthly) + remaining;
      } else {
        console.warn(
          "No next unpaid installment found to distribute remaining"
        );
      }
    }

    setInstallments(updated);

    // Update in sellItemsData (non-state variable)
    const targetIndex = sellItemsData.findIndex((s) => s.id === item.id);
    if (targetIndex !== -1) {
      sellItemsData[targetIndex].completedPayments += 1;
      sellItemsData[targetIndex].installments = updated;
    }

    setEditingInstallmentIndex(null);
    console.log("Updated: paid + remaining shifted to next unpaid installment");
  };

  const distributeManually = (index: number, selectedMonths: number[]) => {
    const updated = [...installments];
    const expected = updated[index]?.amount || 5000;
    const paid = paidAmount[index];

    if (paid === undefined || !updated[index]) {
      console.warn("Missing paid amount or invalid index");
      return;
    }

    const remaining = expected - paid;
    if (remaining <= 0 || selectedMonths.length === 0) {
      console.warn("Nothing to distribute or no months selected");
      return;
    }

    // Mark current installment as paid
    updated[index] = {
      ...updated[index],
      amount: paid,
      status: "paid",
      paidDate: paymentDates,
    };

    const evenAmount = Math.floor(remaining / selectedMonths.length);
    const extra = remaining % selectedMonths.length;

    selectedMonths.forEach((monthIndex, i) => {
      if (updated[monthIndex]) {
        const addAmount = evenAmount + (i === 0 ? extra : 0);
        updated[monthIndex].amount =
          (updated[monthIndex].amount || expected) + addAmount;
      }
    });

    setInstallments(updated);

    const targetIndex = sellItemsData.findIndex((s) => s.id === item.id);
    if (targetIndex !== -1) {
      sellItemsData[targetIndex].completedPayments += 1;
      sellItemsData[targetIndex].installments = updated;
    }

    setEditingInstallmentIndex(null);
    console.log("Manual distribution complete across selected months");
  };

  const toggleMonth = (monthIndex: number) => {
    setSelectedMonths((prev) =>
      prev.includes(monthIndex)
        ? prev.filter((m) => m !== monthIndex)
        : [...prev, monthIndex]
    );
  };
  

  const handleInstallmentUpdate = (index: number) => {
    const updated = [...installments];

    if (paidAmount[index] !== undefined) {
      updated[index] = {
        ...updated[index],
        status: "paid",
        paidDate: paymentDates,
      };

      setInstallments(updated);

      const itemIndex = sellItemsData.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1) {
        console.log(itemIndex, "itemindex");

        sellItemsData[itemIndex].completedPayments += 1;
        sellItemsData[itemIndex].installments = updated;
      }

      console.log(`Installment ${index} updated in raw variable`);
    }

    setEditingInstallmentIndex(null);
  };

  const formatDate = (dateString: any) => {
    const options = {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatCurrency = (amount: any, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate progress percentage
  const progressPercentage = Math.round(
    (item.completedPayments / item.totalPayments) * 100
  );

  const getStatusColor = (status: any) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500 text-white";
      case "due":
        return "bg-amber-500 text-white";
      case "pending":
        return "bg-slate-400 text-white dark:bg-slate-600";
      default:
        return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "due":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  function openProfile(data: any) {
    setSelectedProfile(data);
    setIsOpen(true);
  }
  console.log(isOpen, "isopen");
  console.log(selectedProfile, " selectedprofile");

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Sale Details
        </h1>
        <Badge
          className={`ml-auto ${
            item.status === "active"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
              : "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
          }`}
        >
          {item.status === "active" ? (
            <div className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>Completed</span>
            </div>
          )}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Item Info */}
        <Card className="bg-white/90 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200 dark:border-slate-700/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50">
                <img
                  src={item.itemImage || "/placeholder.svg"}
                  alt={item.itemName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {item.itemName}
                </h2>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Created on {formatDate(item.date)}</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="overview"
              className="w-full"
              onValueChange={setActiveTab}
            >
              <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                <TabsList className="grid grid-cols-4 w-full min-w-[500px] md:min-w-0 bg-slate-100 dark:bg-slate-700/30 p-1 mb-4">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="participants"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Participants
                  </TabsTrigger>
                  <TabsTrigger
                    value="installments"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Installments
                  </TabsTrigger>
                  <TabsTrigger
                    value="financial"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                  >
                    Financial
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-4">
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      Sale Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300">
                          Status
                        </span>
                        <Badge
                          className={`${
                            item.status === "active"
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                              : "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {item.status === "active" ? "Active" : "Completed"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300">
                          Created Date
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300">
                          Investment Rate
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-300 font-medium">
                          {item.rate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-700 dark:text-slate-300">
                          Total Amount
                        </span>
                        <span className="text-slate-900 dark:text-white font-medium">
                          {formatCurrency(item.sellPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                      Participants
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Customer:
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {item?.customer?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-cyan-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Investors:
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {item.investors.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-slate-700 dark:text-slate-300">
                          Guarantors:
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {item.guarantors.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    Payment Progress
                  </h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        Completed: {item.completedPayments} of{" "}
                        {item.totalPayments} payments
                      </span>
                      <span className="font-medium text-cyan-600 dark:text-cyan-300">
                        {progressPercentage}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg text-center border border-emerald-200 dark:border-emerald-800/30">
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                        Paid
                      </div>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {
                          item.installments.filter(
                            (i: any) => i.status === "paid"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center border border-amber-200 dark:border-amber-800/30">
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                        Due
                      </div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {
                          item.installments.filter(
                            (i: any) => i.status === "due"
                          ).length
                        }
                      </div>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg text-center border border-slate-200 dark:border-slate-600/50">
                      <div className="text-xs text-slate-600 dark:text-slate-300 mb-1">
                        Pending
                      </div>
                      <div className="text-xl font-bold text-slate-600 dark:text-slate-300">
                        {
                          item.installments.filter(
                            (i: any) => i.status === "pending"
                          ).length
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                {/* Customer */}
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    Customer
                  </h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-blue-500/30">
                      <img
                        src={item?.customer?.image || "/placeholder.svg"}
                        alt={item?.customer?.name}
                      />
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item?.customerName}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Primary Buyer
                      </div>
                    </div>
                  </div>
                </div>

                {/* Guarantors */}
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-400" />
                    Guarantors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.guarantors.map((guarantor: any) => (
                      <div
                        key={guarantor.id}
                        className="flex items-center gap-3 bg-white dark:bg-slate-800/50 p-3 rounded-lg"
                      >
                        <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                          <img
                            src={guarantor.image || "/placeholder.svg"}
                            alt={guarantor.name}
                          />
                        </Avatar>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {guarantor.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {guarantor.role}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investors */}
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-cyan-400" />
                    Investors
                  </h3>
                  <div className="space-y-3">
                    {item.investors.map((investor: any) => (
                      <div
                        key={investor.id}
                        className="flex items-center justify-between bg-white dark:bg-slate-800/50 p-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
                            <img
                              src={investor.image || "/placeholder.svg"}
                              alt={investor.name}
                            />
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {investor.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Investor
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <Percent className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="text-cyan-600 dark:text-cyan-300 font-medium">
                              {investor.percentage}%
                            </span>
                          </div>
                          <div className="text-sm text-slate-700 dark:text-slate-300">
                            {formatCurrency(
                              investor.contribution,
                              item.currency
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="installments" className="space-y-4">
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    Installment Schedule
                  </h3>

                  {/* Progress Summary */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-700 dark:text-slate-300">
                        Completed: {item.completedPayments} of{" "}
                        {item.totalPayments} payments
                      </span>
                      <span className="font-medium text-cyan-600 dark:text-cyan-300">
                        {progressPercentage}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Installment List */}
                  <div className="space-y-3 mt-4">
                    {item.installments.map((installment: any, index: any) => {
                      const isEditing = editingInstallmentIndex === index;
                      console.log(editingInstallmentIndex);

                      return (
                        <div
                          key={index}
                          className="flex flex-col p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <Badge
                                className={`${getStatusColor(
                                  installment.status
                                )} flex items-center gap-1 px-2 py-0.5`}
                              >
                                {getStatusIcon(installment.status)}
                                <span className="capitalize">
                                  {installment.status}
                                </span>
                              </Badge>
                              <span className="text-slate-900 dark:text-white">
                                Month {installment.month}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(installment.date)}
                              </span>
                              <span className="text-blue-700 dark:text-green-400">
                                {installment?.status === "paid" &&
                                  formatDate(installment?.paidDate)}
                              </span>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {formatCurrency(
                                  installment.amount,
                                  item.currency
                                )}
                              </span>
                              {installment.status !== "paid" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  onClick={() => {
                                    if (isEditing) {
                                      setEditingInstallmentIndex(null);
                                    } else {
                                      setEditingInstallmentIndex(index);
                                      setPaidAmount((prev) => ({
                                        ...prev,
                                        [index]: installment.amount,
                                      }));
                                      setPaymentOption((prev: any) => ({
                                        ...prev,
                                        id: index,
                                        type: "",
                                      }));
                                    }
                                  }}
                                >
                                  {isEditing ? "Cancel" : "Update"}
                                </Button>
                              )}
                            </div>
                          </div>

                          {isEditing && (
                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600/50 space-y-3">
                              <div className="flex flex-col space-y-2">
                                <label className="text-sm text-slate-700 dark:text-slate-300">
                                  Payment Amount
                                </label>
                                <div className="flex flex-wrap items-center gap-2">
                                  <input
                                    type="number"
                                    value={paidAmount[index] || ""}
                                    onChange={(e) =>
                                      setPaidAmount((prev) => ({
                                        ...prev,
                                        [index]: Number(e.target.value),
                                      }))
                                    }
                                    className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-slate-900 dark:text-white w-full max-w-[150px]"
                                    max={installment.amount}
                                  />
                                  <span className="text-slate-500 dark:text-slate-400">
                                    of{" "}
                                    {formatCurrency(
                                      installment.amount,
                                      item.currency
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-slate-700 dark:text-slate-300">
                                    Payment Date
                                  </label>
                                  <input
                                    type="date"
                                    value={paymentDates}
                                    onChange={(e) =>
                                      setPaymentDates(e.target.value)
                                    }
                                    className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-3 py-1 text-slate-900 dark:text-white w-full max-w-[200px]"
                                  />
                                </div>
                              </div>

                              {(paidAmount[index] || 0) <
                                installment.amount && (
                                <div className="flex flex-col space-y-2">
                                  <label className="text-sm text-slate-700 dark:text-slate-300">
                                    Remaining Amount:{" "}
                                    {formatCurrency(
                                      installment.amount -
                                        (paidAmount[index] || 0),
                                      item.currency
                                    )}
                                  </label>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          id={`distribute-${index}`}
                                          name={`payment-option-${index}`}
                                          checked={
                                            paymentOption[index] ===
                                            "distribute"
                                          }
                                          onChange={() =>
                                            setPaymentOption(
                                              (
                                                prev: Record<number, string>
                                              ) => ({
                                                ...prev,
                                                id: index,
                                                type: "distribute",
                                              })
                                            )
                                          }
                                          className="text-cyan-500"
                                        />
                                        <label
                                          htmlFor={`distribute-${index}`}
                                          className="text-sm text-slate-700 dark:text-slate-300"
                                        >
                                          Distribute across remaining months
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="radio"
                                          id={`next-${index}`}
                                          name={`payment-option-${index}`}
                                          checked={
                                            paymentOption[index] === "next"
                                          }
                                          onChange={() =>
                                            setPaymentOption((prev: any) => ({
                                              ...prev,
                                              id: index,
                                              type: "next",
                                            }))
                                          }
                                          className="text-cyan-500"
                                        />
                                        <label
                                          htmlFor={`next-${index}`}
                                          className="text-sm text-slate-700 dark:text-slate-300"
                                        >
                                          Add to next month
                                        </label>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        id={`manual-${index}`}
                                        name={`payment-option-${index}`}
                                        checked={
                                          paymentOption[index] === "manual"
                                        }
                                        onChange={() =>
                                          setPaymentOption((prev: any) => ({
                                            ...prev,
                                            id: index,
                                            type: "manual",
                                          }))
                                        }
                                        className="text-cyan-500"
                                      />
                                      <label
                                        htmlFor={`manual-${index}`}
                                        className="text-sm text-slate-700 dark:text-slate-300"
                                      >
                                        Distribute manually
                                      </label>
                                    </div>

                                    {paymentOption.type === "manual" && (
                                      <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600/50">
                                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                                          Manual Distribution
                                        </h4>

                                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                                          {item.installments
                                            .filter(
                                              (_: any, i: any) =>
                                                i > index &&
                                                i < item.installments.length
                                            )
                                            .map(
                                              (
                                                futureInstallment: any,
                                                futureIndex: number
                                              ) => {
                                                const actualIndex =
                                                  index + futureIndex + 1;
                                                console.log(
                                                  actualIndex,
                                                  "indexes"
                                                );

                                                return (
                                                  <div
                                                    key={actualIndex}
                                                    className="flex items-center justify-between"
                                                  >
                                                    <div className="flex items-center gap-2">
                                                      <input
                                                        type="checkbox"
                                                        id={`month-${actualIndex}`}
                                                        checked={selectedMonths.includes(
                                                          actualIndex
                                                        )}
                                                        onChange={() =>
                                                          toggleMonth(
                                                            actualIndex
                                                          )
                                                        }
                                                      />

                                                      <label
                                                        htmlFor={`month-${actualIndex}`}
                                                        className="text-sm text-slate-700 dark:text-slate-300"
                                                      >
                                                        Month{" "}
                                                        {
                                                          futureInstallment.month
                                                        }{" "}
                                                        (
                                                        {formatDate(
                                                          futureInstallment.date
                                                        )}
                                                        )
                                                      </label>
                                                    </div>
                                                    {/* <input
                                                      type="number"
                                                      placeholder="Amount"
                                                      className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-white w-[100px] text-sm"
                                                    /> */}
                                                  </div>
                                                );
                                              }
                                            )}
                                        </div>
                                        <div className="mt-3 flex justify-between items-center">
                                          <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Remaining:{" "}
                                            {formatCurrency(
                                              installment.amount -
                                                (paidAmount[index] || 0),
                                              item.currency
                                            )}
                                          </span>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                                            onClick={() =>
                                              distributeManually(
                                                index,
                                                selectedMonths
                                              )
                                            }
                                          >
                                            Distribute Evenly
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                  onClick={() => {
                                    setEditingInstallmentIndex(null);
                                    setPaymentOption({});
                                  }}
                                >
                                  Cancel
                                </Button>
                                {(paymentOption?.type !== "manual" && (paidAmount[index] || 0) ==
                                installment.amount) && (
                                  <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                    onClick={() =>
                                      handleInstallmentUpdate(index)
                                    }
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Payment Summary */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-600/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-700 dark:text-slate-300">
                        Monthly Payment
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {formatCurrency(item.sellPrice / item.totalPayments)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-700 dark:text-slate-300">
                        Total Received
                      </span>
                      <span className="text-green-400 dark:text-green-400 font-medium">
                        {formatCurrency(
                          item.installments
                            .filter((inst: any) => inst.status === "paid")
                            .reduce(
                              (sum: number, inst: any) =>
                                sum + Number(inst.amount || 0),
                              0
                            )
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-700 dark:text-slate-300">
                        Total Remaining
                      </span>
                      <span className="text-orange-400 dark:text-orange-400 font-medium">
                        {formatCurrency(
                          item.sellPrice -
                            item.installments
                              .filter((inst: any) => inst.status === "paid")
                              .reduce(
                                (sum: number, inst: any) =>
                                  sum + Number(inst.amount || 0),
                                0
                              )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        Total Investment
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.sellPrice)}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                        Investment Rate
                      </div>
                      <div className="text-xl font-bold text-cyan-600 dark:text-cyan-300">
                        {item.rate}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-400" />
                    Investment Breakdown
                  </h3>
                  <div className="space-y-3">
                    {item.investors.map((investor: any) => (
                      <div
                        key={investor.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white dark:bg-slate-800/50 rounded-lg gap-3"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <img
                              src={investor.image || "/placeholder.svg"}
                              alt={investor.name}
                            />
                          </Avatar>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {investor.name}
                          </span>
                        </div>
                        <div className="flex flex-row justify-between sm:justify-end items-center gap-4">
                          <div className="text-left sm:text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Contribution
                            </div>
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {formatCurrency(
                                investor.contribution,
                                item.currency
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Percentage
                            </div>
                            <div className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                              {investor.percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600/50">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-400" />
                    Timeline
                  </h3>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-300 dark:before:bg-slate-600 overflow-x-hidden">
                    <div className="relative">
                      <div className="absolute left-[-24px] top-0 h-4 w-4 rounded-full bg-cyan-500"></div>
                      <div className="text-sm text-slate-900 dark:text-white font-medium truncate">
                        {formatDate(item.date)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Investment initiated
                      </div>
                    </div>
                    {item.installments.map((installment: any, index: any) => (
                      <div key={index} className="relative">
                        <div
                          className={`absolute left-[-24px] top-0 h-4 w-4 rounded-full ${
                            installment.status === "paid"
                              ? "bg-emerald-500"
                              : installment.status === "due"
                              ? "bg-amber-500"
                              : "bg-slate-400 dark:bg-slate-600"
                          }`}
                        ></div>
                        <div className="text-sm text-slate-900 dark:text-white font-medium truncate">
                          {formatDate(installment.date)}-
                        </div>
                        {installment.status === "paid" && (
                          <div className="text-sm text-green-400 dark:text-green-400 font-medium truncate">
                          {formatDate(installment.paidDate)}
                          </div>
                        )}
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap">
                          <span className="mr-1">
                            Payment {installment.month} -
                          </span>
                          <span
                            className={
                              installment.status === "paid"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : installment.status === "due"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-500 dark:text-slate-400"
                            }
                          >
                            {installment.status.charAt(0).toUpperCase() +
                              installment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column - Participants Summary */}
        <div className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Sale Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer */}
              <div
                onClick={() => openProfile(item.customer)}
                className="cursor-pointer flex items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600/50"
              >
                <Avatar className="h-10 w-10 border-2 border-blue-500/30">
                  <img
                    src={item?.customer?.image || "/placeholder.svg"}
                    alt={item?.customer?.name}
                  />
                </Avatar>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Customer
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {item?.customer.name}
                  </div>
                </div>
              </div>

              {/* Guarantors */}
              {item.guarantors.map((guarantor: any) => (
                <div
                  onClick={() => openProfile(guarantor)}
                  key={guarantor.id}
                  className="cursor-pointer flex items-center gap-3 p-3 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600/50"
                >
                  {/* <Avatar className="h-10 w-10 border-2 border-purple-500/30">
                    <img
                      src={guarantor.image || "/placeholder.svg"}
                      alt={guarantor.name}
                    />
                  </Avatar> */}
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Guarantor
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {guarantor.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {guarantor.role}
                    </div>
                  </div>
                </div>
              ))}

              {/* Investors */}
              {item.investors.map((investor: any) => (
                <div
                  onClick={() => openProfile(investor)}
                  key={investor.id}
                  className="cursor-pointer flex items-center justify-between p-3 bg-slate-50/80 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-600/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
                      <img
                        src={investor.image || "/placeholder.svg"}
                        alt={investor.name}
                      />
                    </Avatar>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Investor
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {investor.name}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border-cyan-500/30">
                    {investor.percentage}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/90 dark:bg-slate-800/40 backdrop-blur-sm border-slate-200 dark:border-slate-700/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                Financial Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Total Amount:
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.sellPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300">
                    Total Received
                  </span>
                  <span className="text-lg font-bold text-green-400 dark:text-green-400">
                    {formatCurrency(
                      item.installments
                        .filter((inst: any) => inst.status === "paid")
                        .reduce(
                          (sum: number, inst: any) =>
                            sum + Number(inst.amount || 0),
                          0
                        )
                    )}
                  </span>
                </div> 
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 dark:text-slate-300">
                    Total Remaining
                  </span>
                  <span className="text-lg font-bold text-orange-400 dark:text-orange-400">
                    {formatCurrency(
                      item.sellPrice -
                        item.installments
                          .filter((inst: any) => inst.status === "paid")
                          .reduce(
                            (sum: number, inst: any) =>
                              sum + Number(inst.amount || 0),
                            0
                          )
                    )}
                  </span>
                </div>
                

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Investment Rate:
                  </span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-300">
                    {item.rate}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Status:
                  </span>
                  <Badge
                    className={`${
                      item.status === "active"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30"
                        : "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {item.status === "active" ? "Active" : "Completed"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">
                    Created:
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {formatDate(item.date)}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 mt-3">
                  <div className="mb-2">
                    <span className="text-slate-500 dark:text-slate-400">
                      Payment Progress:
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      {item.completedPayments} of {item.totalPayments} payments
                    </span>
                    <span className="text-cyan-600 dark:text-cyan-400">
                      {progressPercentage}% Complete
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <ThemeProvider />
          <Card className="relative w-full max-w-4xl overflow-hidden border-0 shadow-2xl  dark:bg-indigo-500/20 rounded-2xl bg-background/80 backdrop-blur-md">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left sidebar with profile picture and basic info */}
              <div className="p-6 flex flex-col items-center space-y-4 border-r border-border/50">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-70"></div>
                  <Avatar className="h-32 w-32 border-4 border-background relative">
                    <AvatarImage
                      src={selectedProfile.image || "/placeholder.svg"}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-4xl">
                      {selectedProfile.name}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">{selectedProfile.name}</h2>
                  <Badge
                    variant="outline"
                    className="px-3 py-1 bg-violet-500/10 text-violet-500 border-violet-500/20"
                  >
                    Active
                  </Badge>
                </div>

                <div className="w-full space-y-3 mt-4">
                  {/* <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">ID:</span>
                    <span className="ml-auto">{profile.cnicNumber}</span>
                  </div> */}

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Active Since:</span>
                    <span className="ml-auto">
                      {new Date(
                        selectedProfile.activeSince
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {/* <Button variant="outline" size="sm" className="w-full mt-4" onClick={toggleTheme}>
                    Toggle {theme === "dark" ? "Light" : "Dark"} Mode
                  </Button> */}
                </div>
              </div>

              {/* Main content area */}
              <div className="col-span-2 p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProfile?.email && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedProfile.email}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {selectedProfile.contactNumber}
                      </p>
                    </div>
                    {selectedProfile?.address && (
                      <div className="space-y-2 md:col-span-2">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <p className="font-medium">
                            {selectedProfile.address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    CNIC Information
                  </h3>
                  {selectedProfile?.cnic && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          CNIC Number
                        </p>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{selectedProfile.cnic}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {selectedProfile?.cnicFront && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          CNIC Front
                        </p>
                        <div className="relative group overflow-hidden rounded-lg border border-border/50">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <img
                            src={
                              selectedProfile.cnicFront ||
                              "/placeholder.svg"
                            }
                            alt="CNIC Front"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    )}
                    {selectedProfile?.cnicBack && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          CNIC Back
                        </p>
                        <div className="relative group overflow-hidden rounded-lg border border-border/50">
                          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <img
                            src={
                              selectedProfile.cnicBack ||
                              "/placeholder.svg"
                            }
                            alt="CNIC Back"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
