export class ReceiptTemplate {
  static generateHTML(processedData) {
    const { header, orderInfo, items, totals, footer, settings } =
      processedData;

    return `
  <!DOCTYPE html>
  <html>
  <head>
      <title>Order Receipt</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script>
        tailwind.config = {
          theme: {
            extend: {
              fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
              }
            }
          }
        }
      </script>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="font-poppins text-gray-900 bg-white p-5 text-xs leading-relaxed font-normal max-w-xs mx-auto">
    <div class="w-full max-w-[280px] mx-auto">
      ${this.generateHeader(header, settings)}
      ${this.generateOrderInfo(orderInfo, settings)}
      ${this.generateItemsTable(items)}
      ${this.generateTotalsSection(totals, settings)}
      ${this.generateFooter(footer)}
    </div>

    <script>
      window.onload = function() {
        window.print();
        setTimeout(() => window.close(), 1000);
      };
    </script>
  </body>
  </html>`;
  }

  static generateHeader(header, settings) {
    const logoUrl = settings?.storeInformation?.logoUrl;
    const printLogo = settings?.receipt?.printLogo;
    return `
      <div class="text-center mb-5 border-b-2 border-black pb-4 w-full">
        ${
          printLogo && logoUrl
            ? `<img src="${logoUrl}" alt="Logo" class="w-16 h-16 mx-auto mb-2" />`
            : ""
        }
        <h1 class="text-lg font-bold mb-1 tracking-wider">
          ${header.restaurantName}
        </h1>
        ${
          header.address
            ? `<div class="text-[10px] leading-tight text-gray-600">${header.address}</div>`
            : ""
        }
        ${
          header.phone
            ? `<div class="text-[10px] text-gray-600">Phone: ${header.phone}</div>`
            : ""
        }
        <div class="text-[10px] text-gray-500 mt-1 text-center tracking-wider w-full block">
          ${header.dateTime}
        </div>
      </div>`;
  }

  static generateOrderInfo(orderInfo, settings) {
    return `
      <div class="mb-4">
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Order:</span>
          <span class="font-normal text-gray-600">${
            orderInfo.orderNumber
          }</span>
        </div>
        ${
          orderInfo.receiptNumber && settings?.receipt?.showOrderNumber
            ? `
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Receipt #:</span>
          <span class="font-normal text-gray-600">${orderInfo.receiptNumber}</span>
        </div>`
            : ""
        }
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Customer:</span>
          <span class="font-normal text-gray-600">${
            orderInfo.customerName
          }</span>
        </div>
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Mobile Number:</span>
          <span class="font-normal text-gray-600">${
            orderInfo.mobileNumber
          }</span>
        </div>
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Payment:</span>
          <span class="font-normal text-gray-600">${
            orderInfo.paymentMethod
          }</span>
        </div>
        <div class="flex justify-between items-center mb-1 text-[11px]">
          <span class="font-semibold text-gray-700">Delivery Type:</span>
          <span class="font-normal text-gray-600">${
            orderInfo.deliveryType
              ? orderInfo.deliveryType.charAt(0).toUpperCase() +
                orderInfo.deliveryType.slice(1)
              : "-"
          }</span>
        </div>
      </div>`;
  }

  static generateItemsTable(items) {
    const itemsHTML = items
      .map(
        (item) => `
          <tr class="border-b border-dotted border-gray-300">
            <td class="py-1 text-[10px] align-top">
              <div class="font-semibold text-gray-700">${item.name}</div>
              ${
                item.discount > 0
                  ? `<div class="text-[9px] text-green-600 font-semibold mt-0.5">${item.discount}% OFF</div>`
                  : ""
              }
            </td>
            <td class="py-1 text-[10px] text-center">${item.quantity}</td>
            <td class="py-1 text-[10px] text-right">${item.price}</td>
            <td class="py-1 text-[10px] text-right">${item.total}</td>
          </tr>`
      )
      .join("");

    return `
      <table class="w-full border-collapse my-4">
        <thead>
          <tr>
            <th class="text-left py-1 border-b border-gray-700 font-bold text-[10px] uppercase" style="width: 50%;">Item</th>
            <th class="text-center py-1 border-b border-gray-700 font-bold text-[10px] uppercase" style="width: 15%;">Qty</th>
            <th class="text-right py-1 border-b border-gray-700 font-bold text-[10px] uppercase" style="width: 20%;">Price</th>
            <th class="text-right py-1 border-b border-gray-700 font-bold text-[10px] uppercase" style="width: 15%;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>`;
  }

  static generateTotalsSection(totals, settings) {
    // Generate tax breakdown HTML
    const taxBreakdownHTML =
      totals.taxBreakdown && totals.taxBreakdown.length > 0
        ? totals.taxBreakdown
            .map(
              (tax) => `
          <div class="flex justify-between mb-1 text-[11px] text-gray-600">
            <span>${tax.name} (${tax.rate}${
                tax.type === "percentage" ? "%" : ""
              }):</span>
            <span>${tax.amount}</span>
          </div>`
            )
            .join("")
        : `
          <div class="flex justify-between mb-1 text-[11px] text-gray-600">
            <span>Tax:</span>
            <span>${totals.tax}</span>
          </div>`;

    return `
      <div class="mt-4 pt-3 border-t border-gray-700">
        <div class="flex justify-between mb-1 text-[11px] text-gray-600">
          <span>Subtotal:</span>
          <span>${totals.subtotal}</span>
        </div>
        ${
          totals.itemDiscounts && settings?.receipt?.showItemDiscounts
            ? `
        <div class="flex justify-between mb-1 text-[11px] text-green-600 font-semibold">
          <span>Item Discounts:</span>
          <span>-${totals.itemDiscounts}</span>
        </div>`
            : ""
        }
        ${
          totals.cartDiscount
            ? `
        <div class="flex justify-between mb-1 text-[11px] text-green-600 font-semibold">
          <span>Cart Discount:</span>
          <span>-${totals.cartDiscount}</span>
        </div>`
            : ""
        }
        ${settings?.receipt?.showTaxBreakdown ? taxBreakdownHTML : ""}
        <div class="flex justify-between mb-1 text-sm font-bold text-black border-t-2 border-black pt-1 mt-2">
          <span>TOTAL:</span>
          <span>${totals.total}</span>
        </div>
      </div>`;
  }

  static generateFooter(footer) {
    return `
      <div class="text-center mt-5 pt-4 border-t-2 border-black text-[11px]">
        <div class="font-bold mb-1 text-xs">
          ${footer.thankYou}
        </div>
        <div class="text-gray-600 text-[10px]">
          ${footer.comeAgain}
        </div>
      </div>`;
  }
}
