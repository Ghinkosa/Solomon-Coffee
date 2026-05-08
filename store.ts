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

interface StoreState {
  items: CartItem[];
  addItem: (product: Product, selectedWeight?: WeightOption, selectedGrind?: GrindOption, selectedPackaging?: PackagingOption) => void;
  addMultipleItems: (products: Array<{ product: Product; quantity: number; selectedWeight?: WeightOption; selectedGrind?: GrindOption; selectedPackaging?: PackagingOption }>) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getTotalDiscount: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  updateCartItemPackaging: (productId: string, packaging: PackagingOption) => void;
  updateCartItemWeight: (productId: string, weight: WeightOption) => void;
  updateCartItemGrind: (productId: string, grind: GrindOption) => void;
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

const getItemCurrentPrice = (item: CartItem): number => {
  if (item.selectedWeight && item.selectedWeight.price) {
    return item.selectedWeight.price;
  }
  const defaultWeight = getDefaultWeight(item.product);
  return defaultWeight?.price || item.product.price || 0;
};

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

      removeItem: (productId) =>
        set((state) => ({
          items: _.reduce(state.items, (acc: CartItem[], item) => {
            if (item.product._id === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),

      deleteCartProduct: (productId) =>
        set((state) => ({
          items: _.filter(state.items, ({ product }) => product?._id !== productId),
        })),

      updateCartItemPackaging: (productId, packaging) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            item.product._id === productId ? { ...item, selectedPackaging: packaging } : item
          ),
        })),

      updateCartItemWeight: (productId, weight) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            item.product._id === productId ? { ...item, selectedWeight: weight } : item
          ),
        })),

      updateCartItemGrind: (productId, grind) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            item.product._id === productId ? { ...item, selectedGrind: grind } : item
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

      getItemCount: (productId) => {
        const items = _.filter(get().items, (item) => item.product._id === productId);
        return _.sumBy(items, 'quantity');
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