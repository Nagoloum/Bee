'use client';

import { useEffect } from 'react';
import { useTheme } from '@/stores/theme.store';

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

export function useBatteryEcoMode() {
  const setTheme = useTheme((s) => s.setTheme);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (typeof nav.getBattery !== 'function') return;

    let battery: BatteryManager | undefined;
    const handleChange = () => {
      if (!battery) return;
      if (battery.level < 0.2 && !battery.charging) {
        setTheme('dark');
      }
    };

    nav.getBattery().then((b) => {
      battery = b;
      handleChange();
      battery.addEventListener('levelchange', handleChange);
      battery.addEventListener('chargingchange', handleChange);
    });

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', handleChange);
        battery.removeEventListener('chargingchange', handleChange);
      }
    };
  }, [setTheme]);
}
