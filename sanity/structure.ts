import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Sheba Cup Coffee")
    .items([
      S.documentTypeListItem("category").title("Categories"),
      S.divider(),
      S.listItem()
        .title("Checkout Settings")
        .id("checkoutSettings")
        .child(
          S.document()
            .schemaType("checkoutSettings")
            .documentId("checkoutSettings")
            .title("Checkout Settings"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() &&
          !["category", "checkoutSettings"].includes(item.getId()!),
      ),
    ]);
