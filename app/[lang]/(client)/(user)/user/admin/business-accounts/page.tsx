"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
} from "lucide-react";
import { useDictionary } from "@/lib/dictionary-context";
import { t } from "@/lib/dictionary-utils";

interface BusinessAccount {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isBusiness: boolean;
  businessApprovedBy?: string;
  businessApprovedAt?: string;
  createdAt: string;
  membershipType: string;
}

export default function BusinessAccountsAdmin() {
  const { user } = useUser();
  const dictionary = useDictionary();
  const p = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.admin.businessAccountsPage.${path}`, fallback);
  const c = (path: string, fallback: string) =>
    t(dictionary, `userDashboard.admin.common.${path}`, fallback);
  const statusLabel = (key: string, fallback: string) =>
    t(dictionary, `userDashboard.admin.status.${key}`, fallback);

  const [accounts, setAccounts] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessAccounts();
  }, []);

  const fetchBusinessAccounts = async () => {
    try {
      const response = await fetch("/api/admin/business-accounts");
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      } else {
        toast.error(
          p("toasts.fetchFailed", "Failed to fetch business accounts")
        );
      }
    } catch (error) {
      console.error("Error fetching business accounts:", error);
      toast.error(p("toasts.loadError", "Error loading business accounts"));
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (accountId: string, approve: boolean) => {
    setProcessing(accountId);
    try {
      const response = await fetch("/api/admin/business-accounts/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          approve,
          adminEmail: user?.emailAddresses?.[0]?.emailAddress,
        }),
      });

      if (response.ok) {
        toast.success(
          approve
            ? p("toasts.approved", "Business account approved successfully")
            : p("toasts.rejected", "Business account rejected successfully")
        );
        fetchBusinessAccounts();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error ||
            p("toasts.updateFailed", "Failed to update business account")
        );
      }
    } catch (error) {
      console.error("Error updating business account:", error);
      toast.error(p("toasts.updateError", "Error updating business account"));
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (account: BusinessAccount) => {
    if (account.isBusiness && account.businessApprovedBy) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {statusLabel("approved", "Approved")}
        </Badge>
      );
    } else if (account.isBusiness) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          {statusLabel("pending", "Pending")}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
          <User className="w-3 h-3 mr-1" />
          {statusLabel("regular", "Regular")}
        </Badge>
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {p("title", "Business Account Management")}
        </h1>
        <p className="text-gray-600">
          {p("subtitle", "Manage and approve business account requests")}
        </p>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {p("emptyTitle", "No Business Accounts")}
            </h3>
            <p className="text-gray-500">
              {p("emptyDescription", "No business account requests found.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <Card
              key={account._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {account.firstName && account.lastName
                          ? `${account.firstName} ${account.lastName}`
                          : account.email}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {account.email}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {c("joinedOn", "Joined {date}").replace(
                            "{date}",
                            new Date(account.createdAt).toLocaleDateString()
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(account)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {c("membership", "Membership:")}{" "}
                      <span className="font-medium capitalize">
                        {account.membershipType}
                      </span>
                    </p>
                    {account.businessApprovedBy && (
                      <p className="text-sm text-gray-600">
                        {c("approvedBy", "Approved by:")}{" "}
                        <span className="font-medium">
                          {account.businessApprovedBy}
                        </span>
                      </p>
                    )}
                    {account.businessApprovedAt && (
                      <p className="text-sm text-gray-600">
                        {c("approvedOn", "Approved on:")}{" "}
                        <span className="font-medium">
                          {new Date(
                            account.businessApprovedAt
                          ).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>

                  {account.isBusiness && !account.businessApprovedBy && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(account._id, false)}
                        disabled={processing === account._id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {c("reject", "Reject")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproval(account._id, true)}
                        disabled={processing === account._id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {c("approve", "Approve")}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
