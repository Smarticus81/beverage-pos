"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function OrderPanel({ orders, removeFromOrder, updateQuantity, total, onCompleteOrder }) {
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [isProcessingOrder, setIsProcessingOrder] = useState(false)

  // Add debug logging
  useEffect(() => {
    console.log("OrderPanel received orders:", orders)
    console.log("Orders length:", orders?.length)
    console.log("Orders type:", typeof orders, Array.isArray(orders))

    if (orders && orders.length > 0) {
      console.log("First order item:", orders[0])
    }

    // Validate order data
    const invalidItems = orders.filter(
      (item) =>
        !item.id ||
        !item.name ||
        typeof item.price !== "number" ||
        isNaN(item.price) ||
        typeof item.quantity !== "number" ||
        isNaN(item.quantity),
    )

    if (invalidItems.length > 0) {
      console.warn("OrderPanel received invalid items:", invalidItems)
    }
  }, [orders])

  // Add a function to safely format prices
  const formatPrice = (price) => {
    if (typeof price !== "number" || isNaN(price)) {
      console.warn(`Invalid price value: ${price}`)
      return "0.00"
    }
    return price.toFixed(2)
  }

  const handleCompleteOrder = async () => {
    setIsProcessingOrder(true)
    try {
      await onCompleteOrder()
      setShowCompleteDialog(false)
    } catch (error) {
      console.error("Error completing order:", error)
    } finally {
      setIsProcessingOrder(false)
    }
  }

  return (
    <Card className="border-[#e2e8f0] h-full flex flex-col">
      <CardHeader className="border-b border-[#e2e8f0] py-2 px-3">
        <h2 className="text-sm font-medium text-black">Current Order</h2>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {!orders || orders.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No items in order
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {orders.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-black truncate">{item.name}</h3>
                    <p className="text-xs text-gray-600">${formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-5 w-5 rounded-full border-[#e2e8f0]"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-2 w-2" />
                    </Button>

                    <span className="w-4 text-center text-xs text-black">{item.quantity}</span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-5 w-5 rounded-full border-[#e2e8f0]"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-2 w-2" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-[#a0aec0] hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{item.name}" from the order?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeFromOrder(item.id)} className="bg-red-600 hover:bg-red-700">
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-[#e2e8f0] p-3">
        <div className="flex justify-between w-full mb-2">
          <span className="text-sm text-black">Total</span>
          <span className="font-bold text-sm text-[#FFD700]">
            ${typeof total === "number" && !isNaN(total) ? total.toFixed(2) : "0.00"}
          </span>
        </div>

        <div className="flex gap-2 w-full">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 border-red-300 hover:bg-red-50 text-red-500"
                disabled={orders.length === 0}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Void Order
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Void Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to void this entire order? This action cannot be undone and all items will be removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeFromOrder("all")} className="bg-red-600 hover:bg-red-700">
                  Void Order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogTrigger asChild>
              <Button 
                className="flex-1 bg-black hover:bg-gray-800 text-[#FFD700]" 
                disabled={orders.length === 0}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Complete Order</DialogTitle>
                <DialogDescription>
                  Review your order before completing the transaction.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {orders.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span className="text-[#FFD700]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowCompleteDialog(false)} className="w-full sm:w-auto">
                  Review Order
                </Button>
                <Button 
                  onClick={handleCompleteOrder} 
                  disabled={isProcessingOrder}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {isProcessingOrder ? "Processing..." : "Confirm & Pay"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}
