import { useState } from 'react';
import { ShoppingBag, Coins, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useShopData } from '../hooks/useAdmin';
import { LoginPrompt } from '../components/LoginPrompt';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, profile } = useAuth();
  const { items, loading, purchaseItem } = useShopData();

  if (!isAuthenticated) {
    return <LoginPrompt title="Cửa hàng" message="Đăng nhập để mua sắm các vật phẩm" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const userCoins = profile?.coins || 0;

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🎁' },
    { id: 'avatar', name: 'Avatar', icon: '👤' },
    { id: 'theme', name: 'Giao diện', icon: '🎨' },
    { id: 'powerup', name: 'Power-up', icon: '⚡' },
    { id: 'voucher', name: 'Voucher', icon: '🎫' },
  ];

  const filteredItems = items.filter((item: any) => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ownedCount = items.filter((i: any) => i.owned).length;

  const handlePurchase = async (itemId: string, price: number) => {
    if (userCoins < price) {
      toast.error('Không đủ coins!');
      return;
    }
    try {
      await purchaseItem(itemId);
      toast.success('Mua thành công!');
    } catch (error) {
      toast.error('Lỗi khi mua');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-500 p-3 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cửa hàng</h1>
              <p className="text-gray-600">Sử dụng coins để mua items</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold opacity-90">Số coins</div>
                  <div className="text-3xl font-bold">{userCoins.toLocaleString()}</div>
                </div>
                <Coins className="h-10 w-10 opacity-80" />
              </div>
            </div>
            <Card className="p-5">
              <div className="text-sm text-gray-600 mb-1">Đã sở hữu</div>
              <div className="text-2xl font-bold text-gray-900">{ownedCount}/{items.length}</div>
            </Card>
            <Card className="p-5">
              <div className="text-sm text-gray-600 mb-1">Có sẵn</div>
              <div className="text-2xl font-bold text-gray-900">{items.length - ownedCount}</div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => (
              <ShopItemCard
                key={item.id}
                item={item}
                userCoins={userCoins}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có items</h3>
            <p className="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function ShopItemCard({ item, userCoins, onPurchase }: { item: any; userCoins: number; onPurchase: (id: string, price: number) => void }) {
  const canAfford = userCoins >= item.price;
  const isOwned = item.owned;

  return (
    <Card className={`overflow-hidden ${isOwned ? 'bg-green-50' : ''}`}>
      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl">🎁</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
        
        {isOwned ? (
          <div className="text-green-600 text-sm font-medium">✓ Đã sở hữu</div>
        ) : (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onPurchase(item.id, item.price)}
            disabled={!canAfford}
          >
            <Coins className="h-3 w-3 mr-1" />
            {item.price}
          </Button>
        )}
      </div>
    </Card>
  );
}