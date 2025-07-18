"use client";
import { useState, useEffect } from 'react';
import MonthlyChart from "@/components/transactions/MonthlyChart"
import TransactionForm from "@/components/transactions/TransactionForm"
import TransactionList from "@/components/transactions/TransactionList"
import { toast } from 'sonner';
import Loader from '@/components/Loader';
import { CATEGORIES, CATEGORY_MAP } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await fetch('api/transactions');
            const json = await res.json();
            if (json.success) {
                setTransactions(json.data || []);
            } else {
                toast.error(json.error || "Failed to fetch transactions");
            }
        } catch (error) {
            console.error("Fetch Error: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id) => {
        toast.info("Deleting transaction...");
        try {
            const res = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            const json = await res.json();
            if (json.success) {
                toast.success("Transaction deleted successfully");
                fetchTransactions(); // refresh list
            } else {
                toast.error(json.error || "Failed to delete transaction");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Something went wrong");
        }
    };

    const monthGraphData = (transactions) => {
        // Calculate total amount per month
        const monthlyTotals = {};
        transactions.forEach(tx => {
            const month = tx.month;
            const amount = Number.parseInt(tx.amount) || 0;
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = 0;
            }
            monthlyTotals[month] += amount;
        });
        // Convert to array of { month, amount }
        return Object.entries(monthlyTotals).map(([month, amount]) => ({
            month,
            amount
        }));
    }


    useEffect(() => {
        fetchTransactions();
    }, []);

    return (
        <>
            <Loader loading={loading} />
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* title */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" >Transaction Tracker</h1>
                        <p className="my-2 text-gray-600" >Add and track your expenses with ease</p>
                    </div>

                    {/* Transaction Form */}
                    <TransactionForm categories={CATEGORIES} initialData={selected} onSubmit={fetchTransactions} onCancel={() => setSelected(null)} />

                    {/* Transaction List */}
                    <TransactionList categories={CATEGORY_MAP} transactions={transactions} onEdit={(tx) => setSelected(tx)} onDelete={handleDelete} />

                    {/* Monthly Expenses */}
                    <MonthlyChart transactions={monthGraphData(transactions)} />
                </div>
        </>
    )
}