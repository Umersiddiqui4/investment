"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ChevronLeft, DollarSign, TrendingUp, BarChart3, Wallet } from "lucide-react"
import InstallmentCard from "./ui/InstallmentCard"
import { sellItemsData } from "./api/installments"
import { useState, useRef, useEffect } from "react"
import { SellItemDetails } from "./SellDetail"
import { Input } from "@/components/ui/input"
import SellItemListView from "./ui/SellItemListView"

interface InvestorDetailProps {
  investorData: any
  onBack: () => void
}

export default function InvestorDetail({ investorData, onBack }: InvestorDetailProps) {
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const [editingTotalInvestment, setEditingTotalInvestment] = useState(false)
  const [totalInvestmentValue, setTotalInvestmentValue] = useState(investorData.totalInvestment)
  const inputRef = useRef<HTMLInputElement>(null)

  const investorSells = sellItemsData.filter((item) => item.investors.some((inv) => inv.id === investorData.id))
  const investorInstallments = sellItemsData.filter((item) =>
    item.investors.some(
      (inv) => inv.id === investorData.id
    ) &&
       item.status === "active"
    
  )
  

  console.log("Investor Installments:", totalInvestmentValue);
  
  // Handle clicking outside the input to save
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        saveTotalInvestment()
      }
    }

    if (editingTotalInvestment) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [editingTotalInvestment])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }

  const handleBackClick = () => {
    setSelectedItem(null)
  }

  const handleTotalInvestmentClick = () => {
    setEditingTotalInvestment(true)
  }

  const saveTotalInvestment = () => {
    const numericValue = Number.parseFloat(
      totalInvestmentValue.toString().replace(/[^0-9.]/g, "")
    );
  
    // Update investorData
    investorData.totalInvestment = isNaN(numericValue)
      ? investorData.totalInvestment
      : numericValue;
  
    setTotalInvestmentValue(investorData.totalInvestment);
    setEditingTotalInvestment(false);
  
    // ✅ Save updated data back to localStorage
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsedData = JSON.parse(userData);
  
      // Assuming investorData has an ID, update the correct record
      const updatedData = parsedData.map((inv: any) =>
        inv.id === investorData.id ? { ...inv, totalInvestment: investorData.totalInvestment, accountBalance: investorData.totalInvestment } : inv
      );
  
      localStorage.setItem("userData", JSON.stringify(updatedData));
    }
  };
  
  console.log("Investor Data:", investorInstallments);
  console.log("Investor sell:", investorSells);
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveTotalInvestment()
    } else if (e.key === "Escape") {
      setEditingTotalInvestment(false)
      setTotalInvestmentValue(investorData.totalInvestment)
    }
  }

  return (
    <>
      {selectedItem ? (
        <SellItemDetails item={selectedItem} onBack={handleBackClick} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronLeft size={16} />
              <span>Back to Investors</span>
            </Button>
          </div>

          {/* Investor Profile Card */}
          <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <Avatar className="h-24 w-24 bg-cyan-100/50 dark:bg-cyan-200/20 border-2 border-cyan-200/50 dark:border-cyan-300/30">
                  <img
                    src={investorData.image || "/placeholder.svg"}
                    alt={investorData.name}
                    className="object-cover"
                  />
                </Avatar>

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{investorData.name}</h2>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 mt-2 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1 justify-center md:justify-start">
                        <span className="text-sm">Active since: {investorData.activeSince.split("T")[0]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-center md:justify-start">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            investorData.status === "Active" ? "bg-green-500" : "bg-amber-500"
                          }`}
                        ></span>
                        <span className="text-sm font-medium">Status: {investorData.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Highlights */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {/* Editable Total Investment Card */}
                    <div
                      className="flex gap-6 flex-col bg-gradient-to-br from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 p-4 rounded-lg border border-cyan-200/50 dark:border-cyan-500/30 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-400/50"
                      onClick={handleTotalInvestmentClick}
                    >
                      <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
                        <DollarSign size={18} />
                        <span className="text-sm font-medium">Total Investment</span>
                      </div>
                    
                      <div className="text-xl font-bold  text-start text-slate-900 dark:text-white">
                        {editingTotalInvestment ? (
                          <div className="relative">
                            <DollarSign
                              size={16}
                              className="absolute left-2 top-2.5 text-cyan-600 dark:text-cyan-400"
                            />
                            <Input
                              ref={inputRef}
                              type="text"
                              value={totalInvestmentValue}
                              onChange={(e) => setTotalInvestmentValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              className="pl-8 pr-2 py-1 h-9 w-full bg-white dark:bg-slate-700 border border-cyan-300 dark:border-cyan-600 rounded-md focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400"
                              autoFocus
                            />
                          </div>
                        ) : (
                          formatCurrency(investorData.totalInvestment ? investorData.totalInvestment : 0)
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-col bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 p-4 rounded-lg border border-purple-200/50 dark:border-purple-500/30">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                        <Wallet size={18} />
                        <span className="text-sm font-medium">Account Balance</span>
                      </div>
                      <div className="text-xl font-bold text-justify text-slate-900 dark:text-white">
                        {formatCurrency(investorData.accountBalance ? investorData.accountBalance : 0)}
                      </div>
                    </div>

                    <div className="flex gap-6 flex-col bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 p-4 rounded-lg border border-amber-200/50 dark:border-amber-500/30">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                        <BarChart3 size={18} />
                        <span className="text-sm font-medium">Total Sales</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(investorData.totalSales ? investorData.totalSales : 0)}
                      </div>
                    </div>

                    <div className="flex gap-1 flex-col bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 p-4 rounded-lg border border-green-200/50 dark:border-green-500/30">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <TrendingUp size={18} />
                        <span className="text-sm font-medium">Revenue Generated</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(investorData.revenueGenerated ? investorData.revenueGenerated : 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Installments and Sales */}
          <Tabs defaultValue="installments" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-slate-100 dark:bg-slate-700/30 p-1">
              <TabsTrigger
                value="installments"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-cyan-500/20 dark:data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
              >
                Installments
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-cyan-500/20 dark:data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
              >
                Sales
              </TabsTrigger>
            </TabsList>

            {/* Installments Tab Content */}
            <TabsContent value="installments" className="mt-4">
              {investorInstallments.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No installments found matching your criteria
                </div>
              ) : (
                investorInstallments.map((item: any) => (
                  <div className="space-y-3 my-4">
                              <SellItemListView
                                key={item.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            </div>
                ))
              )}
            </TabsContent>

            {/* Sales Tab Content */}
            <TabsContent value="sales" className="mt-4">
            {investorSells.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No installments found matching your criteria
                </div>
              ) : (
                investorSells.map((item: any) => (
                  <div className="space-y-3 my-4">
                              <SellItemListView
                                key={item.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  )
}
