"use client";

interface PaymentReceiptProps {
  payment: {
    id: string;
    amount: number;
    paymentDate: string | Date;
    method: string;
    reference: string | null;
    notes: string | null;
    createdAt: string | Date;
    invoice: {
      invoiceNumber: string;
      grandTotal: number;
      customer: {
        name: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
      };
      payments: { amount: number }[];
    };
  };
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

function formatMethod(method: string) {
  switch (method) {
    case "CASH":
      return "Cash";
    case "CARD":
      return "Card";
    case "BANK_TRANSFER":
      return "Bank Transfer";
    case "CHEQUE":
      return "Cheque";
    case "ONLINE":
      return "Online";
    default:
      return method;
  }
}

export default function PaymentReceipt({
  payment,
  companyName = "Workshop Pro",
  companyAddress,
  companyPhone,
  companyEmail,
}: PaymentReceiptProps) {
  const totalPaid = payment.invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balanceRemaining = payment.invoice.grandTotal - totalPaid;

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <div className="mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Print Receipt
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-8 max-w-lg mx-auto print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center border-b border-slate-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-slate-900">{companyName}</h2>
          {companyAddress && <p className="text-sm text-slate-600">{companyAddress}</p>}
          {companyPhone && <p className="text-sm text-slate-600">{companyPhone}</p>}
          {companyEmail && <p className="text-sm text-slate-600">{companyEmail}</p>}
        </div>

        <h3 className="text-center text-lg font-bold text-slate-900 mb-4">PAYMENT RECEIPT</h3>

        {/* Receipt details */}
        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-slate-600">Receipt Date:</span>
            <span className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Invoice Reference:</span>
            <span className="font-medium">{payment.invoice.invoiceNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Customer:</span>
            <span className="font-medium">{payment.invoice.customer.name}</span>
          </div>
        </div>

        {/* Amount */}
        <div className="bg-slate-50 rounded-lg p-4 text-center mb-6">
          <p className="text-sm text-slate-600 mb-1">Amount Paid</p>
          <p className="text-3xl font-bold text-slate-900">
            Rs. {payment.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Payment info */}
        <div className="space-y-2 text-sm mb-6">
          <div className="flex justify-between">
            <span className="text-slate-600">Payment Method:</span>
            <span className="font-medium">{formatMethod(payment.method)}</span>
          </div>
          {payment.reference && (
            <div className="flex justify-between">
              <span className="text-slate-600">Reference #:</span>
              <span className="font-medium">{payment.reference}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Balance Remaining:</span>
            <span className="font-medium">
              Rs. {Math.max(0, balanceRemaining).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 text-center">
          <p className="text-sm text-slate-500">Thank you for your payment!</p>
        </div>
      </div>
    </div>
  );
}
