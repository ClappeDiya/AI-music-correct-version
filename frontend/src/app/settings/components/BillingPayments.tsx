"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/Tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { 
  CreditCard, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

// Mock data - would come from API in a real app
const subscriptionPlans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    interval: "forever",
    features: [
      "Limited project storage (3)",
      "Basic AI music generation",
      "Standard quality exports",
      "Community support",
    ],
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99",
    interval: "monthly",
    features: [
      "Unlimited project storage",
      "Advanced AI music generation",
      "High quality exports",
      "Priority support",
      "Custom instruments",
      "Lyrics generation",
    ],
    isPopular: true,
  },
  {
    id: "team",
    name: "Team",
    price: "$49.99",
    interval: "monthly",
    features: [
      "Everything in Pro",
      "5 team members",
      "Shared projects",
      "Team analytics",
      "Admin controls",
      "API access",
    ],
    isPopular: false,
  },
];

const paymentMethods = [
  {
    id: "card-1",
    type: "Visa",
    last4: "4242",
    expiry: "12/24",
    isDefault: true,
  },
  {
    id: "card-2",
    type: "Mastercard", 
    last4: "5555",
    expiry: "10/23",
    isDefault: false,
  },
];

const billingHistory = [
  {
    id: "inv-001",
    date: "2023-06-01",
    amount: "$19.99",
    status: "paid",
    description: "Retoone AI Pro - Monthly",
  },
  {
    id: "inv-002",
    date: "2023-05-01",
    amount: "$19.99",
    status: "paid",
    description: "Retoone AI Pro - Monthly",
  },
  {
    id: "inv-003",
    date: "2023-04-01", 
    amount: "$19.99",
    status: "paid",
    description: "Retoone AI Pro - Monthly",
  },
  {
    id: "inv-004",
    date: "2023-03-01",
    amount: "$19.99",
    status: "failed",
    description: "Retoone AI Pro - Monthly",
  },
];

export function BillingPayments() {
  const [currentPlan, setCurrentPlan] = useState("pro");
  
  const handleChangePlan = (planId: string) => {
    toast.success(`Your subscription plan will be updated to ${planId.charAt(0).toUpperCase() + planId.slice(1)}`);
    setCurrentPlan(planId);
  };
  
  const handleAddPaymentMethod = () => {
    toast.info("Payment method feature would open a modal dialog");
  };
  
  const handleRemovePaymentMethod = (id: string) => {
    toast.success("Payment method removed successfully");
  };
  
  const handleSetDefaultPaymentMethod = (id: string) => {
    toast.success("Default payment method updated");
  };
  
  const handleDownloadInvoice = (id: string) => {
    toast.success(`Invoice ${id} downloaded`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`border ${
                  plan.isPopular 
                    ? "border-primary shadow-md" 
                    : "border-border"
                } ${
                  currentPlan === plan.id
                    ? "ring-2 ring-primary ring-offset-2"
                    : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <div className="mt-1 flex items-baseline text-primary">
                        <span className="text-3xl font-bold tracking-tight">
                          {plan.price}
                        </span>
                        <span className="ml-1 text-sm font-medium text-muted-foreground">
                          /{plan.interval}
                        </span>
                      </div>
                    </div>
                    {plan.isPopular && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={currentPlan === plan.id ? "outline" : "default"}
                    className="w-full"
                    disabled={currentPlan === plan.id}
                    onClick={() => handleChangePlan(plan.id)}
                  >
                    {currentPlan === plan.id ? "Current Plan" : "Choose Plan"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment-methods" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods for billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {method.type} •••• {method.last4}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiry}
                        </p>
                      </div>
                      {method.isDefault && (
                        <Badge variant="outline" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefaultPaymentMethod(method.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <Button onClick={handleAddPaymentMethod}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing-history">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your previous invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {billingHistory.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        {new Date(invoice.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{invoice.description}</TableCell>
                      <TableCell>{invoice.amount}</TableCell>
                      <TableCell>
                        {invoice.status === "paid" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Paid
                          </Badge>
                        ) : invoice.status === "pending" ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 