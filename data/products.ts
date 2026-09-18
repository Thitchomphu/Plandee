import { Theme } from '@/constants/theme';

export type Product = { id: string; name: string; category: string; price: string; color: string };

// Product content is maintained in PRODUCT_DATA.md; this typed module keeps the app runtime-safe.
export const products: Product[] = [
  { id: 'venue', name: 'สถานที่จัดอีเวนต์', category: 'สถานที่', price: '฿120,000', color: '#B7A2E0' },
  { id: 'catering', name: 'บริการอาหารและเครื่องดื่ม', category: 'อาหาร', price: '฿85,000', color: '#FFB648' },
  { id: 'decoration', name: 'ตกแต่งสถานที่', category: 'ตกแต่ง', price: '฿65,000', color: '#4FC9A8' },
  { id: 'photography', name: 'ช่างภาพและวิดีโอ', category: 'ภาพและวิดีโอ', price: '฿40,000', color: Theme.colors.primary },
];
