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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
