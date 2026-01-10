"use client"
import SelectDateRange from '@/app/components/forms/select-date-range'
import React, { useState } from 'react'
import { getSalesReport, SalesReportData } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'
import { getFormattedTime } from '@/lib/utils-time'
import { ReportsCharts } from './charts'

const Analytics = () => {
    const [reportData, setReportData] = useState<SalesReportData | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmitData = async (data: any) => {
        setLoading(true)
        try {
            const { from, to } = data.date
            const fromDate = getFormattedTime(from.toString())
            const toDate = getFormattedTime(to.toString())

            console.log("Fetching report for:", fromDate, toDate)
            const result = await getSalesReport({ from: fromDate, to: toDate })
            setReportData(result)
        } catch (error) {
            console.error("Error fetching report:", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LKR',
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <SelectDateRange handleSubmitData={handleSubmitData} />

            {loading && (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            {reportData && !loading && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Sales
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(reportData.totalSales)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {reportData.orderCount} orders processed
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Profit
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalProfit)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Net Earnings
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Net Margin
                                </CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {reportData.totalSales > 0
                                        ? ((reportData.totalProfit / reportData.totalSales) * 100).toFixed(1)
                                        : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Profit Margin
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {reportData.chartData && reportData.chartData.length > 0 && (
                        <ReportsCharts data={reportData.chartData} />
                    )}
                </div>
            )}
        </div>
    )
}

export default Analytics