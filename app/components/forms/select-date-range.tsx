"use client"

import * as React from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from "date-fns"
import { CalendarIcon, Filter, Loader2 } from 'lucide-react'
import z from 'zod'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

// Zod Schema
const formSchema = z.object({
    date: z
        .object({
            from: z.date(),
            to: z.date(),
        })
        .refine((range) => range.from && range.to, {
            message: "Please select a valid date range",
        }),
})

type FormSchemaType = z.infer<typeof formSchema>

interface SelectDateRangeProps {
    handleSubmitData: (data: FormSchemaType) => void
}

const SelectDateRange = ({ handleSubmitData }: SelectDateRangeProps) => {
    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        // We don't set defaultValues to undefined for objects usually to avoid controlled/uncontrolled warnings, 
        // but for date ranges, undefined is often required until selection.
    })

    const { isSubmitting, isValid } = form.formState

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-sm">
            <CardHeader>
                <CardTitle>Report Generation</CardTitle>
                <CardDescription>
                    Select a date range to filter the data and generate your report.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmitData)}
                        className="flex flex-col sm:flex-row gap-4 items-start sm:items-end"
                    >
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col flex-1 w-full">
                                    <FormLabel>Date Range</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal h-10",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value?.from ? (
                                                        field.value.to ? (
                                                            <>
                                                                {format(field.value.from, "LLL dd, y")} -{" "}
                                                                {format(field.value.to, "LLL dd, y")}
                                                            </>
                                                        ) : (
                                                            format(field.value.from, "LLL dd, y")
                                                        )
                                                    ) : (
                                                        <span>Pick a date range</span>
                                                    )}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="range"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("2020-01-01")
                                                }
                                                initialFocus
                                                numberOfMonths={2} // UX Tip: Showing 2 months makes range selection easier
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={!isValid || isSubmitting}
                            className="w-full sm:w-auto min-w-[140px] h-10"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Filter className="mr-2 h-4 w-4" />
                                    Generate
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SelectDateRange