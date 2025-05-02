"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronRight,
  Calendar,
  Percent,
  Bell,
  Menu,
  LayoutGrid,
  List,
  Plus,
} from "lucide-react";
import { ThemeToggle } from "./theme/theme-toggle";
// import { SellItemDetails } from "./sell-item-details"
import Sidebaar from "./Sidebaar";
import { useDispatch, useSelector } from "react-redux";
import { setIsMobile, setIsShowCreateInstallment, setSidebarOpen } from "@/redux/appSlice";
import { sellItemsData, userData } from "./api/installments";
import SellItemListView from "./ui/SellItemListView";
import { SellItemDetails } from "./SellDetail";
import { CreateInstallmentForm } from "./createInstallment";

// My sell items (subset of all items)
const mySellItemsData = [sellItemsData[0], sellItemsData[2], sellItemsData[4]];

export default function Sell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [filteredItems, setFilteredItems] = useState(sellItemsData);
  const [filteredMyItems, setFilteredMyItems] = useState(mySellItemsData);
  const [viewMode, setViewMode] = useState("grid");
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const dispatch = useDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isShowCreateInstallment = useSelector((state: any) => state.app.IsShowCreateInstallment);
  const [installments, setInstallments] = useState([]);
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
  }, [dispatch]);

  console.log(filteredItems, "filteredItems");
  

  useEffect(() => {
    const localData = localStorage.getItem("installments");
    if (localData) {
      const parsedData = JSON.parse(localData);
      setInstallments(parsedData);
    }
  }, []);
  console.log("installments", installments);
  
  // Filter items based on search query
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();

      const filtered = sellItemsData.filter(
        (item: any) =>
          item?.itemName.toLowerCase().includes(lowercaseQuery) ||
          item?.customerName.toLowerCase().includes(lowercaseQuery) ||
          item?.investorName.toLowerCase().includes(lowercaseQuery)
      );

      const filteredMy = mySellItemsData.filter(
        (item:any) =>
          item?.itemName.toLowerCase().includes(lowercaseQuery) ||
          item?.customerName.toLowerCase().includes(lowercaseQuery) ||
          item?.investorName.toLowerCase().includes(lowercaseQuery)
      );

      setFilteredItems(filtered);
      setFilteredMyItems(filteredMy);
    } else {
      setFilteredItems(sellItemsData);
      setFilteredMyItems(mySellItemsData);
    }
  }, [searchQuery]);

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

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
  };

  const handleBackClick = () => {
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
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
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-700/50 md:hidden"
                >
                  <Menu size={20} />
                </Button>
              )}
              <h1 className="text-lg font-semibold hidden md:block">
                Sales
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-700/50"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-cyan-500">
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full">
                    <img
                      src={userData.profile || "/placeholder.svg"}
                      alt="User Avatar"
                      className="object-center object-cover"
                    />
                  </div>
                </Avatar>
                <span className="text-sm font-medium hidden md:inline-block">
                  Admin
                </span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
          {isShowCreateInstallment ? (
              <CreateInstallmentForm
              />
            ) : ( <>
            {selectedItem ? (
              <SellItemDetails item={selectedItem} onBack={handleBackClick} />
            ) : (
              <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Sales
                  </h2>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search sales..."
                        className="pl-8 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-slate-100 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-800/50 rounded-md p-1 border border-slate-200 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          viewMode === "grid"
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                            : "text-slate-400"
                        }`}
                        onClick={() => setViewMode("grid")}
                      >
                        <LayoutGrid size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${
                          viewMode === "list"
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                            : "text-slate-400"
                        }`}
                        onClick={() => setViewMode("list")}
                      >
                        <List size={16} />
                      </Button>
                      {/* <Button
                        onClick={() => dispatch(setIsShowCreateInstallment(true))}
                        
                        className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700"
                      >
                        <Plus size={16} />

                        {!isMobile && "Create Sale"}
                      </Button> */}
                    </div>
                  </div>
                </div>

                <Tabs
                  defaultValue="all"
                  className="w-full"
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid grid-cols-2 w-full bg-white/80 dark:bg-slate-800/50 p-1 mb-6">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]"
                    >
                      All Investors Sell
                    </TabsTrigger>
                    <TabsTrigger
                      value="my"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_12px_rgba(59,130,246,0.2)]"
                    >
                      Create Sales
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0 space-y-4">
                    {filteredItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        No sales found matching your search
                      </div>
                    ) : (
                      <>
                        {viewMode === "grid" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item) => (
                              <SellItemCard
                                key={item?.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredItems.map((item) => (
                              <SellItemListView
                                key={item?.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="my" className="mt-0 space-y-4">
                    {/* {filteredMyItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        No sales found matching your search
                      </div>
                    ) : ( */}
                      <>
                      <CreateInstallmentForm />
                        {/* {viewMode === "grid" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {installments.length > 0  && installments.map((item: any) => (
                              <SellItemCard
                                key={item?.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredMyItems.map((item) => (
                              <SellItemListView
                                key={item?.id}
                                item={item}
                                onClick={() => handleItemClick(item)}
                                formatDate={formatDate}
                                formatCurrency={formatCurrency}
                              />
                            ))}
                          </div> */}
                        {/* )} */}
                      </>
                    {/* )} */}
                  </TabsContent>
                </Tabs>
              </div>
            )} </>)}
          </main>
        </div>
      </div>
    </div>
  );
}

function SellItemCard({ item, onClick, formatDate, formatCurrency }: any) {
  // Calculate progress percentage
  const progressPercentage = Math.round(
    (item?.completedPayments / item?.totalPayments) * 100
  );

  console.log(sellItemsData, "sellItemsData");
  

  return (
    <Card
      className="bg-white/50 p-0 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 overflow-hidden hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Status Badge */}
          <Badge
            className={`absolute top-3 right-3 z-10 ${
              item?.status === "active"
                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30"
            }`}
          >
            {item?.status === "active" ? "Active" : "Completed"}
          </Badge>
          <br></br>

          {/* Item Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/50">
                <img
                  src={item?.itemImage || "/placeholder.svg"}
                  alt={item?.itemName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-lg text-slate-900 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  {item?.itemName}
                </h3>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(item?.date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Investor */}
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-600/50">
                  <img
                    src={item?.customer?.image || "/placeholder.svg"}
                    alt={item?.customerName}
                  />
                </Avatar>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Customer
                  </div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item?.customer?.username}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Investor
                  </div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {item?.investors?.map((investor: any, index: number) => (
                      <span key={index}>
                      {/* {investor.name} */}
                      {/* {index < item.investors.length - 1 && ", "} */}
                      </span>
                    ))}
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {item?.investors?.map((investor: any, index: number) => (
                    <Avatar
                      key={index}
                      className="h-8 w-8 border border-slate-200 dark:border-slate-600/50"
                    >
                      <img
                      src={investor.image || "/placeholder.svg"}
                      alt={investor.name}
                      />
                    </Avatar>
                    ))}
                  </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {item?.completedPayments} of {item?.totalPayments} payments
                </span>
                <span className="text-cyan-600 dark:text-cyan-400">
                  {progressPercentage}%
                </span>
              </div>
            </div>

            {/* Rate */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md">
                {/* <Percent className="h-3.5 w-3.5 text-cyan-500" /> */}
                <span className="text-sm font-medium text-cyan-600 dark:text-cyan-300">
                  {item?.rate}% Rate
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50"
              >
                <span className="text-xs mr-1">Details</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
