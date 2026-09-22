import { Product, ProductSizeVariant } from '../types';

/**
 * دالة استخراج الصورة الدقيقة الخاصة بالمقاس المحدد
 * 1. إذا كان للمقاس رابط صورة خاص به (image_url) يتم اعتماده فوراً
 * 2. إذا كان للمقاس مؤشر صورة (imageIndex) ومعرض الصور يحتويها يتم اعتماده
 * 3. إذا كان للمقاس صورة مخزنة في خريطة صور المقاسات (sizesImagesMap)
 * 4. إذا وجد تطابق بموقع المقاس ضمن قائمة الصور وكان هناك أكثر من صورة
 * 5. وإلا يتم الرجوع لصورة المنتج الأساسية
 */
export function getVariantImageUrl(
  size?: ProductSizeVariant | null,
  sizeIndex: number = 0,
  imagesList: string[] = [],
  fallbackUrl?: string,
  extraSizesMap?: Record<string, string>
): string | undefined {
  if (!size) {
    return fallbackUrl || (imagesList.length > 0 ? imagesList[0] : undefined);
  }

  // 1. رابط مباشر مسجل للمقاس
  if (size.image_url && typeof size.image_url === 'string' && size.image_url.trim().length > 10) {
    return size.image_url.trim();
  }

  // 2. من خريطة الصور الإضافية للمقاسات بواسطة المعرّف
  if (extraSizesMap && size.id && extraSizesMap[size.id]) {
    return extraSizesMap[size.id];
  }

  // 3. مؤشر صورة مسجل في المقاس (imageIndex)
  if (typeof size.imageIndex === 'number' && imagesList[size.imageIndex]) {
    return imagesList[size.imageIndex];
  }

  // 4. مطابقة برقم ترتيب المقاس إذا كان المعرض يحتوي عدة صور
  if (sizeIndex >= 0 && imagesList[sizeIndex]) {
    return imagesList[sizeIndex];
  }

  // 5. صورة المنتج الأساسية
  return fallbackUrl || (imagesList.length > 0 ? imagesList[0] : undefined);
}

/**
 * تجميع كافة الصور المتوفرة للمنتج ولمقاساته بدون تكرار
 */
export function getAllProductImages(
  product?: Product | null,
  extraSizesImages?: Record<string, string>
): string[] {
  if (!product) return [];
  const list: string[] = [];

  const add = (url?: string) => {
    if (url && typeof url === 'string' && url.trim().length > 10) {
      const clean = url.trim();
      if (!list.includes(clean)) {
        list.push(clean);
      }
    }
  };

  add(product.image_url);

  if (Array.isArray(product.images)) {
    product.images.forEach(add);
  }

  if (Array.isArray(product.sizes)) {
    product.sizes.forEach((s) => {
      add(s.image_url);
      if (extraSizesImages && extraSizesImages[s.id]) {
        add(extraSizesImages[s.id]);
      }
    });
  }

  return list;
}

/**
 * التحقق مما إذا كان المنتج متوفراً في المخزون
 * في حال نفد المنتج (الكمية 0 أو أقل أو نفدت جميع مقاساته) يعتبر غير متوفر ولا يتم عرضه
 */
export function isProductInStock(product?: Product | null): boolean {
  if (!product) return false;

  // إذا كان للمنتج خيارات/مقاسات مسجلة
  if (product.hasSizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
    // يعتبر متوفراً فقط إذا كان هناك خيار واحد على الأقل به مخزون متوفر أكبر من 0
    return product.sizes.some((s) => {
      const variantStock = typeof s.stock === 'number' ? s.stock : product.stock;
      return typeof variantStock === 'number' && variantStock > 0;
    });
  }

  // للمنتج العادي: توفر كمية المخزون أكبر من 0
  return typeof product.stock === 'number' && product.stock > 0;
}
