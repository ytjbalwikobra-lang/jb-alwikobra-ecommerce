import React from 'react';
import { Link } from 'react-router-dom';
import { Info, Calendar } from 'lucide-react';
import { Product, Customer, RentalOption } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import PhoneInput from '../PhoneInput';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  checkoutType: 'purchase' | 'rental';
  selectedRental: RentalOption | null;
  effectivePrice: number;
  customer: Customer;
  onCustomerChange: (customer: Customer) => void;
  onPhoneValidationChange: (valid: boolean) => void;
  acceptedTerms: boolean;
  onTermsChange: (accepted: boolean) => void;
  creatingInvoice: boolean;
  onCheckout: () => void;
  onWhatsAppContact: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  product,
  checkoutType,
  selectedRental,
  effectivePrice,
  customer,
  onCustomerChange,
  onPhoneValidationChange,
  acceptedTerms,
  onTermsChange,
  creatingInvoice,
  onCheckout,
  onWhatsAppContact
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-black border border-pink-500/30 rounded-xl max-w-md w-full p-6 text-gray-200">
        <h3 className="text-xl font-bold text-white mb-4">
          {checkoutType === 'purchase' ? 'Beli Akun' : 'Rental Akun'}
        </h3>
        
        <div className="mb-4 p-4 bg-black border border-pink-500/30 rounded-lg">
          <p className="font-medium text-white">{product.name}</p>
          <p className="text-pink-400 font-semibold">
            {checkoutType === 'rental' && selectedRental
              ? `${formatCurrency(selectedRental.price)} (${selectedRental.duration})`
              : formatCurrency(effectivePrice)
            }
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={customer.name}
              onChange={(e) => onCustomerChange({ ...customer, name: e.target.value })}
              className="w-full px-3 py-2 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={customer.email}
              onChange={(e) => onCustomerChange({ ...customer, email: e.target.value })}
              className="w-full px-3 py-2 border border-pink-500/40 bg-black text-white rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Masukkan email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              No. WhatsApp *
            </label>
            <PhoneInput
              value={customer.phone}
              onChange={(value) => onCustomerChange({ ...customer, phone: value })}
              onValidationChange={onPhoneValidationChange}
              placeholder="Masukkan Nomor WhatsApp"
              required
            />
          </div>

          {checkoutType === 'purchase' && (
            <div className="p-3 bg-black border border-pink-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-300">
                <Info size={16} />
                <span className="text-sm">
                  Pembayaran melalui sistem pembayaran aman dan terjamin. Informasi detail akan di kirim via WhatsApp setelah pembayaran berhasil.
                </span>
              </div>
            </div>
          )}

          {checkoutType === 'rental' && (
            <div className="p-3 bg-black border border-pink-500/30 rounded-lg">
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar size={16} />
                <span className="text-sm">
                  Akses rental akan diberikan melalui WhatsApp
                </span>
              </div>
            </div>
          )}

          {/* Terms acceptance (required for purchase) */}
          {checkoutType === 'purchase' && (
            <label className="flex items-start space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => onTermsChange(e.target.checked)}
                className="mt-0.5 form-checkbox h-4 w-4 text-pink-600 border-pink-500/40 bg-black rounded"
              />
              <span>
                Saya telah membaca dan menyetujui{' '}
                <Link to="/terms" className="text-pink-400 underline hover:text-pink-300" target="_blank" rel="noreferrer">
                  Syarat & Ketentuan PT ALWI KOBRA INDONESIA
                </Link>
              </span>
            </label>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-pink-500/40 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
            >
              Batal
            </button>

            {checkoutType === 'purchase' ? (
              <button
                type="button"
                onClick={onCheckout}
                disabled={!acceptedTerms || creatingInvoice}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  acceptedTerms && !creatingInvoice
                    ? 'bg-pink-600 text-white hover:bg-pink-700'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {creatingInvoice && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                )}
                {creatingInvoice ? 'Memproses...' : 'Bayar Sekarang'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onWhatsAppContact}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Lanjut ke WhatsApp
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
