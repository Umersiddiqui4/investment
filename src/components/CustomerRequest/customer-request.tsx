import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@radix-ui/react-avatar"
import Sidebaar from "../Sidebaar"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { data, useNavigate } from "react-router-dom"
import { setSidebarOpen, setIsAuthenticated } from "@/redux/appSlice";
import {
    Search,
    Bell,
    Menu,
} from "lucide-react";
import { ThemeToggle } from "../theme/theme-toggle";
import { userData } from "../api/installments";
import useUsers from "../../hooks/getApi"
import { apiRequest } from "../../lib/clients/apiClients"
import { RequestTabs } from "./Request-tabs"
import { RequestDetailModal } from "./request-detail-modal"

interface RequestFormData {
    customerId: string
    companyId: string
    productServiceName: string
    description: string
    cost: number
    periodMonths: number
    interestRate: number
    likelyPaymentDay: number
}

const PRODUCT_SUGGESTIONS = [
    "Business Loan",
    "Personal Loan",
    "Equipment Financing",
    "Working Capital Loan",
    "Expansion Loan",
    "Acquisition Loan",
    "Refinancing",
    "Line of Credit",
]

const DESCRIPTION_SUGGESTIONS = [
    "Request for business expansion loan to purchase new equipment",
    "Financing for inventory purchase and working capital",
    "Equipment lease financing for manufacturing",
    "Short-term working capital for seasonal business",
    "Expansion funding for new location",
    "Debt consolidation and refinancing",
    "Purchase order financing",
    "Bridge financing for acquisition",
]

const STATUS_OPTIONS = [
    { value: "REQUESTED", label: "Requested" },
    { value: "REJECTED", label: "Rejected" },
    { value: "WAITING_PROFILE_COMPLETION", label: "Waiting Profile Completion" },
    { value: "APPROVED", label: "Approved" },
    { value: "AWAITING_FUNDS", label: "Awaiting Funds" },
    { value: "FUNDS_ISSUED", label: "Funds Issued" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ]


export function CustomerRequest() {

    const [inputValues, setInputValues] = useState({
        cost: "",
        periodMonths: "",
        interestRate: "",
        likelyPaymentDay: "15",
    })
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}")?.data?.user;
    const [formData, setFormData] = useState<RequestFormData>({
        customerId: currentUser?.id || "",
        companyId: currentUser?.companyId || "",
        productServiceName: "",
        description: "",
        cost: inputValues.cost === "" ? 0 : Number(inputValues.cost),
        periodMonths: inputValues.periodMonths === "" ? 0 : Number(inputValues.periodMonths),
        interestRate: inputValues.interestRate === "" ? 0 : Number(inputValues.interestRate),
        likelyPaymentDay: inputValues.likelyPaymentDay === "" ? 15 : Number(inputValues.likelyPaymentDay),
    })


    const [productSuggestions, setProductSuggestions] = useState<string[]>([])
    const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([])
    const [showProductSuggestions, setShowProductSuggestions] = useState(false)
    const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false)
    const productInputRef = useRef<HTMLInputElement>(null)
    const descriptionInputRef = useRef<HTMLTextAreaElement>(null)
    const isMobile = useSelector((state: any) => state.app.isMobile);
    const sidebarOpen = useSelector((state: any) => state.app.sideBarOpen);
    const investorsPerPage = 4;
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const { data: userData } = useUsers("ADMIN");
    console.log("userData", userData);
    console.log("currentUser", currentUser);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [activeTab, setActiveTab] = useState<"create" | "view">("create")
    const [refreshTrigger, setRefreshTrigger] = useState(0)


    const filterSuggestions = (input: string, allSuggestions: string[]) => {
        if (!input.trim()) return []
        return allSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(input.toLowerCase()))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target

        if (name === "cost" || name === "periodMonths" || name === "interestRate" || name === "likelyPaymentDay") {
            setInputValues((prev) => ({
                ...prev,
                [name]: value,
            }))
            setFormData((prev) => ({
                ...prev,
                [name]: value === "" ? 0 : Number.parseFloat(value) || 0,
            }))
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }))

            if (name === "productServiceName") {
                const filtered = filterSuggestions(value, PRODUCT_SUGGESTIONS)
                setProductSuggestions(filtered)
                setShowProductSuggestions(filtered.length > 0)
            } else if (name === "description") {
                const filtered = filterSuggestions(value, DESCRIPTION_SUGGESTIONS)
                setDescriptionSuggestions(filtered)
                setShowDescriptionSuggestions(filtered.length > 0)
            }
        }
    }

    const handleSelectProductSuggestion = (suggestion: string) => {
        setFormData((prev) => ({
            ...prev,
            productServiceName: suggestion,
        }))
        setShowProductSuggestions(false)
    }

    const handleSelectDescriptionSuggestion = (suggestion: string) => {
        setFormData((prev) => ({
            ...prev,
            description: suggestion,
        }))
        setShowDescriptionSuggestions(false)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
                setShowProductSuggestions(false)
            }
            if (descriptionInputRef.current && !descriptionInputRef.current.contains(event.target as Node)) {
                setShowDescriptionSuggestions(false)
            }
        }
        setRefreshTrigger((prev) => prev + 1)
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        setIsLoading(true)

        try {
            await apiRequest<any>("/api/v1/requests", "POST", formData)
            console.log("[v0] Request submitted successfully:", formData)

            setSuccess(true)
            // Reset form after successful submission
            setFormData({
                customerId: "",
                companyId: "",
                productServiceName: "",
                description: "",
                cost: 0,
                periodMonths: 0,
                interestRate: 0,
                likelyPaymentDay: 15,
            })
            setInputValues({
                cost: "",
                periodMonths: "",
                interestRate: "",
                likelyPaymentDay: "15",
            })

            setRefreshTrigger((prev) => prev + 1)

            // Clear success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to submit request. Please try again."
            console.log("[v0] Error submitting request:", errorMessage)
            setError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Calculate monthly installment
    const monthlyInstallment =
        formData.cost > 0 && formData.periodMonths > 0 ? (formData.cost / formData.periodMonths).toFixed(2) : "0.00"

    const totalPrice =
        formData.cost > 0 ? (formData.cost + (formData.cost * formData.interestRate) / 100).toFixed(2) : "0.00"

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
                                            src={userData?.profile}
                                            alt="User Avatar"
                                            className="object-center object-cover"
                                        />
                                    </div>
                                </Avatar>
                                <Button
                                    onClick={() => {
                                        dispatch(setIsAuthenticated(false)), navigate("/login");
                                    }}
                                >
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </header>


                    <div className="flex-1 overflow-auto p-4 md:p-6">
                        <div className="max-w-7xl mx-auto">
                            <RequestTabs activeTab={activeTab} onTabChange={setActiveTab} />

                            {activeTab === "create" ? (
                                <>
                                    <h1 className="text-3xl font-bold text-foreground mb-8">Create Request</h1>

                                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Main Form Section */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Request Details */}
                                            <Card className="p-6 border border-border">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-primary font-semibold">📋</span>
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-foreground">Request Details</h2>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="customerId" className="text-sm font-medium text-foreground">
                                                                Customer ID
                                                            </Label>
                                                            <Input
                                                                id="customerId"
                                                                name="customerId"
                                                                value={formData.customerId || currentUser?.id}
                                                                onChange={handleChange}
                                                                placeholder="Enter customer ID"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                readOnly
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="companyId" className="text-sm font-medium text-foreground">
                                                                Company ID
                                                            </Label>
                                                            <Input
                                                                id="companyId"
                                                                name="companyId"
                                                                value={formData.companyId || currentUser?.companyId}
                                                                onChange={handleChange}
                                                                placeholder="Enter company ID"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                readOnly
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="relative">
                                                        <Label htmlFor="productServiceName" className="text-sm font-medium text-foreground">
                                                            Product/Service Name
                                                        </Label>
                                                        <Input
                                                            ref={productInputRef}
                                                            id="productServiceName"
                                                            name="productServiceName"
                                                            value={formData.productServiceName}
                                                            onChange={handleChange}
                                                            required
                                                            onFocus={() => {
                                                                if (formData.productServiceName) {
                                                                    const filtered = filterSuggestions(formData.productServiceName, PRODUCT_SUGGESTIONS)
                                                                    setProductSuggestions(filtered)
                                                                    setShowProductSuggestions(filtered.length > 0)
                                                                }
                                                            }}
                                                            placeholder="e.g., Business Loan"
                                                            className="mt-1"
                                                            disabled={isLoading}
                                                        />
                                                        {showProductSuggestions && productSuggestions.length > 0 && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10">
                                                                {productSuggestions.map((suggestion, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => handleSelectProductSuggestion(suggestion)}
                                                                        className="w-full text-left px-4 py-2 hover:bg-primary/10 text-foreground text-sm first:rounded-t-md last:rounded-b-md transition-colors"
                                                                    >
                                                                        {suggestion}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="relative">
                                                        <Label htmlFor="description" className="text-sm font-medium text-foreground">
                                                            Description
                                                        </Label>
                                                        <Textarea
                                                            ref={descriptionInputRef}
                                                            id="description"
                                                            name="description"
                                                            value={formData.description}
                                                            onChange={handleChange}
                                                            required
                                                            onFocus={() => {
                                                                if (formData.description) {
                                                                    const filtered = filterSuggestions(formData.description, DESCRIPTION_SUGGESTIONS)
                                                                    setDescriptionSuggestions(filtered)
                                                                    setShowDescriptionSuggestions(filtered.length > 0)
                                                                }
                                                            }}
                                                            placeholder="Describe the request in detail..."
                                                            rows={4}
                                                            className="mt-1"
                                                            disabled={isLoading}
                                                        />
                                                        {showDescriptionSuggestions && descriptionSuggestions.length > 0 && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                                                                {descriptionSuggestions.map((suggestion, index) => (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => handleSelectDescriptionSuggestion(suggestion)}
                                                                        className="w-full text-left px-4 py-2 hover:bg-primary/10 text-foreground text-sm first:rounded-t-md last:rounded-b-md transition-colors border-b border-border last:border-b-0"
                                                                    >
                                                                        {suggestion}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Financial Details */}
                                            <Card className="p-6 border border-border">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <span className="text-primary font-semibold">💰</span>
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-foreground">Financial Details</h2>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="cost" className="text-sm font-medium text-foreground">
                                                                Cost Amount
                                                            </Label>
                                                            <Input
                                                                id="cost"
                                                                name="cost"
                                                                type="number"
                                                                value={inputValues.cost}
                                                                onChange={handleChange}
                                                                placeholder="5.00"
                                                                step="0.01"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="interestRate" className="text-sm font-medium text-foreground">
                                                                Interest Rate (%)
                                                            </Label>
                                                            <Input
                                                                id="interestRate"
                                                                name="interestRate"
                                                                type="number"
                                                                value={inputValues.interestRate}
                                                                onChange={handleChange}
                                                                placeholder="0.00"
                                                                step="0.01"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label htmlFor="periodMonths" className="text-sm font-medium text-foreground">
                                                                Period (Months)
                                                            </Label>
                                                            <Input
                                                                id="periodMonths"
                                                                name="periodMonths"
                                                                type="number"
                                                                value={inputValues.periodMonths}
                                                                onChange={handleChange}
                                                                placeholder="0"
                                                                step="1"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="likelyPaymentDay" className="text-sm font-medium text-foreground">
                                                                Payment Day of Month
                                                            </Label>
                                                            <Input
                                                                id="likelyPaymentDay"
                                                                name="likelyPaymentDay"
                                                                type="number"
                                                                value={inputValues.likelyPaymentDay}
                                                                onChange={handleChange}
                                                                placeholder="15"
                                                                step="1"
                                                                min="1"
                                                                max="31"
                                                                className="mt-1"
                                                                disabled={isLoading}
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                            {error && (
                                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                                </div>
                                            )}

                                            {success && (
                                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                                    <p className="text-sm font-medium text-green-800">Request submitted successfully!</p>
                                                </div>
                                            )}

                                            {/* Submit Button */}
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? "Submitting..." : "Submit Request"}
                                            </Button>
                                        </div>

                                        {/* Summary Panel */}
                                        <div className="lg:col-span-1">
                                            <Card className="p-6 border border-border sticky top-6">
                                                <h3 className="text-lg font-semibold text-foreground mb-6">Request Summary</h3>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center pb-3 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Cost Amount:</span>
                                                        <span className="font-semibold text-foreground">
                                                            ${formData.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center pb-3 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Interest Rate:</span>
                                                        <span className="font-semibold text-foreground">{formData.interestRate.toFixed(2)}%</span>
                                                    </div>

                                                    <div className="flex justify-between items-center pb-3 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Total Price:</span>
                                                        <span className="font-semibold text-primary text-lg">
                                                            $
                                                            {Number.parseFloat(totalPrice).toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center pb-3 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Time Period:</span>
                                                        <span className="font-semibold text-foreground">{formData.periodMonths} months</span>
                                                    </div>

                                                    <div className="flex justify-between items-center pb-3 border-b border-border">
                                                        <span className="text-sm text-muted-foreground">Monthly Installment:</span>
                                                        <span className="font-semibold text-primary">
                                                            $
                                                            {Number.parseFloat(monthlyInstallment).toLocaleString("en-US", {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            })}
                                                        </span>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2">
                                                        <span className="text-sm text-muted-foreground">Payment Day:</span>
                                                        <span className="font-semibold text-foreground">Day {formData.likelyPaymentDay}</span>
                                                    </div>

                                                    {formData.productServiceName && (
                                                        <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
                                                            <p className="text-xs text-muted-foreground mb-1">Product/Service:</p>
                                                            <p className="font-semibold text-foreground text-sm">{formData.productServiceName}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="mt-8">
                                    <h1 className="text-3xl font-bold text-foreground mb-8">All Requests</h1>
                                    <RequestsList refreshTrigger={refreshTrigger} currentUser={currentUser} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}



function RequestsList({ refreshTrigger, currentUser }: { refreshTrigger: number, currentUser: any }) {
    const [requests, setRequests] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
      const fetchRequests = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiRequest<any>("/api/v1/requests?page=1&take=10", "GET")

            if (response?.data && Array.isArray(response.data)) {
              setRequests(response.data)
              setTotalItems(response.total || response.data.length)
            } else if (Array.isArray(response)) {
              setRequests(response)
              setTotalItems(response.length)
            } else {
              setRequests([])
              setTotalItems(0)
            }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to fetch requests"
          setError(errorMessage)
        } finally {
          setIsLoading(false)
        }
      }
  
      fetchRequests()
    }, [refreshTrigger, currentPage, pageSize, searchQuery, selectedStatus])
  
    const handleOpenModal = (request: any) => {
      setSelectedRequest(request)
      setIsModalOpen(true)
    }
  
    const handleRequestUpdate = () => {
      const fetchRequests = async () => {
        try {
          const response = await apiRequest<any>("/api/v1/requests?page=1&take=10", "GET")
          setRequests(response?.data || [])
        } catch (err) {
          console.error("Failed to refresh requests:", err)
        }
      }
      fetchRequests()
    }
    let filteredRequests = requests

    if (selectedStatus !== "ALL") {
      filteredRequests = filteredRequests.filter((req) => req.status === selectedStatus)
    }
  
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filteredRequests = filteredRequests.filter(
        (req) =>
          req.customerId?.toLowerCase().includes(query) ||
          req.companyId?.toLowerCase().includes(query) ||
          req.productServiceName?.toLowerCase().includes(query) ||
          req.description?.toLowerCase().includes(query),
      )
    }
  
    const totalPages = Math.ceil(filteredRequests.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex)
  
    const handlePreviousPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
    }
  
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1)
      }
    }
  
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
      setCurrentPage(1)
    }
  
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedStatus(e.target.value)
      setCurrentPage(1)
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      )
    }
  
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )
    }
  
    if (requests.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No requests found</p>
        </div>
      )
    }
  
    return (
      <>
       <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("grid")}
            variant={viewMode === "grid" ? "default" : "outline"}
            className="px-4 py-2"
          >
            Grid View
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            variant={viewMode === "list" ? "default" : "outline"}
            className="px-4 py-2"
          >
            List View
          </Button>
        </div>

        <div className="w-full sm:w-auto">
          <Label htmlFor="status-filter" className="text-sm font-medium text-foreground block mb-2">
            Filter by Status
          </Label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="ALL">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          </div>
        </div>

        <div className="w-full">
          <Label htmlFor="search" className="text-sm font-medium text-foreground block mb-2">
            Search Requests
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search by Customer ID, Company ID, Product, or Description..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {paginatedRequests.map((request, index) => (
            <Card key={index} className="p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                  <p className="font-semibold text-foreground">{request.customerId}</p>
                </div>
  
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Product/Service</p>
                  <p className="font-semibold text-foreground">{request.productServiceName}</p>
                </div>
  
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground line-clamp-2">{request.description}</p>
                </div>
  
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cost</p>
                    <p className="font-semibold text-primary">
                      ${request.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Period</p>
                    <p className="font-semibold text-foreground">{request.periodMonths}m</p>
                  </div>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                    <p className="font-semibold text-foreground">{request.interestRate.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Day</p>
                    <p className="font-semibold text-foreground">Day {request.likelyPaymentDay}</p>
                  </div>
                </div>
                {request.status && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-xs font-semibold text-primary">{request.status}</p>
                  </div>
                )}
                <Button
                  onClick={() => handleOpenModal(request)}
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View & Edit Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
        ) : (
            <div className="space-y-3">
            {paginatedRequests.map((request, index) => (
                <Card key={index} className="p-4 border border-border hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                        <p className="font-semibold text-foreground text-sm">{request.customerId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Product</p>
                        <p className="font-semibold text-foreground text-sm">{request.productServiceName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cost</p>
                        <p className="font-semibold text-primary text-sm">
                          ${request.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                        <p className="text-xs font-semibold text-primary">{request.status}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleOpenModal(request)}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      View & Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
    
    {paginatedRequests.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedStatus !== "ALL" ? "No requests match your search or filter" : "No requests found"}
          </p>
        </div>
      )}

      {filteredRequests.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-border rounded-lg bg-background">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length}{" "}
            requests
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="page-size" className="text-sm font-medium text-foreground">
                Per Page:
              </Label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number.parseInt(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                variant="outline"
                className="px-3 py-1 bg-transparent"
              >
                Previous
              </Button>

              <div className="text-sm font-medium text-foreground px-3">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                className="px-3 py-1 bg-transparent"
              >
                Next
              </Button>
            </div>
          </div>
            </div>
          )}
  
        <RequestDetailModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdate={handleRequestUpdate}
        />
      </>
    )
  }
  
