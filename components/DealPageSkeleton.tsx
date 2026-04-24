import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DealPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-shop_light_bg via-white to-[#09332c]/[0.08]">
      {/* Breadcrumb Skeleton */}
      <Container className="pt-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-20" />
        </div>
      </Container>

      {/* Hero Section Skeleton */}
      <Container className="py-8 sm:py-12">
        <div
          className="overflow-hidden rounded-xl border border-[#a3802e]/40 p-6 shadow-xl sm:p-8 lg:p-12"
          style={{
            background:
              "linear-gradient(145deg, #09332c 0%, #3a2417 48%, #1c2329 100%)",
          }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="flex-1 space-y-4 sm:space-y-6">
                {/* Badges */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-8 w-24 rounded-full bg-[#e4c290]/25" />
                  <Skeleton className="h-6 w-20 rounded-md bg-[#e4c290]/25" />
                </div>

                {/* Title and Description */}
                <div>
                  <Skeleton className="mb-2 h-8 w-full max-w-md bg-[#fdf6e8]/25 sm:mb-4 sm:h-10 md:h-12 lg:h-14" />
                  <Skeleton className="mb-2 h-4 w-full max-w-2xl bg-[#e4c290]/20" />
                  <Skeleton className="h-4 w-3/4 max-w-xl bg-[#e4c290]/20" />
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {[1, 2, 3].map((item, index) => (
                    <div
                      key={item}
                      className={`rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:p-4 ${
                        index === 2 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Skeleton className="h-4 w-4 bg-[#e4c290]/25" />
                        <Skeleton className="h-3 w-16 bg-[#e4c290]/25" />
                      </div>
                      <Skeleton className="h-6 w-12 bg-[#fdf6e8]/30 sm:h-8" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown Timer Skeleton */}
              <div className="lg:flex-shrink-0">
                <div className="rounded-xl border border-[#a3802e]/35 bg-black/20 p-4 backdrop-blur-sm sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Skeleton className="h-4 w-4 bg-[#e4c290]/25 sm:h-5 sm:w-5" />
                      <Skeleton className="h-4 w-20 bg-[#e4c290]/25" />
                    </div>
                    <div className="grid grid-cols-4 gap-1 sm:gap-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="flex flex-col items-center rounded-lg border border-[#a3802e]/35 bg-[#1c2329]/70 p-2 sm:p-3"
                        >
                          <Skeleton className="mb-1 h-6 w-8 bg-[#e4c290]/30 sm:h-8" />
                          <Skeleton className="h-3 w-6 bg-[#e4c290]/25" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </Container>

      {/* Deal Features Skeleton */}
      <Container className="py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((item) => (
            <Card key={item} className="p-4 sm:p-6">
              <CardContent className="p-0 text-center space-y-3">
                <Skeleton className="w-12 h-12 mx-auto rounded-full" />
                <Skeleton className="h-5 w-32 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>

      {/* Products Section Header Skeleton */}
      <Container className="py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <Skeleton className="h-8 sm:h-10 w-48" />
            <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <Skeleton className="h-4 w-full max-w-2xl mx-auto mb-2" />
          <Skeleton className="h-4 w-3/4 max-w-xl mx-auto" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
            <Card key={item} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Product Image */}
                <Skeleton className="w-full h-48 sm:h-52" />

                {/* Product Info */}
                <div className="p-4 space-y-3">
                  {/* Brand */}
                  <Skeleton className="h-3 w-16" />

                  {/* Title */}
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} className="w-4 h-4" />
                    ))}
                    <Skeleton className="h-3 w-8 ml-1" />
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>

      {/* Call to Action Skeleton */}
      <Container className="py-8 sm:py-12">
        <div
          className="rounded-xl p-6 text-center shadow-xl sm:p-8 lg:p-12"
          style={{
            background:
              "linear-gradient(90deg, #09332c 0%, #3a2417 50%, #1c2329 100%)",
          }}
        >
            <Skeleton className="mx-auto mb-4 h-8 w-80 bg-[#fdf6e8]/25 sm:h-10" />
            <Skeleton className="mx-auto mb-2 h-4 w-full max-w-2xl bg-[#e4c290]/20" />
            <Skeleton className="mx-auto mb-6 h-4 w-3/4 max-w-xl bg-[#e4c290]/20" />
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Skeleton className="h-11 w-full bg-[#e4c290]/35 sm:w-40" />
              <Skeleton className="h-11 w-full bg-[#e4c290]/20 sm:w-36" />
            </div>
        </div>
      </Container>
    </div>
  );
};

export default DealPageSkeleton;
