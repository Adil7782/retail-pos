"use client"

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Loader2, Trash2, Edit, AlertCircle } from "lucide-react";
import axios from "axios";

import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import ConfirmModel from "@/app/components/model/confirm-model";
import { Product } from "@/generated/prisma/client";

const ActionCell = ({ row }: { row: any }) => {
    const { id } = row.original;

    const { toast } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [obbSheetNames, setObbSheetNames] = useState("");

    const onDelete = async (staffId: string) => {
        try {
            setIsLoading(true);
            await axios.delete(`/api/factory-staff/${staffId}`);
            router.refresh();
            toast({
                title: "Successfully removed staff!",
                variant: 'success',
            });
        } catch (error: any) {
            console.error("ERROR", error);

            // Handle specific error for staff assigned to OBB sheets
            if (error.response?.status === 409 && error.response?.data?.assignedSheets) {
                const { assignedSheets } = error.response.data;
                const sheetNames = assignedSheets.map((sheet: any) => sheet.name).join(", ");
                setObbSheetNames(sheetNames);
                setShowAlert(true);
            } else {
                toast({
                    title: error.response?.data?.message || error.response?.data || "Something went wrong! Try again",
                    variant: "error"
                });
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="flex gap-2">
                <Link href={`/factory-staffs/${id}`}>
                    <Button
                        size='sm'
                        disabled={isLoading}
                        variant='outline'
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                </Link>
                <ConfirmModel onConfirm={() => onDelete(id)}>
                    <Button
                        size='sm'
                        disabled={isLoading}
                        variant='outline'
                    >
                        <Loader2 className={cn("animate-spin w-4 h-4 hidden", isLoading && "flex")} />
                        <Trash2 className={cn("w-4 h-4 text-destructive", isLoading && 'hidden')} />
                    </Button>
                </ConfirmModel>
            </div>

            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            <AlertDialogTitle className="text-destructive">
                                Cannot Delete Staff Member
                            </AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="pt-4 text-base">
                            This staff member is currently assigned to the following OBB sheet(s):
                            <div className="mt-3 p-3 bg-muted rounded-md border border-border">
                                <p className="font-semibold text-foreground">{obbSheetNames}</p>
                            </div>
                            <p className="mt-3">
                                Please unassign them before deletion.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowAlert(false)}>
                            Understood
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export const columns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "barcode",
        header: "Barcode",
        cell: ({ row }) => {
            const value: string = row.getValue("barcode");
            return (
                <a href={`mailto:${value}`} className="italic hover:text-blue-800">{value}</a>
            )
        }
    },
    {
        accessorKey: "description",
        header: "Description",
    },
    {
        accessorKey: "price",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-5"
                >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const value: string = row.getValue("price");
            return (
                <p className="capitalize">{value}</p>
            )
        }
    },
    {
        accessorKey: "costPrice",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-5"
                >
                    Cost
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const value: string = row.getValue("costPrice");
            return (
                <p className="capitalize">{value}</p>
            )
        }
    },
    {
        accessorKey: "stock",
        header: "Stock",
    },
    {
        accessorKey: "category.name",
        header: "Category",
    },
    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => <ActionCell row={row} />
    }
]