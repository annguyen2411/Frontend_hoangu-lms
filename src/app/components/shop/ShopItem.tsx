import { ShoppingCart, Check, Lock, Sparkles } from 'lucide-react';
import type { ShopItem as ShopItemType } from '../../data/shopData';

interface ShopItemProps {
  item: ShopItemType;
  userCoins: number;
  onPurchase: (item: ShopItemType) => void;
}

export function ShopItem({ item, userCoins, onPurchase }: ShopItemProps) {
  const canAfford = userCoins >= item.price;
  const isOwned = item.owned;

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-500 to-pink-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const rarityLabels = {
    common: 'Phổ thông',
    rare: 'Hiếm',
    epic: 'Sử thi',
    legendary: 'Huyền thoại'
  };

  const rarityBorderColors = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300'
  };

  const typeLabels = {
    avatar: 'Avatar',
    powerup: 'Power-up',
    theme: 'Giao diện',
    badge_frame: 'Khung huy hiệu'
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
        isOwned ? 'border-2 border-green-500' : `border-2 ${rarityBorderColors[item.rarity]}`
      } ${!canAfford && !isOwned ? 'opacity-60' : ''}`}
    >
      {/* Header with Rarity */}
      <div className={`bg-gradient-to-r ${rarityColors[item.rarity]} p-3 relative`}>
        <div className="flex items-center justify-between text-white text-xs font-semibold">
          <span>{typeLabels[item.type]}</span>
          <span>{rarityLabels[item.rarity]}</span>
        </div>
        {isOwned && (
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Item Icon/Preview */}
      <div className="p-6 text-center">
        {item.preview ? (
          <div className="relative">
            <img
              src={item.preview}
              alt={item.name}
              className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-gray-100"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl">{item.icon}</div>
            </div>
          </div>
        ) : (
          <div
            className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${rarityColors[item.rarity]} flex items-center justify-center text-5xl shadow-lg`}
          >
            {item.icon}
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="px-4 pb-4">
        <h3 className="font-bold text-gray-900 text-center mb-2 truncate">
          {item.name}
        </h3>
        <p className="text-sm text-gray-600 text-center mb-3 line-clamp-2 h-10">
          {item.description}
        </p>

        {/* Effect Badge */}
        {item.effect && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-2 text-xs text-purple-700">
              <Sparkles className="h-3 w-3" />
              <span className="font-semibold">{item.effect}</span>
            </div>
            {item.duration && item.duration > 0 && (
              <div className="text-xs text-purple-600 mt-1">
                Thời hạn: {item.duration} ngày
              </div>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg flex-1">
            <span className="text-xl">💰</span>
            <span className="font-bold text-yellow-700">{item.price}</span>
          </div>

          <button
            onClick={() => !isOwned && canAfford && onPurchase(item)}
            disabled={isOwned || !canAfford}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              isOwned
                ? 'bg-green-500 text-white cursor-default'
                : canAfford
                ? 'bg-gradient-to-r from-red-600 to-yellow-500 text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isOwned ? (
              <Check className="h-5 w-5" />
            ) : canAfford ? (
              <ShoppingCart className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </button>
        </div>

        {!canAfford && !isOwned && (
          <p className="text-xs text-red-600 text-center mt-2">
            Cần thêm {item.price - userCoins} xu
          </p>
        )}
      </div>
    </div>
  );
}
