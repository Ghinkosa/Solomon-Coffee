import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SingleBlogSkeleton = () => {
  return (
    <div className="min-h-screen bg-linear-to-b from-shop_light_bg to-white">
      {/* Breadcrumb Skeleton */}
      <Container className="pt-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <span className="text-gray-400">/</span>
          <Skeleton className="h-4 w-32" />
        </div>
      </Container>

      <Container className="py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Skeleton (col-span-3) */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {/* Article Header Skeleton */}
              <div className="space-y-6">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-6 w-20 rounded-full" />
                  ))}
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <Skeleton className="h-8 sm:h-10 md:h-12 w-full max-w-3xl" />
                  <Skeleton className="h-8 sm:h-10 md:h-12 w-2/3" />
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  {/* Reading Time */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  {/* Views */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                {/* Social Actions Buttons */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <Skeleton className="h-9 w-20 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-md" />
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </div>

              {/* Featured Image Skeleton */}
              <Skeleton className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-xl" />

              {/* Article Content Skeleton */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-8 sm:p-12 space-y-6">
                  {/* Text Blocks */}
                  {[1, 2, 3].map((block) => (
                    <div key={block} className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ))}

                  {/* Subheading */}
                  <Skeleton className="h-8 w-1/2 mt-8 mb-4" />

                  {/* More Text */}
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-11/12" />
                  </div>

                  {/* Quote Block */}
                  <Skeleton className="h-24 w-full rounded-lg bg-gray-100 my-8" />
                </CardContent>
              </Card>

              {/* Navigation Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-200">
                <Skeleton className="h-10 w-32 rounded-md" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton (col-span-1) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories Card */}
            <Card className="shadow-lg border-0">
              <div className="p-6 pb-2">
                <Skeleton className="h-6 w-40" />
              </div>
              <CardContent className="space-y-3 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-6 rounded-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Latest Posts Card */}
            <Card className="shadow-lg border-0">
              <div className="p-6 pb-2">
                <Skeleton className="h-6 w-32" />
              </div>
              <CardContent className="space-y-4 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Newsletter Card */}
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SingleBlogSkeleton;
