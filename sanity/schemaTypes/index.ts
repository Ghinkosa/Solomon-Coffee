import { type SchemaTypeDefinition } from "sanity";

import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { productType } from "./productType";
import { orderType } from "./orderType";
import { bannerType } from "./bannerType";
import { blogType } from "./blogType";
import { blogCategoryType } from "./blogCategoryType";
import { addressType } from "./addressType";
import { contactType } from "./contactType";
import { wholesaleInquiryType } from "./wholesaleInquiryType";
import { sentNotificationType } from "./sentNotificationType";
import { userType } from "./userType";
import { userAccessRequestType } from "./userAccessRequestType";
import { reviewType } from "./reviewType";
import { subscriptionType } from "./subscriptionType";
import { packagingType } from "./packaging";
import { checkoutSettingsType } from "./checkoutSettingsType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    productType,
    orderType,
    bannerType,
    blogType,
    blogCategoryType,
    addressType,
    contactType,
    wholesaleInquiryType,
    sentNotificationType,
    userType,
    userAccessRequestType,
    reviewType,
    subscriptionType,
    packagingType,
    checkoutSettingsType,
  ],
};
