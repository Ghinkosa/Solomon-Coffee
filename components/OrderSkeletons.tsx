import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const OrdersPageSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-5">
        <Skeleton className="h-8 w-32 mb-2" /> {/* Title */}
        <Skeleton className="h-4 w-48" /> {/* Subtitle */}
      </div>

      {/* Orders Grid - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Card 1 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" /> {/* Order # */}
                <Skeleton className="h-3 w-24" /> {/* Date */}
              </div>
              <Skeleton className="h-6 w-20 rounded-full" /> {/* Status */}
            </div>
            
            {/* Weight and Grind Options */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" /> {/* Scale icon placeholder */}
                <Skeleton className="h-3 w-16" /> {/* Weight label */}
                <Skeleton className="h-3 w-12" /> {/* Weight value */}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" /> {/* Coffee icon placeholder */}
                <Skeleton className="h-3 w-16" /> {/* Grind label */}
                <Skeleton className="h-3 w-16" /> {/* Grind value */}
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" /> {/* Package icon placeholder */}
                <Skeleton className="h-3 w-20" /> {/* Packaging label */}
                <Skeleton className="h-3 w-12" /> {/* Packaging value */}
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" /> {/* Total label */}
              <Skeleton className="h-6 w-24" /> {/* Total amount */}
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" /> {/* Items label */}
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" /> {/* View button */}
          </CardContent>
        </Card>

        {/* Order Card 2 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            {/* Weight and Grind Options */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </CardContent>
        </Card>

        {/* Order Card 3 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            {/* Weight and Grind Options */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </CardContent>
        </Card>

        {/* Order Card 4 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </CardContent>
        </Card>

        {/* Order Card 5 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </CardContent>
        </Card>

        {/* Order Card 6 */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="w-12 h-12 rounded" />
                <Skeleton className="w-12 h-12 rounded" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded" />
          </CardContent>
        </Card>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-1">
          <Skeleton className="h-9 w-20" /> {/* Previous */}
          <Skeleton className="h-9 w-9" /> {/* Page 1 */}
          <Skeleton className="h-9 w-9" /> {/* Page 2 */}
          <Skeleton className="h-9 w-9" /> {/* Page 3 */}
          <Skeleton className="h-9 w-9" /> {/* Page 4 */}
          <Skeleton className="h-9 w-9" /> {/* Page 5 */}
          <Skeleton className="h-9 w-16" /> {/* Next */}
        </div>
      </div>
    </div>
  );
};

export const OrderDetailsSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information - Left Column (Products) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <Skeleton className="w-16 h-16 rounded-md" />
                      <div className="flex-1 min-w-0">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32 mb-2" />
                        
                        {/* Weight, Grind, Packaging Options */}
                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-3 w-14" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-10" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Summary & Address */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information Card */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};