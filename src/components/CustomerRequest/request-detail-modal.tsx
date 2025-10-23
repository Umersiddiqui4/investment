"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateRequest, changeRequestStatus } from "../../lib/clients/apiClients"

interface RequestDetailModalProps {
  request: any
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function RequestDetailModal({ request, isOpen, onClose, onUpdate }: RequestDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [editData, setEditData] = useState({
    productServiceName: "",
    description: "",
    cost: 0,
    periodMonths: 0,
    interestRate: 0,
    likelyPaymentDay: 15,
  })

  useEffect(() => {
    if (request) {
      setEditData({
        productServiceName: request.productServiceName || "",
        description: request.description || "",
        cost: request.cost || 0,
        periodMonths: request.periodMonths || 0,
        interestRate: request.interestRate || 0,
        likelyPaymentDay: request.likelyPaymentDay || 15,
      })
    }
  }, [request, isOpen])
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({
      ...prev,
      [name]: name === "productServiceName" || name === "description" ? value : Number(value) || 0,
    }))
  }

  const handleSaveEdit = async () => {
    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      await updateRequest(request.id, editData)
      setSuccess(true)
      setIsEditing(false)
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update request"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      setError("Please select a status")
      return
    }

    if (selectedStatus === "REJECTED" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason")
      return
    }

    setError(null)
    setSuccess(false)
    setIsLoading(true)

    try {
      await changeRequestStatus(request.id, selectedStatus, selectedStatus === "REJECTED" ? rejectionReason : undefined)
      setSuccess(true)
      setIsChangingStatus(false)
      setSelectedStatus("")
      setRejectionReason("")
      onUpdate()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to change status"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Request Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl leading-none">
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-sm font-medium text-green-800">Updated successfully!</p>
          </div>
        )}

        {!isEditing && !isChangingStatus ? (
          <div className="space-y-6">
            {/* View Mode */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                  <p className="font-semibold text-foreground">{request?.customerId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Company ID</p>
                  <p className="font-semibold text-foreground">{request?.companyId}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Product/Service</p>
                <p className="font-semibold text-foreground">{request?.productServiceName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{request?.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cost</p>
                  <p className="font-semibold text-primary">
                    ${request?.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Period</p>
                  <p className="font-semibold text-foreground">{request?.periodMonths} months</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                  <p className="font-semibold text-foreground">{request?.interestRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payment Day</p>
                  <p className="font-semibold text-foreground">Day {request?.likelyPaymentDay}</p>
                </div>
              </div>

              {request?.status && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-semibold text-foreground">{request.status}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Edit Request
              </Button>
              <Button
                onClick={() => setIsChangingStatus(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Change Status
              </Button>
              <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                Close
              </Button>
            </div>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            {/* Edit Mode */}
            <div>
              <Label htmlFor="productServiceName" className="text-sm font-medium text-foreground">
                Product/Service Name
              </Label>
              <Input
                id="productServiceName"
                name="productServiceName"
                value={editData.productServiceName}
                onChange={handleEditChange}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                rows={4}
                className="mt-1"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost" className="text-sm font-medium text-foreground">
                  Cost Amount
                </Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  value={editData.cost}
                  onChange={handleEditChange}
                  step="0.01"
                  className="mt-1"
                  disabled={isLoading}
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
                  value={editData.interestRate}
                  onChange={handleEditChange}
                  step="0.01"
                  className="mt-1"
                  disabled={isLoading}
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
                  value={editData.periodMonths}
                  onChange={handleEditChange}
                  step="1"
                  className="mt-1"
                  disabled={isLoading}
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
                  value={editData.likelyPaymentDay}
                  onChange={handleEditChange}
                  step="1"
                  min="1"
                  max="31"
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" disabled={isLoading} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status Change Mode */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-foreground">
                Select New Status
              </Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                disabled={isLoading}
              >
              <option value="">-- Choose Status --</option>
                <option value="REQUESTED">Requested</option>
                <option value="REJECTED">Rejected</option>
                <option value="WAITING_PROFILE_COMPLETION">Waiting Profile Completion</option>
                <option value="APPROVED">Approved</option>
                <option value="AWAITING_FUNDS">Awaiting Funds</option>
                <option value="FUNDS_ISSUED">Funds Issued</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {selectedStatus === "REJECTED" && (
              <div>
                <Label htmlFor="rejectionReason" className="text-sm font-medium text-foreground">
                  Rejection Reason
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  className="mt-1"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                onClick={handleStatusChange}
                disabled={isLoading || !selectedStatus}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
              <Button
                onClick={() => {
                  setIsChangingStatus(false)
                  setSelectedStatus("")
                  setRejectionReason("")
                }}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
