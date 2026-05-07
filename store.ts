import { Product } from "./sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import _ from "lodash";

// Interface for Weight Option (matches Sanity schema)
export interface WeightOption {
  weight: string; // "125G", "250G", "500G", "1KG"
  price: number;
  isDefault: boolean;
  stock: number;
}

// Interface for Grind Option (matches Sanity schema)
export interface GrindOption {
  grindType: string; // "whole-bean", "cafetiere", "filter", "espresso"
  isDefault: boolean;
  available: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: WeightOption; // Selected weight for this product
  selectedGrind?: GrindOption; // Selected grind for this product
}

interface StoreState {
  items: CartItem[];
  addItem: (product: Product, selectedWeight?: WeightOption, selectedGrind?: GrindOption) => void;
  addMultipleItems: (
    products: Array<{ product: Product; quantity: number; selectedWeight?: WeightOption; selectedGrind?: GrindOption }>,
  ) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getTotalDiscount: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  
  // Weight and Grind Selection
  updateCartItemWeight: (productId: string, weight: WeightOption) => void;
  updateCartItemGrind: (productId: string, grind: GrindOption) => void;

  // favorite
  favoriteProduct: Product[];
  addToFavorite: (product: Product) => Promise<void>;
  removeFromFavorite: (productId: string) => void;
  resetFavorite: () => void;
  
  // order placement state
  isPlacingOrder: boolean;
  orderStep: "validating" | "creating" | "emailing" | "redirecting";
  setOrderPlacementState: (
    isPlacing: boolean,
    step?: "validating" | "creating" | "emailing" | "redirecting",
  ) => void;
  
  // auth sidebar state
  isAuthSidebarOpen: boolean;
  authMode: "signIn" | "signUp";
  openAuthSidebar: (mode?: "signIn" | "signUp") => void;
  closeAuthSidebar: () => void;
}

// Helper to get default weight option
const getDefaultWeight = (product: Product): WeightOption | undefined => {
  return product.weightOptions?.find((w: WeightOption) => w.isDefault);
};

// Helper to get default grind option
const getDefaultGrind = (product: Product): GrindOption | undefined => {
  return product.grindOptions?.find((g: GrindOption) => g.isDefault && g.available);
};

// Helper to get current price based on selected weight
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
      
      addItem: (product, selectedWeight, selectedGrind) =>
        set((state) => {
          // Use provided selections or fallback to defaults
          const weightToUse = selectedWeight || getDefaultWeight(product);
          const grindToUse = selectedGrind || getDefaultGrind(product);
          
          const existingItem = _.find(
            state.items,
            (item) => {
              // Check if same product with same weight and grind
              const sameProduct = item.product._id === product._id;
              const sameWeight = item.selectedWeight?.weight === weightToUse?.weight;
              const sameGrind = item.selectedGrind?.grindType === grindToUse?.grindType;
              return sameProduct && sameWeight && sameGrind;
            }
          );
          
          if (existingItem) {
            return {
              items: _.map(state.items, (item) =>
                item.product._id === product._id &&
                item.selectedWeight?.weight === weightToUse?.weight &&
                item.selectedGrind?.grindType === grindToUse?.grindType
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
                selectedGrind: grindToUse
              }] 
            };
          }
        }),

      addMultipleItems: (products) =>
        set((state) => {
          let updatedItems = [...state.items];

          _.forEach(products, ({ product, quantity, selectedWeight, selectedGrind }) => {
            const weightToUse = selectedWeight || getDefaultWeight(product);
            const grindToUse = selectedGrind || getDefaultGrind(product);
            
            const existingItem = _.find(
              updatedItems,
              (item) => 
                item.product._id === product._id &&
                item.selectedWeight?.weight === weightToUse?.weight &&
                item.selectedGrind?.grindType === grindToUse?.grindType
            );

            if (existingItem) {
              updatedItems = _.map(updatedItems, (item) =>
                item.product._id === product._id &&
                item.selectedWeight?.weight === weightToUse?.weight &&
                item.selectedGrind?.grindType === grindToUse?.grindType
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              );
            } else {
              updatedItems.push({ 
                product, 
                quantity,
                selectedWeight: weightToUse,
                selectedGrind: grindToUse
              });
            }
          });

          return { items: updatedItems };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: _.reduce(
            state.items,
            (acc: CartItem[], item) => {
              if (item.product._id === productId) {
                if (item.quantity > 1) {
                  acc.push({ ...item, quantity: item.quantity - 1 });
                }
              } else {
                acc.push(item);
              }
              return acc;
            },
            [] as CartItem[],
          ),
        })),

      deleteCartProduct: (productId) =>
        set((state) => ({
          items: _.filter(
            state.items,
            ({ product }) => product?._id !== productId,
          ),
        })),

      updateCartItemWeight: (productId, weight) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            item.product._id === productId
              ? { ...item, selectedWeight: weight }
              : item
          ),
        })),

      updateCartItemGrind: (productId, grind) =>
        set((state) => ({
          items: _.map(state.items, (item) =>
            item.product._id === productId
              ? { ...item, selectedGrind: grind }
              : item
          ),
        })),

      resetCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return _.reduce(
          get().items,
          (total, item) => total + getItemCurrentPrice(item) * item.quantity,
          0,
        );
      },

      getSubTotalPrice: () => {
        return _.reduce(
          get().items,
          (total, item) => {
            const currentPrice = getItemCurrentPrice(item);
            const discount = item.product.discount ?? 0;
            const discountAmount = (discount * currentPrice) / 100;
            const grossPrice = currentPrice + discountAmount;
            return total + grossPrice * item.quantity;
          },
          0,
        );
      },

      getTotalDiscount: () => {
        return _.reduce(
          get().items,
          (total, item) => {
            const currentPrice = getItemCurrentPrice(item);
            const discount = item.product.discount ?? 0;
            const discountAmount = (discount * currentPrice) / 100;
            return total + discountAmount * item.quantity;
          },
          0,
        );
      },

      getItemCount: (productId) => {
        const items = _.filter(
          get().items,
          (item) => item.product._id === productId,
        );
        return _.sumBy(items, 'quantity');
      },

      getGroupedItems: () => get().items,

      addToFavorite: (product: Product) => {
        return new Promise<void>((resolve) => {
          set((state: StoreState) => {
            const isFavorite = _.some(
              state.favoriteProduct,
              (item) => item._id === product._id,
            );
            return {
              favoriteProduct: isFavorite
                ? _.filter(
                    state.favoriteProduct,
                    (item) => item._id !== product._id,
                  )
                : [...state.favoriteProduct, { ...product }],
            };
          });
          resolve();
        });
      },

      removeFromFavorite: (productId: string) => {
        set((state: StoreState) => ({
          favoriteProduct: _.filter(
            state.favoriteProduct,
            (item) => item?._id !== productId,
          ),
        }));
      },

      resetFavorite: () => {
        set({ favoriteProduct: [] });
      },

      // order placement state
      isPlacingOrder: false,
      orderStep: "validating" as const,
      setOrderPlacementState: (isPlacing, step = "validating") => {
        set({
          isPlacingOrder: isPlacing,
          orderStep: step,
        });
      },

      // auth sidebar state
      isAuthSidebarOpen: false,
      authMode: "signIn",
      openAuthSidebar: (mode = "signIn") =>
        set({ isAuthSidebarOpen: true, authMode: mode }),
      closeAuthSidebar: () => set({ isAuthSidebarOpen: false }),
    }),
    { 
      name: "cart-store",
      partialize: (state) => ({
        items: state.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight,
          selectedGrind: item.selectedGrind,
        })),
        favoriteProduct: state.favoriteProduct,
      }),
    },
  ),
);

export default useCartStore;