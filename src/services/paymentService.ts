export type CreateInvoiceInput = {
  externalId: string;
  // Optional alias for clarity; we still send externalId to server
  clientExternalId?: string;
  amount: number;
  payerEmail?: string;
  description?: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
  customer?: {
    given_names?: string;
    email?: string;
    mobile_number?: string;
  };
  order?: {
    product_id?: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    order_type?: 'purchase' | 'rental';
    amount: number;
    rental_duration?: string | null;
  user_id?: string | null;
  };
};

export async function createXenditInvoice(input: CreateInvoiceInput) {
  const res = await fetch('/api/xendit/create-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  external_id: input.clientExternalId || input.externalId,
      amount: input.amount,
      payer_email: input.payerEmail,
      description: input.description,
      success_redirect_url: input.successRedirectUrl,
      failure_redirect_url: input.failureRedirectUrl,
      customer: input.customer
  ,order: input.order
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Failed to create invoice');
  return data as { id: string; invoice_url: string; status: string };
}
