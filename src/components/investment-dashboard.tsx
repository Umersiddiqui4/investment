
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  Wallet,
  Menu,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarOpen, setIsAuthenticated } from "@/redux/appSlice";
import Sidebaar from "./Sidebaar";
import { ThemeToggle } from "./theme/theme-toggle";
import {  sellItemsData, userData } from "./api/installments";
import { useNavigate } from "react-router-dom";
import SellItemListView from "./ui/SellItemListView";
import { SellItemDetails } from "./SellDetail";

// Sample data
const investmentData = {
  total: "$2,450,000",
  float: "$1,200,000",
  profit: "$350,000",
  profitPercentage: 14.3,
  installments: sellItemsData,
};

type InstallmentStatus = "all" | "due" | "pending" | "paid" | "late";

function filterInstallments(
  data: typeof sellItemsData,
  status: InstallmentStatus
) {
  const today = new Date();

  return data
    .map((item) => {
      let filteredInstallments = item.installments;

      if (status === "paid") {
        // Only include items where all installments are paid
        const allPaid = item.installments.every(
          (inst) => inst.status === "paid"
        );
        return allPaid ? { ...item } : null;
      }

      if (status === "due") {
        filteredInstallments = item.installments.filter((inst) => {
          const instDate = new Date(inst.date);
          return instDate > today && inst.status !== "paid";
        });
      } else if (status === "late") {
        filteredInstallments = item.installments.filter((inst) => {
          const instDate = new Date(inst.date);
          return instDate < today && inst.status !== "paid";
        });
      } else if (status === "pending") {
        filteredInstallments = item.installments.filter(
          (inst) => inst.status === "pending"
        );
      } else if (status === "all") {
        filteredInstallments = item.installments;
      }

      return filteredInstallments.length > 0
        ? { ...item, installments: filteredInstallments }
        : null;
    })
    .filter((item): item is (typeof data)[number] => item !== null);
}

export default function InvestmentDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const isMobile = useSelector((state: any) => state.app.isMobile);
  const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
  const dispatch = useDispatch();
  const investorsPerPage = 4;
  const navigate = useNavigate();
  
  // Filter installments based on active tab and search query
  const filteredInstallment = filterInstallments(
    sellItemsData,
    activeTab as InstallmentStatus
  ).filter((item) =>
    item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredInstallment.length / investorsPerPage);

  const indexOfLastInvestor = currentPage * investorsPerPage;
  const indexOfFirstInvestor = indexOfLastInvestor - investorsPerPage;
  const filteredInstallments = filteredInstallment.slice(
    indexOfFirstInvestor,
    indexOfLastInvestor
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);
  
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

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

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

        <Sidebaar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
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
                  placeholder="Search..."
                  className="pl-8 bg-slate-100/50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 focus:border-cyan-500 text-slate-900 dark:text-slate-100 w-full"
                  value={searchQuery}
                  onChange={(e: any) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-cyan-500">
                  <div className="bg-gradient-to-br from-purple-500 to-cyan-500 w-full h-full">
                    <img
                      src={userData.profile}
                      alt="User Avatar"
                      className="object-center object-cover"
                    />
                  </div>
                </Avatar>
                <Button
                  onClick={() => {
                    dispatch(setIsAuthenticated(false)), navigate("/auth");
                  }}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {selectedItem ? (
            <SellItemDetails item={selectedItem} onBack={handleBackClick} />
          ) : (
            <main className="flex-1 overflow-auto p-4 md:p-6">
              <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Investment Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden group hover:border-cyan-500/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                            Total Investment
                          </p>
                          <h3 className="text-xl md:text-3xl font-bold mt-1 bg-gradient-to-r from-cyan-600 to-purple-600 dark:from-cyan-400 dark:to-purple-500 bg-clip-text text-transparent">
                            {investmentData.total}
                          </h3>
                        </div>
                        <div className="p-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">
                          +12.5%
                        </span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                            Float Investment
                          </p>
                          <h3 className="text-xl md:text-3xl font-bold mt-1 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-500 bg-clip-text text-transparent">
                            {investmentData.float}
                          </h3>
                        </div>
                        <div className="p-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          <Wallet size={20} />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">
                          +8.3%
                        </span>
                        <span className="ml-1">from last month</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                            Investment Profit
                          </p>
                          <h3 className="text-xl md:text-3xl font-bold mt-1 bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-500 bg-clip-text text-transparent">
                            {investmentData.profit}
                          </h3>
                        </div>
                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp size={20} />
                        </div>
                      </div>
                      <div className="mt-2 md:mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500 font-medium">
                          +{investmentData.profitPercentage}%
                        </span>
                        <span className="ml-1">return rate</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Installment Tabs */}
                <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200 dark:border-slate-700/50">
                  <CardContent className="p-4 md:p-6">
                    <Tabs
                      defaultValue="all"
                      className="w-full"
                      onValueChange={setActiveTab}
                    >
                      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
                        <TabsList className="grid grid-cols-4 w-full min-w-[500px] md:min-w-0 bg-slate-100 dark:bg-slate-700/30 p-1">
                          <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-xs md:text-sm"
                          >
                            All Installments
                          </TabsTrigger>
                          <TabsTrigger
                            value="paid"
                            className="data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 text-xs md:text-sm"
                          >
                            Paid Installments
                          </TabsTrigger>
                          <TabsTrigger
                            value="late"
                            className="data-[state=active]:bg-rose-50 dark:data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400 text-xs md:text-sm"
                          >
                            Late Installments
                          </TabsTrigger>
                          <TabsTrigger
                            value="due"
                            className="data-[state=active]:bg-amber-50 dark:data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs md:text-sm"
                          >
                            Due Installments
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                        {filteredInstallments.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
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
                    </Tabs>
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          <ArrowLeft size={16} className="mr-2" />
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className={
                                currentPage === page
                                  ? "bg-cyan-500 hover:bg-cyan-600"
                                  : ""
                              }
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="text-slate-500 dark:text-slate-400"
                        >
                          Next
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
