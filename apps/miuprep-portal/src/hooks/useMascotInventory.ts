// Mascot inventory (unlock + equip decoration items) extracted from App.tsx
// (roadmap 2.2.3 GĐ2b — slim App.tsx). Owns its own persisted state; coins,
// auth, notifications and logging are injected so the hook stays decoupled.
import { useState } from 'react';
import { persistCoinBalance, purchaseMascotItem, toggleMascotItem } from '../lib/studentProgress';
import type { LocalUser } from '@miuprep/db';

interface UseMascotInventoryDeps {
  currentUser: LocalUser | null;
  fishCoins: number;
  setFishCoins: (coins: number) => void;
  showNotif: (text: string, type?: 'success' | 'error' | 'info') => void;
  logSystemEvent: (level: 'INFO' | 'WARN' | 'ERROR', message: string, payload?: unknown) => void | Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function useMascotInventory({
  currentUser,
  fishCoins,
  setFishCoins,
  showNotif,
  logSystemEvent,
  t,
}: UseMascotInventoryDeps) {
  const [unlockedMascotItems, setUnlockedMascotItems] = useState<string[]>(() => {
    const saved = localStorage.getItem('miuprep_unlocked_items');
    return saved ? JSON.parse(saved) : [];
  });
  const [equippedMascotItem, setEquippedMascotItem] = useState<string>(() => {
    return localStorage.getItem('miuprep_equipped_item') || '';
  });

  const handleBuyMascotItem = (item: string, price: number) => {
    const purchase = purchaseMascotItem(unlockedMascotItems, fishCoins, item, price);

    if (purchase.status === 'already_unlocked') {
      showNotif(t('notif_item_already_unlocked'), 'info');
      return;
    }

    if (purchase.status === 'insufficient_coins') {
      showNotif(t('notif_not_enough_coins'), 'error');
      return;
    }

    setFishCoins(purchase.nextCoins);
    if (currentUser?.username) {
      persistCoinBalance(localStorage, currentUser.username, purchase.nextCoins);
    }
    setUnlockedMascotItems(purchase.nextUnlockedItems);
    localStorage.setItem('miuprep_unlocked_items', JSON.stringify(purchase.nextUnlockedItems));
    logSystemEvent('INFO', `Học sinh @${currentUser?.username} đã mua vật phẩm "${item}" với giá ${price} Xu`);
    showNotif(t('notif_item_unlocked', { item }), 'success');
  };

  const handleEquipMascotItem = (item: string) => {
    const nextItem = toggleMascotItem(equippedMascotItem, item);
    setEquippedMascotItem(nextItem);
    localStorage.setItem('miuprep_equipped_item', nextItem);
    logSystemEvent(
      'INFO',
      `Học sinh @${currentUser?.username} đã thay đổi phụ kiện trang trí: [${nextItem || 'Trống'}]`,
    );
    showNotif(
      nextItem ? `Đã diện phụ kiện ${nextItem} cho Mascot Miu! 😻` : `Đã cởi bỏ phụ kiện của Mascot Miu meow!`,
      'success',
    );
  };

  return { unlockedMascotItems, equippedMascotItem, handleBuyMascotItem, handleEquipMascotItem };
}
