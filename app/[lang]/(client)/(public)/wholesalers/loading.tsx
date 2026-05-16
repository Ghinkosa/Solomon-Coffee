import { Loader2 } from "lucide-react";

const WholesalersLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-shop_light_bg to-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 h-48 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-200 lg:col-span-2" />
        </div>
        <div className="mt-12 flex items-center justify-center gap-2 text-shop_dark_green">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading wholesale page...</span>
        </div>
      </div>
    </div>
  );
};

export default WholesalersLoading;
