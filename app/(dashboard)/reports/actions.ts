"use server"

import { db } from "@/lib/db"

export type SalesReportData = {
    totalSales: number
    totalProfit: number
    orderCount: number
    dateRange: {
        from: Date
        to: Date
    }
    chartData: {
        date: string
        sales: number
        profit: number
    }[]
}

export const getSalesReport = async (dateRange: { from: string, to: string }): Promise<SalesReportData> => {
    const { from, to } = dateRange
    console.log("Generating report for:", from, to)

    // 1. Create Date objects from the incoming strings
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // 2. Set the exact time boundaries
    fromDate.setHours(0, 0, 0, 0); 
    toDate.setHours(23, 59, 59, 999);
    
    const orders = await db.order.findMany({
        where: {
            createdAt: {
                gte: fromDate,
                lte: toDate,
            },
            status: "COMPLETED"
        },
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    })

    let totalSales = 0
    let totalProfit = 0
    const orderCount = orders.length
    
    // Aggregation for charts
    const dailyData: Record<string, { sales: number, profit: number }> = {}

    for (const order of orders) {
        // Aggregate totals
        totalSales += order.totalAmount
        
        // Calculate profit for this order
        let orderProfit = 0
        for (const item of order.items) {
            const profitPerItem = (item.price - item.cost) * item.quantity
            orderProfit += profitPerItem
            totalProfit += profitPerItem
        }
        
        // Aggregate daily data
        const dateKey = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = { sales: 0, profit: 0 }
        }
        dailyData[dateKey].sales += order.totalAmount
        dailyData[dateKey].profit += orderProfit
    }

    // Convert map to array
    const chartData = Object.entries(dailyData).map(([date, data]) => ({
        date,
        sales: data.sales,
        profit: data.profit
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
        totalSales,
        totalProfit,
        orderCount,
        dateRange: { from: fromDate, to: toDate },
        chartData
    }
}
