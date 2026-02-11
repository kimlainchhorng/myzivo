import type { UnifiedOrder } from "@/hooks/useSpendingStats";

function baseReceiptHTML(order: UnifiedOrder, body: string): string {
  const dateStr = new Date(order.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt — ZIVO</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #e5e5e5; padding-bottom: 24px; }
    .logo { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .order-id { color: #666; font-size: 13px; margin-top: 8px; }
    .date { color: #888; font-size: 13px; margin-top: 4px; }
    .service-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-top: 12px; }
    .eats { background: #fff7ed; color: #ea580c; }
    .rides { background: #eff6ff; color: #2563eb; }
    .travel { background: #f5f3ff; color: #7c3aed; }
    .details { margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .row:last-child { border-bottom: none; }
    .label { color: #666; font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; }
    .discount-row { color: #059669; }
    .total-row { display: flex; justify-content: space-between; padding: 16px 0; margin-top: 12px; border-top: 2px solid #1a1a1a; }
    .total-label { font-weight: 700; font-size: 16px; }
    .total-value { font-weight: 800; font-size: 20px; }
    .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e5e5; color: #999; font-size: 12px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ZIVO</div>
    <div class="order-id">Order #${order.id.slice(0, 8).toUpperCase()}</div>
    <div class="date">${dateStr}</div>
    <span class="service-badge ${order.type}">${order.type === "eats" ? "Eats" : order.type === "rides" ? "Rides" : "Travel"}</span>
  </div>
  ${body}
  <div class="total-row">
    <span class="total-label">Total Paid</span>
    <span class="total-value">$${order.amount.toFixed(2)}</span>
  </div>
  <div class="footer">
    <p>Thank you for using ZIVO</p>
    <p style="margin-top: 4px;">hizovo.com</p>
  </div>
</body>
</html>`;
}

function buildBreakdownRows(order: UnifiedOrder): string {
  const lines: string[] = [];

  const addRow = (label: string, value: number | undefined, cssClass = "") => {
    if (value && value > 0) {
      const prefix = cssClass.includes("discount") ? "-" : "";
      lines.push(
        `<div class="row ${cssClass}"><span class="label">${label}</span><span class="value">${prefix}$${value.toFixed(2)}</span></div>`
      );
    }
  };

  if (order.subtotal != null && order.subtotal > 0) {
    addRow("Subtotal", order.subtotal);
  }
  addRow("Delivery Fee", order.deliveryFee);
  addRow("Service Fee", order.serviceFee);
  const taxLabel = order.taxRate != null ? `Tax (${(order.taxRate * 100).toFixed(2)}%)` : "Tax";
  addRow(taxLabel, order.tax);
  addRow("Tip", order.tip);

  if (order.discount && order.discount > 0) {
    const promoLabel = order.promoCode ? `Discount (${order.promoCode})` : "Discount";
    addRow(promoLabel, order.discount, "discount-row");
  }

  return lines.join("\n");
}

export function generateReceiptHTML(order: UnifiedOrder): string {
  const hasBreakdown = order.subtotal != null || order.deliveryFee != null || order.serviceFee != null || order.tax != null;

  let body: string;
  if (hasBreakdown) {
    body = `
    <div class="details">
      <div class="row"><span class="label">Service</span><span class="value">${order.title}</span></div>
      <div class="row"><span class="label">Status</span><span class="value" style="text-transform:capitalize;">${order.status}</span></div>
    </div>
    <div class="details">
      ${buildBreakdownRows(order)}
    </div>`;
  } else {
    body = `
    <div class="details">
      <div class="row"><span class="label">Service</span><span class="value">${order.title}</span></div>
      <div class="row"><span class="label">Status</span><span class="value" style="text-transform:capitalize;">${order.status}</span></div>
    </div>`;
  }

  return baseReceiptHTML(order, body);
}

export function downloadReceipt(order: UnifiedOrder): void {
  const html = generateReceiptHTML(order);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
