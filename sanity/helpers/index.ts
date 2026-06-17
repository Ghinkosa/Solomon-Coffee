import { defineQuery } from "next-sanity";
import { sanityFetch } from "../lib/live";
import { writeClient } from "../lib/client";

export const getProductsByCategory = async (categorySlug: string) => {
  const PRODUCT_BY_CATEGORY_QUERY = defineQuery(
    `*[_type == 'product' && references(*[_type == "category" && slug.current == $categorySlug]._id)] {
      ...,
      weightOptions[],
      grindOptions[],
      packagingOptions[] {
        ...,
        packaging->
      }
    } | order(name asc)`,
  );
  try {
    const products = await sanityFetch({
      query: PRODUCT_BY_CATEGORY_QUERY,
      params: {
        categorySlug,
      },
    });
    return products?.data || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

// Get all products
export const getAllProducts = async () => {
  const ALL_PRODUCTS_QUERY = defineQuery(
    `*[_type == 'product'] {
      ...,
      weightOptions[],
      grindOptions[],
      packagingOptions[] {
        ...,
        packaging->
      }
    } | order(name asc)`,
  );
  try {
    const products = await sanityFetch({
      query: ALL_PRODUCTS_QUERY,
    });
    return products?.data || [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return [];
  }
};

// Get a single product by slug
export const getProductBySlug = async (slug: string) => {
  const PRODUCT_BY_SLUG_QUERY = defineQuery(
    `*[_type == 'product' && slug.current == $slug][0] {
      ...,
      weightOptions[],
      grindOptions[],
      packagingOptions[] {
        ...,
        packaging->
      }
    }`,
  );
  try {
    const product = await sanityFetch({
      query: PRODUCT_BY_SLUG_QUERY,
      params: { slug },
    });
    return product?.data || null;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

export const getBanners = async () => {
  const BANNER_QUERY = defineQuery(
    `*[_type == 'banner'] | order(weight asc, title asc){
      ...,
      backgroundVideo{
        asset->{
          url
        }
      },
      "backgroundVideoUrl": backgroundVideo.asset->url
    }`,
  );
  try {
    const banners = await sanityFetch({
      query: BANNER_QUERY,
    });
    return banners?.data || [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
};

export const getSale = async () => {
  const SALE_QUERY = defineQuery(`*[_type == 'sale'] | order(name asc)`);
  try {
    const products = await sanityFetch({
      query: SALE_QUERY,
    });
    return products?.data || [];
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
};

// Contact message functions
export const saveContactMessage = async (contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    const doc = {
      _type: "contact",
      name: contactData.name,
      email: contactData.email,
      subject: contactData.subject,
      message: contactData.message,
      status: "new",
      priority: "medium",
      submittedAt: new Date().toISOString(),
      ipAddress: contactData.ipAddress || "",
      userAgent: contactData.userAgent || "",
    };

    const result = await writeClient.create(doc);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving contact message:", error);
    return { success: false, error: "Failed to save contact message" };
  }
};

export const saveWholesaleInquiry = async (inquiryData: {
  name: string;
  email: string;
  businessName?: string;
  phone?: string;
  businessType?: string;
  estimatedOrderQuantity?: string;
  message?: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  try {
    const doc = {
      _type: "wholesaleInquiry",
      name: inquiryData.name,
      email: inquiryData.email,
      businessName: inquiryData.businessName || "",
      phone: inquiryData.phone || "",
      businessType: inquiryData.businessType || "",
      estimatedOrderQuantity: inquiryData.estimatedOrderQuantity || "",
      message: inquiryData.message || "",
      status: "new",
      submittedAt: new Date().toISOString(),
      ipAddress: inquiryData.ipAddress || "",
      userAgent: inquiryData.userAgent || "",
    };

    const result = await writeClient.create(doc);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving wholesale inquiry:", error);
    return { success: false, error: "Failed to save wholesale inquiry" };
  }
};

// ✅ UPDATED: getMyOrders with weight, grind, packaging
export const getMyOrders = async (
  userId: string,
  page: number = 1,
  limit: number = 5,
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const offset = (page - 1) * limit;

  const MY_ORDERS_QUERY = defineQuery(`
    *[_type == 'order' && clerkUserId == $userId] | order(orderDate desc)[$start...$end]{
      ...,
      paymentStatus,
      paymentMethod,
      products[]{
        ...,
        product->{
          _id,
          name,
          slug,
          image,
          images,
          price,
          currency,
          weightOptions[],
          grindOptions[],
          packagingOptions[] {
            ...,
            packaging->
          }
        },
        weight,
        grind,
        packaging
      }
    }
  `);

  const COUNT_QUERY = defineQuery(
    `count(*[_type == 'order' && clerkUserId == $userId])`,
  );

  try {
    const [orders, totalCount] = await Promise.all([
      sanityFetch({
        query: MY_ORDERS_QUERY,
        params: {
          userId,
          start: offset,
          end: offset + limit - 1,
        },
      }),
      sanityFetch({
        query: COUNT_QUERY,
        params: { userId },
      }),
    ]);

    return {
      orders: orders?.data || [],
      totalCount: totalCount?.data || 0,
      totalPages: Math.ceil((totalCount?.data || 0) / limit),
      currentPage: page,
      hasNextPage: page < Math.ceil((totalCount?.data || 0) / limit),
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
};