"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Filter, LineChart } from "lucide-react";

type Transaction = {
  id: string;
  customer: string;
  court: string;
  amount: number;
  method: "cash" | "bank" | "momo";
  time: string;
  status: "success" | "pending" | "failed";
};

const initialTransactions: Transaction[] = [
  {
    id: "TX-20260414-001",
    customer: "Nguyễn Văn A",
    court: "Sân A1",
    amount: 350000,
    method: "momo",
    time: "17:45",
    status: "success",
  },
  {
    id: "TX-20260414-002",
    customer: "Trần Thị B",
    court: "Sân B2",
    amount: 400000,
    method: "bank",
    time: "18:20",
    status: "pending",
  },
  {
    id: "TX-20260414-003",
    customer: "Lê Văn C",
    court: "Sân C1",
    amount: 250000,
    method: "cash",
    time: "19:05",
    status: "success",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const TransactionsPage = () => {
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Transaction["status"] | "all">("all");

  const filtered = transactions.filter((t) => {
    const keyword = search.toLowerCase();
    const matchesSearch =
      t.id.toLowerCase().includes(keyword) ||
      t.customer.toLowerCase().includes(keyword) ||
      t.court.toLowerCase().includes(keyword);
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filtered
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-50">Quản lý giao dịch</h1>
          <p className="text-xs text-slate-400">
            Theo dõi doanh thu, trạng thái thanh toán và phương thức giao dịch của từng lượt đặt sân.
          </p>
        </div>
        <Button size="sm" className="bg-emerald-500 text-slate-950 hover:bg-emerald-400">
          Xuất báo cáo ngày
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-slate-800/80 bg-slate-950/70">
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div>
              <CardTitle className="text-xs font-medium text-slate-400 uppercase tracking-[0.16em]">
                Doanh thu đã thanh toán
              </CardTitle>
              <p className="mt-1 text-2xl font-semibold text-emerald-300">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-400/40">
              <LineChart className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card className="border border-slate-800/80 bg-slate-950/70">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              Lọc theo mã giao dịch, khách hàng, sân hoặc trạng thái thanh toán.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-300">
              <Filter className="h-3.5 w-3.5" />
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "all" ? "bg-slate-800 text-slate-100" : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "success"
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("success")}
              >
                Thành công
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "pending"
                    ? "bg-amber-500/20 text-amber-200"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("pending")}
              >
                Đang chờ
              </button>
              <button
                type="button"
                className={`rounded-md px-2 py-0.5 transition-colors ${
                  statusFilter === "failed"
                    ? "bg-destructive/30 text-destructive"
                    : "text-slate-400"
                }`}
                onClick={() => setStatusFilter("failed")}
              >
                Thất bại
              </button>
            </div>
            <Input
              placeholder="Tìm theo mã, khách hoặc sân..."
              className="h-8 w-56 bg-slate-900/60 border-slate-700 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-3 rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
            <span>Mã giao dịch</span>
            <span>Khách hàng</span>
            <span>Sân</span>
            <span>Thanh toán</span>
            <span className="text-right">Trạng thái</span>
            <span className="text-right">Thao tác</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] items-center gap-3 rounded-xl bg-slate-900/70 px-3 py-2.5 text-xs text-slate-200 border border-slate-800/70 hover:bg-slate-800/80 hover:border-slate-600/80"
              >
                <span className="font-mono text-[11px] text-slate-300">
                  {tx.id}
                </span>
                <span className="space-y-0.5">
                  <span className="font-medium text-slate-50">{tx.customer}</span>
                  <span className="text-[11px] text-slate-400">{tx.time}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/90 text-amber-200 border border-slate-700/80">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  {tx.court}
                </span>
                <span className="space-y-0.5 text-[11px] text-slate-300">
                  <span>{formatCurrency(tx.amount)}</span>
                  <span className="text-[10px] text-slate-500">
                    {tx.method === "cash"
                      ? "Tiền mặt"
                      : tx.method === "bank"
                        ? "Chuyển khoản"
                        : "Ví MoMo"}
                  </span>
                </span>
                <span className="flex justify-end">
                  <span
                    className={`inline-flex h-6 items-center rounded-full px-2.5 text-[10px] font-medium tracking-wide ${
                      tx.status === "success"
                        ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                        : tx.status === "pending"
                          ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
                          : "bg-destructive/20 text-destructive border border-destructive/40"
                    }`}
                  >
                    {tx.status === "success"
                      ? "Thành công"
                      : tx.status === "pending"
                        ? "Đang chờ"
                        : "Thất bại"}
                  </span>
                </span>
                <span className="flex justify-end gap-1.5">
                  <Button
                    size="xs"
                    variant="outline"
                    className="border-slate-700 bg-slate-900/80 text-[11px] text-slate-200 hover:bg-slate-800"
                  >
                    Chi tiết
                  </Button>
                  {tx.status === "success" && (
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-[11px] text-amber-300 hover:bg-amber-500/10"
                    >
                      Hoàn tiền
                    </Button>
                  )}
                </span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 px-4 py-8 text-xs text-slate-500">
                Không có giao dịch nào phù hợp với bộ lọc.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
