"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Minus, User, DollarSign, Clock, Users, Receipt } from "lucide-react"
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

interface TabsViewProps {
  currentCustomer: string
  orders: any[]
  total: number
}

export default function TabsView({ currentCustomer, orders, total }: TabsViewProps) {
  const [activeTab, setActiveTab] = useState("open")
  const [searchQuery, setSearchQuery] = useState("")
  const [tabs, setTabs] = useState<any[]>([])
  const [showNewTabForm, setShowNewTabForm] = useState(false)
  const [newTabName, setNewTabName] = useState("")
  const [selectedTabDetails, setSelectedTabDetails] = useState<any>(null)

  // Load tabs from localStorage on component mount
  useEffect(() => {
    const savedTabs = localStorage.getItem("customerTabs")
    if (savedTabs) {
      try {
        setTabs(JSON.parse(savedTabs))
      } catch (error) {
        console.error("Error loading tabs:", error)
        setTabs([])
      }
    }
  }, [])

  // Save tabs to localStorage whenever tabs change
  useEffect(() => {
    localStorage.setItem("customerTabs", JSON.stringify(tabs))
  }, [tabs])

  const createNewTab = () => {
    if (newTabName.trim()) {
      const newTab = {
        id: Date.now().toString(),
        customerName: newTabName.trim(),
        items: orders.map(order => ({ ...order })),
        total: total,
        status: "Open",
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setTabs(prev => [...prev, newTab])
      setNewTabName("")
      setShowNewTabForm(false)
    }
  }

  const updateQuantity = (tabId: string, itemIndex: number, newQuantity: number) => {
    if (newQuantity < 0) return
    
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        const updatedItems = [...tab.items]
        if (newQuantity === 0) {
          updatedItems.splice(itemIndex, 1)
        } else {
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], quantity: newQuantity }
        }
        
        const newTotal = calculateTabTotal(updatedItems)
        return { 
          ...tab, 
          items: updatedItems, 
          total: newTotal,
          updatedAt: new Date()
        }
      }
      return tab
    }))
  }

  const addItemToTab = (tabId: string, item: any) => {
    setTabs(prev => prev.map(tab => {
      if (tab.id === tabId) {
        const existingItemIndex = tab.items.findIndex(existing => existing.id === item.id)
        let updatedItems
        
        if (existingItemIndex !== -1) {
          updatedItems = [...tab.items]
          updatedItems[existingItemIndex].quantity += item.quantity
        } else {
          updatedItems = [...tab.items, item]
        }
        
        const newTotal = calculateTabTotal(updatedItems)
        return { 
          ...tab, 
          items: updatedItems, 
          total: newTotal,
          updatedAt: new Date()
        }
      }
      return tab
    }))
  }

  const closeTab = (tabId: string) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, status: "Closed", updatedAt: new Date() }
        : tab
    ))
  }

  const calculateTabTotal = (items: any[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Users className="h-12 w-12 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">No {activeTab} tabs</h3>
      <p className="text-sm text-gray-400 text-center max-w-sm">
        {activeTab === "open" 
          ? "Create a new tab to start tracking customer orders" 
          : "No closed tabs yet. Close some open tabs to see them here."
        }
      </p>
    </div>
  )

  // Filter tabs based on status and search
  const filteredTabs = tabs.filter(tab => {
    const matchesStatus = activeTab === "open" ? tab.status === "Open" : tab.status === "Closed"
    const matchesSearch = tab.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Tabs</h1>
          <p className="text-gray-600">Manage open and closed customer tabs</p>
        </div>
        
        <Dialog open={showNewTabForm} onOpenChange={setShowNewTabForm}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Tab
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Tab</DialogTitle>
              <DialogDescription>
                Create a new tab for a customer. Current order items will be added to this tab.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="text-sm font-medium mb-2 block">
                  Customer Name
                </label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createNewTab()}
                />
              </div>
              
              {orders.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Current Order ({orders.length} items):</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {orders.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTabForm(false)}>
                Cancel
              </Button>
              <Button onClick={createNewTab} disabled={!newTabName.trim()}>
                Create Tab
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Open Tabs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tabs.filter(tab => tab.status === "Open").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Closed Tabs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tabs.filter(tab => tab.status === "Closed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${tabs.filter(tab => tab.status === "Closed").reduce((sum, tab) => sum + tab.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="open"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Open Tabs ({tabs.filter(tab => tab.status === "Open").length})
            </TabsTrigger>
            <TabsTrigger 
              value="closed"
              className="data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Closed Tabs ({tabs.filter(tab => tab.status === "Closed").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs List */}
      <div className="flex-1 min-h-0">
        {filteredTabs.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="h-full">
            <div className="grid gap-4 pb-4">
              {filteredTabs.map((tab) => (
                <Card key={tab.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <CardTitle className="text-lg">{tab.customerName}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {tab.status === "Open" ? "Active since" : "Closed on"} {" "}
                            {new Date(tab.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={tab.status === "Open" ? "default" : "secondary"}>
                        {tab.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Tab Items */}
                    {tab.items.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4">No items in this tab</p>
                    ) : (
                      tab.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <span className="text-gray-500 text-sm ml-2">${item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {tab.status === "Open" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7 rounded-full bg-transparent touch-manipulation"
                                  onClick={() => updateQuantity(tab.id, index, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            
                            <span className="w-8 text-center text-sm font-medium bg-gray-100 rounded px-2 py-1">
                              {item.quantity}
                            </span>
                            
                            {tab.status === "Open" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 rounded-full bg-transparent touch-manipulation"
                                onClick={() => updateQuantity(tab.id, index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <span className="text-gray-900 font-medium ml-2 min-w-[50px] text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Tab Total */}
                    {tab.items.length > 0 && (
                      <div className="border-t pt-3 mb-3">
                        <div className="flex justify-between text-sm font-semibold">
                          <span>Total:</span>
                          <span>${calculateTabTotal(tab.items).toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 text-sm py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent touch-manipulation"
                            onClick={() => setSelectedTabDetails(tab)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Tab Details - {tab.customerName}</DialogTitle>
                            <DialogDescription>
                              Complete information for this customer tab
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Status:</span>
                                <Badge className="ml-2" variant={tab.status === "Open" ? "default" : "secondary"}>
                                  {tab.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="font-medium">Created:</span>
                                <span className="ml-2">{new Date(tab.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="border rounded-lg p-3">
                              <h4 className="font-medium mb-2">Order Items:</h4>
                              {tab.items.length === 0 ? (
                                <p className="text-gray-500 text-sm">No items</p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {tab.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                      <span>{item.quantity}x {item.name}</span>
                                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="border-t mt-2 pt-2">
                                <div className="flex justify-between font-semibold">
                                  <span>Total:</span>
                                  <span>${calculateTabTotal(tab.items).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedTabDetails(null)}>
                              Close
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {tab.status === "Open" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="flex-1 text-sm py-2 bg-green-600 hover:bg-green-700 text-white touch-manipulation">
                              Close Tab
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Close Tab</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to close the tab for {tab.customerName}? 
                                This will mark the tab as completed with a total of ${calculateTabTotal(tab.items).toFixed(2)}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => closeTab(tab.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Close Tab
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
