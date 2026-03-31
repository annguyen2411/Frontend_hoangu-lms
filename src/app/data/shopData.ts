export type ShopItemType = 'avatar' | 'powerup' | 'theme' | 'badge_frame';
export type ShopItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  rarity: ShopItemRarity;
  price: number;
  icon: string;
  preview?: string;
  owned: boolean;
  effect?: string;
  duration?: number; // in days for powerups
}

export const shopItems: ShopItem[] = [
  // Power-ups
  {
    id: 'streak_freeze',
    name: 'Streak Freeze',
    description: 'Bảo vệ chuỗi streak của bạn trong 1 ngày nghỉ',
    type: 'powerup',
    rarity: 'rare',
    price: 200,
    icon: '❄️',
    owned: true,
    effect: 'Giữ streak khi nghỉ 1 ngày',
    duration: 1
  },
  {
    id: 'double_xp',
    name: 'Double XP',
    description: 'Nhận gấp đôi XP trong 24 giờ',
    type: 'powerup',
    rarity: 'epic',
    price: 500,
    icon: '⚡',
    owned: false,
    effect: 'Gấp đôi XP nhận được',
    duration: 1
  },
  {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    description: 'Nhận thêm 50% xu trong 3 ngày',
    type: 'powerup',
    rarity: 'rare',
    price: 350,
    icon: '🍀',
    owned: false,
    effect: '+50% xu kiếm được',
    duration: 3
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    description: 'Làm mới tất cả nhiệm vụ hàng ngày ngay lập tức',
    type: 'powerup',
    rarity: 'legendary',
    price: 1000,
    icon: '⏰',
    owned: false,
    effect: 'Reset nhiệm vụ ngay',
    duration: 0
  },
  {
    id: 'streak_shield_3',
    name: 'Streak Shield (3 ngày)',
    description: 'Bảo vệ streak trong 3 ngày liên tiếp',
    type: 'powerup',
    rarity: 'epic',
    price: 450,
    icon: '🛡️',
    owned: false,
    effect: 'Giữ streak 3 ngày',
    duration: 3
  },

  // Avatars
  {
    id: 'avatar_panda',
    name: 'Gấu Trúc',
    description: 'Avatar gấu trúc dễ thương phong cách Trung Hoa',
    type: 'avatar',
    rarity: 'common',
    price: 300,
    icon: '🐼',
    preview: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop',
    owned: false
  },
  {
    id: 'avatar_dragon',
    name: 'Rồng Vàng',
    description: 'Avatar rồng vàng uy quyền',
    type: 'avatar',
    rarity: 'epic',
    price: 800,
    icon: '🐉',
    preview: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=200&h=200&fit=crop',
    owned: false
  },
  {
    id: 'avatar_phoenix',
    name: 'Phượng Hoàng',
    description: 'Avatar phượng hoàng huyền thoại',
    type: 'avatar',
    rarity: 'legendary',
    price: 1500,
    icon: '🔥',
    preview: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=200&h=200&fit=crop',
    owned: false
  },
  {
    id: 'avatar_lion',
    name: 'Sư Tử Đá',
    description: 'Avatar sư tử canh giữ may mắn',
    type: 'avatar',
    rarity: 'rare',
    price: 600,
    icon: '🦁',
    preview: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=200&h=200&fit=crop',
    owned: false
  },

  // Badge Frames
  {
    id: 'frame_gold',
    name: 'Khung Vàng',
    description: 'Khung huy hiệu màu vàng sang trọng',
    type: 'badge_frame',
    rarity: 'rare',
    price: 400,
    icon: '🏆',
    owned: false
  },
  {
    id: 'frame_diamond',
    name: 'Khung Kim Cương',
    description: 'Khung huy hiệu kim cương lấp lánh',
    type: 'badge_frame',
    rarity: 'legendary',
    price: 1200,
    icon: '💎',
    owned: false
  },
  {
    id: 'frame_cherry',
    name: 'Khung Hoa Anh Đào',
    description: 'Khung trang trí hoa anh đào',
    type: 'badge_frame',
    rarity: 'epic',
    price: 700,
    icon: '🌸',
    owned: false
  },

  // Themes
  {
    id: 'theme_lantern',
    name: 'Giao diện Đèn Lồng',
    description: 'Giao diện lễ hội đèn lồng Trung Quốc',
    type: 'theme',
    rarity: 'epic',
    price: 900,
    icon: '🏮',
    owned: false
  },
  {
    id: 'theme_bamboo',
    name: 'Giao diện Tre',
    description: 'Giao diện xanh mát với tre trúc',
    type: 'theme',
    rarity: 'rare',
    price: 500,
    icon: '🎋',
    owned: false
  }
];

export const shopCategories = [
  { id: 'all', label: 'Tất cả', icon: '🛍️' },
  { id: 'powerup', label: 'Power-ups', icon: '⚡' },
  { id: 'avatar', label: 'Avatar', icon: '👤' },
  { id: 'badge_frame', label: 'Khung huy hiệu', icon: '🖼️' },
  { id: 'theme', label: 'Giao diện', icon: '🎨' }
];
