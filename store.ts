import { Product } from "./sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import _ from "lodash";

export interface PackagingOption {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  price: number;
  default: boolean;
  image?: any;
  imageUrl?: string;  // ← ADD THIS
}

export interface WeightOption {
  weight: string;
  price: number;
  isDefault: boolean;
  stock: number;
}

export interface GrindOption {
  grindType: string;
  isDefault: boolean;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPackaging?: PackagingOption;
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
}

export interface CartLineSelection {
  productId: string;
  selectedWeight?: WeightOption;
  selectedGrind?: GrindOption;
  selectedPackaging?: PackagingOption;
}

interface StoreState {
  items: CartItem[];
  addItem: (product: Product, selectedWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  addMultipleItems: (products: Array<{ product: Product; quantity: number; selectedWeight?: WeightOption; selectedGrind?: GrindOption; selectedPackaging?: PackagingOption }>) => void;
  removeItem: (productId: string, selectedWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  deleteCartProduct: (productId: string, selectedWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getTotalDiscount: () => number;
  getItemCount: (productId: string, selectedWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => number;
  getGroupedItems: () => CartItem[];
  updateCartItemPackaging: (productId: string, packaging: PackagingOption, selectedWeight?: WeightOption, selectedGrind?: GrindOption, currentPackaging?: PackagingOption) => void;
  updateCartItemWeight: (productId: string, weight: WeightOption, currentWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  updateCartItemGrind: (productId: string, grind: GrindOption, selectedWeight?: WeightOption, currentGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  favoriteProduct: Product[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
  isPlacingOrder: boolean;
  orderStep: "validating" | "creating" | "emailing" | "redirecting";
  setOrderPlacementState: (isPlacing: boolean, step?: "validating" | "creating" | "emailing" | "redirecting") => void;
  isAuthSidebarOpen: boolean;
  authMode: "signIn" | "signUp";
  openAuthSidebar: (mode?: "signIn" | "signUp") => void;
  closeAuthSidebar: () => void;
}

const getDefaultWeight = (product: Product): WeightOption | undefined => {
  return (product as any).weightOptions?.find((w: WeightOption) => w.isDefault);
};

const getDefaultGrind = (product: Product): GrindOption | undefined => {
  return (product as any).grindOptions?.find((g: GrindOption) => g.isDefault && g.available);
};

const getDefaultPackaging = (product: Product): PackagingOption | undefined => {
  return (product as any).packagingOptions?.find((p: any) => p.isDefault)?.packaging;
};

const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = getDefaultWeight(item.product);
  return defaultWeight?.price || item.product.price || 0;
};

export const matchesCartItem = (
  item: CartItem,
  productId: string,
  selectedWeight?: WeightOption,
  selectedGrind?: GrindOption,
  selectedPackaging?: PackagingOption,
): boolean => {
  if (item.product._id !== productId) return false;

  const product = item.product;
  const weightToMatch = selectedWeight ?? getDefaultWeight(product);
  const grindToMatch = selectedGrind ?? getDefaultGrind(product);
  const itemWeight = item.selectedWeight ?? getDefaultWeight(product);
  const itemGrind = item.selectedGrind ?? getDefaultGrind(product);

  const sameWeight = itemWeight?.weight === weightToMatch?.weight;
  const sameGrind = itemGrind?.grindType === grindToMatch?.grindType;
  const samePackaging = item.selectedPackaging?._id === selectedPackaging?._id;

  return sameWeight && sameGrind && samePackaging;
};

const findMatchingCartItem = (
  items: CartItem[],
  productId: string,
  selectedWeight?: WeightOption,
  selectedGrind?: GrindOption,
  selectedPackaging?: PackagingOption,
) =>
  _.find(items, (item) =>
    matchesCartItem(item, productId, selectedWeight, selectedGrind, selectedPackaging),
  );

const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      favoriteProduct: [],
      
      addItem: (product, selectedWeight, selectedGrind, selectedPackaging) =>
        set((state) => {
          const weightToUse = selectedWeight || getDefaultWeight(product);
          const grindToUse = selectedGrind || getDefaultGrind(product);
          const packagingToUse = selectedPackaging;
          
          const existingItem = _.find(state.items, (item) => {
            const sameProduct = item.product._id === product._id;
            const sameWeight = item.selectedWeight?.weight === weightToUse?.weight;
            const sameGrind = item.selectedGrind?.grindType === grindToUse?.grindType;
            const samePackaging = item.selectedPackaging?._id === packagingToUse?._id;
            return sameProduct && sameWeight && sameGrind && samePackaging;
          });
          
          if (existingItem) {
            return {
              items: _.map(state.items, (item) =>
                item.product._id === product._id &&
                item.selectedWeight?.weight === weightToUse?.weight &&
                item.selectedGrind?.grindType === grindToUse?.grindType &&
                item.selectedPackaging?._id === packagingToUse?._id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item,
              ),
            };
          } else {
            return { 
              items: [...state.items, { 
                product, 
                quantity: 1,
                selectedWeight: weightToUse,
                selectedGrind: grindToUse,
                selectedPackaging: packagingToUse
              }] 
            };
          }
        }),

      addMultipleItems: (products) =>
        set((state) => {
          let updatedItems = [...state.items];
          _.forEach(products, ({ product, quantity, selectedWeight, selectedGrind, selectedPackaging }) => {
            const weightToUse = selectedWeight || getDefaultWeight(product);
            const grindToUse = selectedGrind || getDefaultGrind(product);
            const packagingToUse = selectedPackaging;
            
            const existingItem = _.find(updatedItems, (item) => 
              item.product._id === product._id &&
              item.selectedWeight?.weight === weightToUse?.weight &&
              item.selectedGrind?.grindType === grindToUse?.grindType &&
              item.selectedPackaging?._id === packagingToUse?._id
            );

            if (existingItem) {
              updatedItems = _.map(updatedItems, (item) =>
                item.product._id === product._id &&
                item.selectedWeight?.weight === weightToUse?.weight &&
                item.selectedGrind?.grindType === grindToUse?.grindType &&
                item.selectedPackaging?._id === packagingToUse?._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              );
            } else {
              updatedItems.push({ product, quantity, selectedWeight: weightToUse, selectedGrind: grindToUse, selectedPackaging: packagingToUse });
            }
          });
          return { items: updatedItems };
        }),

      removeItem: (productId, selectedWeight, selectedGrind, selectedPackaging) =>
        set((state) => ({
          items: _.reduce(state.items, (acc: CartItem[], item) => {
            if (
              matchesCartItem(
                item,
                productId,
                selectedWeight,
                selectedGrind,
                selectedPackaging,
              )
            ) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),

      deleteCartProduct: (productId, selectedWeight, selectedGrind, selectedPackaging) =>
        set((state) => ({
          items: _.filter(
            state.items,
            (item) =>
              !matchesCartItem(
                item,
                productId,
                selectedWeight,
                selectedGrind,
                selectedPackaging,
              ),
          ),
        })),

      updateCartItemPackaging: (
        productId,
        packaging,
        selectedWeight,
        selectedGrind,
        currentPackaging,
      ) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            matchesCartItem(
              item,
              productId,
              selectedWeight,
              selectedGrind,
              currentPackaging,
            )
              ? { ...item, selectedPackaging: packaging }
              : item,
          ),
        })),

      updateCartItemWeight: (
        productId,
        weight,
        currentWeight,
        selectedGrind,
        selectedPackaging,
      ) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            matchesCartItem(
              item,
              productId,
              currentWeight,
              selectedGrind,
              selectedPackaging,
            )
              ? { ...item, selectedWeight: weight }
              : item,
          ),
        })),

      updateCartItemGrind: (
        productId,
        grind,
        selectedWeight,
        currentGrind,
        selectedPackaging,
      ) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            matchesCartItem(
              item,
              productId,
              selectedWeight,
              currentGrind,
              selectedPackaging,
            )
              ? { ...item, selectedGrind: grind }
              : item,
          ),
        })),

      resetCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return _.reduce(get().items, (total, item) => {
          const itemPrice = getItemCurrentPrice(item);
          const packagingPrice = item.selectedPackaging?.price || 0;
          return total + (itemPrice + packagingPrice) * item.quantity;
        }, 0);
      },

      getSubTotalPrice: () => {
        return _.reduce(get().items, (total, item) => {
          const currentPrice = getItemCurrentPrice(item);
          const packagingPrice = item.selectedPackaging?.price || 0;
          const totalItemPrice = currentPrice + packagingPrice;
          const discount = item.product.discount ?? 0;
          const discountAmount = (discount * totalItemPrice) / 100;
          const grossPrice = totalItemPrice + discountAmount;
          return total + grossPrice * item.quantity;
        }, 0);
      },

      getTotalDiscount: () => {
        return _.reduce(get().items, (total, item) => {
          const currentPrice = getItemCurrentPrice(item);
          const packagingPrice = item.selectedPackaging?.price || 0;
          const totalItemPrice = currentPrice + packagingPrice;
          const discount = item.product.discount ?? 0;
          const discountAmount = (discount * totalItemPrice) / 100;
          return total + discountAmount * item.quantity;
        }, 0);
      },

      getItemCount: (productId, selectedWeight, selectedGrind, selectedPackaging) => {
        const item = findMatchingCartItem(
          get().items,
          productId,
          selectedWeight,
          selectedGrind,
          selectedPackaging,
        );
        return item?.quantity ?? 0;
      },

      getGroupedItems: () => get().items,

      addToFavorite: (product: Product) => {
        return new Promise<void>((resolve) => {
          set((state: StoreState) => {
            const isFavorite = _.some(state.favoriteProduct, (item) => item._id === product._id);
            return {
              favoriteProduct: isFavorite
                ? _.filter(state.favoriteProduct, (item) => item._id !== product._id)
                : [...state.favoriteProduct, { ...product }],
            };
          });
          resolve();
        });
      },

      removeFromFavorite: (productId: string) => {
        set((state: StoreState) => ({
          favoriteProduct: _.filter(state.favoriteProduct, (item) => item?._id !== productId),
        }));
      },

      resetFavorite: () => set({ favoriteProduct: [] }),

      isPlacingOrder: false,
      orderStep: "validating" as const,
      setOrderPlacementState: (isPlacing, step = "validating") => set({ isPlacingOrder: isPlacing, orderStep: step }),

      isAuthSidebarOpen: false,
      authMode: "signIn",
      openAuthSidebar: (mode = "signIn") => set({ isAuthSidebarOpen: true, authMode: mode }),
      closeAuthSidebar: () => set({ isAuthSidebarOpen: false }),
    }),
    { 
      name: "cart-store",
      partialize: (state) => ({
        items: state.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedPackaging: item.selectedPackaging,
          selectedWeight: item.selectedWeight,
          selectedGrind: item.selectedGrind,
        })),
        favoriteProduct: state.favoriteProduct,
      }),
    },
  ),
);

export default useCartStore;