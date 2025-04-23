"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Menu,
  Bell,
  Search,
  Calendar,
} from "lucide-react";
import Sidebaar from "./Sidebaar";
import InstallmentCard from "./ui/InstallmentCardInstallment";
import { useDispatch, useSelector } from "react-redux";
import {
  setIsMobile,
  setSidebarOpen,
} from "@/redux/appSlice";
import { sellItemsData, userData } from "./api/installments";
import { SellItemDetails } from "./SellDetail";
import SellItemListView from "./ui/SellItemListView";

// Sample data - in a real app, this would come from an API

export default function Installments() {
  // const installmentsData = installmentsData
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null)
  const [activeTab, setActiveTab] = useState("all");

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
      if (window.innerWidth >= 768) {
        dispatch(setSidebarOpen(false));
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleBackClick = () => {
    setSelectedItem(null)
  }
  const handleItemClick = (item: any) => {
    setSelectedItem(item)
  }

  const formatDate = (dateString: any) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
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
 

  // Filter installments based on active tab and search query
  const filteredInstallments = sellItemsData.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && item.status === "active") ||
      (activeTab === "completed" && item.status === "completed") ||
      (activeTab === "overdue" &&
        item.installments.some((p) => p.status === "due"));

    const matchesSearch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) 
      // item.customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  console.log(selectedItem, "selectedItem");
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
        )}

        {/* Sidebar - Mobile: full slide in, Desktop: collapsible */}
        <Sidebaar />
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/30 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch(setSidebarOpen(true))}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden"
                >
                  <Menu size={20} />
                </Button>
              )}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search installments..."
                  className="pl-8 bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 focus:border-cyan-500 text-slate-900 dark:text-slate-100 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* <ThemeToggle /> */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2">
               <Avatar  className="h-8 w-8 border-2 border-cyan-500" >
                                 <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full">
                                 <img
                                   src={userData.profile}
                                   alt="User Avatar"
                                   className="object-center object-cover"  />
                                 </div>
                               </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  Admin
                </span>
              </div>
            </div>
          </header>

          {/* Installments Content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {selectedItem ? (
                          <SellItemDetails item={selectedItem} onBack={handleBackClick} />
                        ) : (
            <div className="max-w-7xl mx-auto space-y-6">
            
              {/* Installments Tabs */}
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Installment Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="all"
                    className="w-full"
                    onValueChange={setActiveTab}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TabsList className="grid grid-cols-4 w-auto bg-slate-100 dark:bg-slate-700/30 p-1">
                        <TabsTrigger
                          value="all"
                          className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs md:text-sm"
                        >
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value="active"
                          className="data-[state=active]:bg-cyan-50 dark:data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400 text-xs md:text-sm"
                        >
                          Active
                        </TabsTrigger>
                        <TabsTrigger
                          value="overdue"
                          className="data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-900/30 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs md:text-sm"
                        >
                          Overdue
                        </TabsTrigger>
                        <TabsTrigger
                          value="completed"
                          className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 text-xs md:text-sm"
                        >
                          Completed
                        </TabsTrigger>
                      </TabsList>

                    
                    </div>

                    <TabsContent value="all" className="mt-0">
                      <div className="space-y-4">
                        {filteredInstallments.length === 0 ? (
                          <div  className="text-center py-12 text-slate-500 dark:text-slate-400 ">
                            No installments found matching your criteria
                          </div>
                        ) : (
                          filteredInstallments.map((item: any) => (
                            <div className="space-y-3">
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
                      </div>
                    </TabsContent>

                    <TabsContent value="active" className="mt-0">
                      <div className="space-y-4">
                        {filteredInstallments.length === 0 ? (
                          <div  className=" text-center py-12 text-slate-500 dark:text-slate-400">
                            No active installments found
                          </div>
                        ) : (
                          filteredInstallments.map((item: any) => (
                            <div className="space-y-3">
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
                      </div>
                    </TabsContent>

                    <TabsContent value="overdue" className="mt-0">
                      <div className="space-y-4">
                        {filteredInstallments.length === 0 ? (
                          <div  className=" text-center py-12 text-slate-500 dark:text-slate-400">
                            No overdue installments found
                          </div>
                        ) : (
                          filteredInstallments.map((item: any) => (
                            <div className="space-y-3">
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
                      </div>
                    </TabsContent>

                    <TabsContent value="completed" className="mt-0">
                      <div className="space-y-4">
                        {filteredInstallments.length === 0 ? (
                          <div  className=" text-center py-12 text-slate-500 dark:text-slate-400">
                            No completed installments found
                          </div>
                        ) : (
                          filteredInstallments.map((item: any) => (
                            <div className="space-y-3">
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
                        )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Installment Card Component
