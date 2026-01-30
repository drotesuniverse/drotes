export interface FinancialOrder {
    id: string;
    total: number; // Final charge to customer (inc tax/ship)
    subtotal: number; // Line items total
    tax: number;
    shipping: number;
    refundTotal: number;
    currency: string;
    exchangeRate: number; // Rate to convert to Base (AED)
    status: string;
    items: Array<{
        name: string;
        quantity: number;
        cost: number; // Unit Cost (Base Currency usually, or converted)
        price: number; // Unit Price (Order Currency)
    }>;
}

export interface ProfitMetrics {
    revenue: number; // Gross Sales (AED)
    netSales: number; // Revenue - Returns - Discounts (AED)
    costOfGoods: number; // Total Cost (AED)
    grossProfit: number; // Net Sales - COGS (AED)
    netProfit: number; // Gross Profit - Expenses (Tax/Ship if excluded) -> Simplification: We often treat Profit = (Revenue - Tax - Ship) - Cost
    // Or for E-com: Profit = (Order Total - Tax - Shipping) - Cost
    // We will stick to: Realized Revenue (excl tax/ship) - COGS

    margin: number; // %
    currency: string; // "AED"
}

export const calculateProfitability = (order: FinancialOrder): ProfitMetrics => {
    // 1. Filter Invalid Statuses
    const invalidStatuses = ['cancelled', 'failed', 'trash'];
    if (invalidStatuses.includes(order.status)) {
        return { revenue: 0, netSales: 0, costOfGoods: 0, grossProfit: 0, netProfit: 0, margin: 0, currency: "AED" };
    }

    // 2. Determine Exchange Rate
    // Rate is "How many AED for 1 Unit of Order Currency"
    // e.g. if USD, rate might be 3.67. If AED, rate is 1.
    const rate = order.exchangeRate || 1;

    // 3. Calculate Base Metrics (in Order Currency)
    let effectiveTotal = order.total;

    // Handle Refunds
    if (order.status === 'refunded') {
        // If fully refunded, revenue is 0. 
        // If partially, we need the refund amount.
        // Assuming 'refundTotal' is passed as a positive number representing amount returned.
        effectiveTotal = Math.max(0, order.total - order.refundTotal);
    }

    // 4. Convert to Base Currency (AED)
    const totalAED = effectiveTotal * rate;
    const taxAED = order.tax * rate;
    const shippingAED = order.shipping * rate;

    // 5. Calculate Revenue (Net of Tax & Shipping)
    // "Net Sales" usually implies excluding tax/shipping.
    const netSalesAED = totalAED - taxAED - shippingAED;

    // 6. Calculate Costs
    // Costs are usually defined in Base Currency (AED) in the settings.
    // If items have cost in AED, we just sum them.
    const totalCostAED = order.items.reduce((acc, item) => {
        return acc + (item.cost * item.quantity);
    }, 0);

    // 7. Net Profit
    const netProfitAED = netSalesAED - totalCostAED;

    // 8. Margin
    const margin = netSalesAED > 0 ? (netProfitAED / netSalesAED) * 100 : 0;

    return {
        revenue: totalAED, // Cash in hand (AED)
        netSales: netSalesAED, // Real Revenue (excl tax/ship)
        costOfGoods: totalCostAED,
        grossProfit: netSalesAED - totalCostAED, // Same as Net Profit in this simple model
        netProfit: netProfitAED,
        margin,
        currency: "AED"
    };
};
