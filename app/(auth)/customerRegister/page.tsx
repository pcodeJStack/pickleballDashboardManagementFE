

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarClock, Loader2, Lock, Mail, User } from "lucide-react";
import z from "zod";

import { useCustomerRegisterMutation } from "@/app/hooks/auth_hooks/useCustomerRegisterMutation";
import { Particle } from "@/app/types/particle.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { customerRegisterSchema } from "@/lib/validations/auth.schema";

type CustomerRegisterFormValues = z.infer<typeof customerRegisterSchema>;

type RegisterErrorResponse = {
  code?: number;
  message?: string;
  data?: Partial<Record<keyof CustomerRegisterFormValues, string>>;
};

const PARTICLE_COUNT = 80;

const CustomerRegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);
  const { mutateAsync: customerRegister, isPending } = useCustomerRegisterMutation();

  useEffect(() => {
    setMounted(true);

    const nextParticles: Particle[] = Array.from(
      { length: PARTICLE_COUNT },
      (_, id) => {
        const size = 1.5 + Math.random() * 10;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2.5 + Math.random() * 0.3;
        const opacity = 0.25 + Math.random() * 0.15;

        return {
          id,
          size,
          top,
          left,
          delay,
          duration,
          opacity,
        };
      },
    );

    setParticles(nextParticles);
  }, []);

  const form = useForm<CustomerRegisterFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      password: ""
    },
  });

  const handleSubmit = async (values: CustomerRegisterFormValues) => {
    try {
      await customerRegister({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone,
      });
    } catch (error: unknown) {
      const response = (error as { response?: { data?: RegisterErrorResponse } })
        ?.response?.data;

      if (response?.code === 400 && response.data) {
        Object.entries(response.data).forEach(([field, message]) => {
          if (!message) return;
          form.setError(field as keyof CustomerRegisterFormValues, {
            type: "server",
            message,
          });
        });
        return;
      }

      form.setError("root", {
        type: "server",
        message: response?.message || "Đăng ký thất bại, vui lòng thử lại.",
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-550 pb-grid-bg text-slate-50">
      <div className="pointer-events-none absolute inset-0 bg-black" />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        suppressHydrationWarning
      >
        {mounted &&
          particles.map((p) => (
            <span
              key={p.id}
              className="pb-dust-particle"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
                opacity: p.opacity,
              }}
            />
          ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-4 py-10 lg:px-12">
        <div className="mx-auto grid w-full max-w-250 items-center gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className="space-y-8 pb-motion-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
              <span>CUSTOMER BOOKING PORTAL</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Tạo tài khoản khách hàng
                <span className="block text-amber-400">Pickleball Smart</span>
                <span className="block text-sky-300">
                  Thiết lập nhanh, bắt đầu đặt sân ngay
                </span>
              </h1>
              <p className="max-w-xl text-sm text-slate-400 sm:text-base">
                Đăng ký tài khoản để lưu thông tin cá nhân, theo dõi lịch sử booking
                và nhận thông báo ưu đãi mới từ hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-200 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Đăng ký trong vài bước
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Bảo mật chuẩn tài khoản khách hàng
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Liên kết trực tiếp luồng đặt sân
              </span>
            </div>

            <div className="hidden items-center gap-4 text-xs text-slate-500 md:flex">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-semibold text-amber-300">
                  PB
                </span>
                <div>
                  <p className="font-medium text-slate-200">Pickleball Booking</p>
                  <p>Cổng đăng ký cho khách hàng mới</p>
                </div>
              </div>
            </div>
          </section>

          <Card className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-750/90 shadow-[0_24px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-0 -top-px h-0.75 bg-linear-to-r from-amber-400 via-emerald-400 to-sky-400" />

            <CardContent className="p-6 sm:p-8">
              <div className="mb-6 flex flex-col items-center gap-4">
                <div className="relative flex h-14 w-14 animate-pulse items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/15 text-amber-300">
                  <span className="absolute -inset-1.5 rounded-full border border-amber-400/20" />
                  <CalendarClock className="h-6 w-6" />
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-semibold tracking-tight">
                    Đăng ký khách hàng
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Điền đủ thông tin để tạo tài khoản mới.
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>HỌ TÊN</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <User className="h-5 w-5" />
                            </span>
                            <Input
                              placeholder="Nguyen Van A"
                              className="h-10 rounded-4xl border-gray-600 pl-9 pr-3.5 text-gray-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>SỐ ĐIỆN THOẠI</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <User className="h-5 w-5" />
                            </span>
                            <Input
                              placeholder="03xxxxxxxx"
                              className="h-10 rounded-4xl border-gray-600 pl-9 pr-3.5 text-gray-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>EMAIL</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <Mail className="h-5 w-5" />
                            </span>
                            <Input
                              placeholder="customer@example.com"
                              className="h-10 rounded-4xl border-gray-600 pl-9 pr-3.5 text-gray-300"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>MẬT KHẨU</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <Lock className="h-5 w-5" />
                            </span>
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              className="h-10 rounded-4xl border-gray-600 pl-9 pr-9 text-gray-300"
                              {...field}
                            />
                            <button
                              type="button"
                              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                              className="absolute inset-y-0 right-3 flex cursor-pointer items-center text-slate-500 hover:text-slate-200"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                                {showPassword ? (
                                  <path
                                    d="M12 5c-5.5 0-9 5.5-9 7s3.5 7 9 7 9-5.5 9-7-3.5-7-9-7Zm0 11.5A4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 0 1 12 16.5Zm0-7A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z"
                                    fill="currentColor"
                                  />
                                ) : (
                                  <path
                                    d="M4.21 3.39 2.8 4.8l2.06 2.06A10.92 10.92 0 0 0 1.5 12s2.73 7 10.5 7c1.97 0 3.63-.47 5.02-1.2l2.17 2.17 1.41-1.41L4.21 3.39ZM12 17.5C7.6 17.5 5.04 14.39 3.9 12a9.71 9.71 0 0 1 2.16-2.66l1.55 1.55A3.75 3.75 0 0 0 12 15.75c.62 0 1.21-.15 1.73-.41l1.74 1.74c-.88.28-1.86.42-2.97.42Zm0-9.25c.19 0 .38.02.56.05l2.93 2.93A3.74 3.74 0 0 0 12 8.25V8.5Z"
                                    fill="currentColor"
                                  />
                                )}
                              </svg>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  

                  {form.formState.errors.root && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-amber-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:bg-amber-300"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
                  </Button>

                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                    <p>
                      Đã có tài khoản?{" "}
                      <Link
                        href="/customerLogin"
                        className="cursor-pointer font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Đăng nhập ngay
                      </Link>
                    </p>
                    <p>Bảo mật: mã hóa AES-256 và xác thực hai lớp (2FA).</p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;
