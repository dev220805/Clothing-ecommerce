import clsx from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export function formatPrice(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0);
}
