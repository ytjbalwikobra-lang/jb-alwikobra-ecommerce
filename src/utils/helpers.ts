export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format a plain number with Indonesian thousand separators (no currency symbol)
export const formatNumberID = (value: number | null | undefined): string => {
  const n = Number(value || 0);
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(n);
};

// Parse an Indonesian-formatted number string back to number (keeps digits only)
export const parseNumberID = (value: string): number => {
  if (!value) return 0;
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
};

export const calculateTimeRemaining = (endTime: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
} => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
};

export const generateWhatsAppUrl = (
  phone: string,
  message: string
): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const generateSellAccountMessage = (productName: string): string => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com';
  
  return `Halo Admin JB Alwikobra! 👋

Saya ingin menjual akun game:
📱 Game: ${productName}
💰 Harga: [Isi harga yang diinginkan]
📝 Detail Akun: [Isi detail akun seperti level, item, dll]

Mohon info lebih lanjut untuk proses jual akun.

Terima kasih! 🙏

---
Dikirim dari: ${siteUrl}`;
};

export const generateRentalMessage = (
  productName: string,
  duration: string,
  price: number,
  productUrl: string
): string => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com';
  
  return `Halo Admin JB Alwikobra! 👋

Saya ingin rental akun game:
🎮 Produk: ${productName}
⏰ Durasi: ${duration}
💰 Harga: ${formatCurrency(price)}

Link Produk: ${productUrl}

Mohon konfirmasi ketersediaan dan proses selanjutnya.

Terima kasih! 🙏

---
Dikirim dari: ${siteUrl}`;
};

export const generatePurchaseMessage = (
  productName: string,
  price: number,
  productUrl: string
): string => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com';
  
  return `Halo Admin JB Alwikobra! 👋

Saya ingin membeli akun game:
🎮 Produk: ${productName}
💰 Harga: ${formatCurrency(price)}

Link Produk: ${productUrl}

Mohon info proses pembelian dan pembayaran.

Terima kasih! 🙏

---
Dikirim dari: ${siteUrl}`;
};
