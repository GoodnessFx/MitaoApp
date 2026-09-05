import type { Product } from "../data/products";

export type LanguageCode = "en" | "zh";

const CATEGORY_ZH: Record<string, string> = {
  Featured: "精选",
  "Home & Kitchen": "家居厨房",
  "Women's Clothing": "女装",
  "Women's Curve Clothing": "大码女装",
  "Women's Shoes": "女鞋",
  "Women's Lingerie & Loungewear": "内衣与家居服",
  "Men's Clothing": "男装",
  "Men's Shoes": "男鞋",
  "Men's Big & Tall": "大码男装",
  "Men's Underwear & Sleepwear": "男士内衣与睡衣",
  "Sports & Outdoors": "运动户外",
  "Jewelry & Accessories": "珠宝配饰",
  "Beauty & Personal Care": "美妆个护",
  "Toys & Games": "玩具文具",
  Automotive: "汽车用品",
  Electronics: "数码家电",
  "Pet Supplies": "宠物用品",
  "Baby & Maternity": "母婴用品",
};

const SUBCATEGORY_ZH: Record<string, string> = {
  Dresses: "连衣裙",
  Sneakers: "运动鞋",
  Cookware: "厨具锅具",
  Watches: "手表",
  Skincare: "护肤",
  Shirts: "衬衫",
  Sweaters: "毛衣",
  "Bar Stools": "吧台椅",
  Sundresses: "吊带裙",
  Flannel: "法兰绒衬衫",
  Running: "跑鞋",
  Stationery: "文具",
  Jewelry: "首饰",
  Bags: "包袋",
  Storage: "收纳",
};

export function getCategoryLabel(category: string, language: LanguageCode) {
  if (language === "zh") return CATEGORY_ZH[category] ?? category;
  return category;
}

export function getSubcategoryLabel(label: string, language: LanguageCode) {
  if (language === "zh") return SUBCATEGORY_ZH[label] ?? label;
  return label;
}

export function getProductTitle(product: Product, language: LanguageCode) {
  if (language === "zh" && product.titleZh) return product.titleZh;
  return product.title;
}

export function getProductDescription(product: Product, language: LanguageCode) {
  if (language === "zh" && product.descriptionZh) return product.descriptionZh;
  return product.description;
}

export function getProductBadge(product: Product, language: LanguageCode) {
  if (language === "zh" && product.badgeZh) return product.badgeZh;
  return product.badge;
}

export function getProductMerit(product: Product, language: LanguageCode) {
  if (language === "zh" && product.meritZh) return product.meritZh;
  return product.merit;
}

export function getProductSold(product: Product, language: LanguageCode) {
  if (language === "zh" && product.soldZh) return product.soldZh;
  return product.sold;
}

export function getProductShipping(product: Product, language: LanguageCode) {
  if (language === "zh" && product.shippingZh) return product.shippingZh;
  return product.shipping;
}

export function buildSearchBlob(product: Product) {
  return [
    product.title,
    product.titleZh,
    product.category,
    product.description,
    product.descriptionZh,
    product.brand,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

