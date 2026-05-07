"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarClock, KeyRound, Loader2, Mail } from "lucide-react";
import z from "zod";
import { useSearchParams } from "next/navigation";

import { useResendOtpMutation } from "@/app/hooks/auth_hooks/useResendOtpMutation";
import { useVerifyOtpMutation } from "@/app/hooks/auth_hooks/useVerifyOtpMutation";
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
import { verifyOtpSchema } from "@/lib/validations/auth.schema";

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

type VerifyOtpErrorResponse = {
  code?: number;
  message?: string;
  data?: Partial<Record<keyof VerifyOtpFormValues, string>>;
};

const PARTICLE_COUNT = 80;
const OTP_TTL_SECONDS = 60;

const VerifyOtpClient = () => {
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") || "";
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(OTP_TTL_SECONDS);
  const { mutateAsync: verifyOtp, isPending } = useVerifyOtpMutation();
  const { mutateAsync: resendOtp, isPending: isResending } = useResendOtpMutation();

  const formattedCountdown = useMemo(() => {
    const seconds = Math.max(secondsLeft, 0);
    return `00:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

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

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timerId = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [secondsLeft]);

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: presetEmail,
      otpInput: "",
    },
  });

  useEffect(() => {
    if (presetEmail) {
      form.setValue("email", presetEmail, { shouldValidate: true });
    }
  }, [form, presetEmail]);

  const handleSubmit = async (values: VerifyOtpFormValues) => {
    if (secondsLeft <= 0) {
      form.setError("root", {
        type: "expired",
        message: "Mã OTP đã hết hạn. Vui lòng đăng ký lại để nhận mã mới.",
      });
      return;
    }

    try {
      await verifyOtp(values);
    } catch (error: unknown) {
      const response = (error as { response?: { data?: VerifyOtpErrorResponse } })
        ?.response?.data;

      if (response?.code === 400 && response.data) {
        Object.entries(response.data).forEach(([field, message]) => {
          if (!message) return;
          form.setError(field as keyof VerifyOtpFormValues, {
            type: "server",
            message,
          });
        });
        return;
      }

      form.setError("root", {
        type: "server",
        message: response?.message || "Xác thực OTP thất bại, vui lòng thử lại.",
      });
    }
  };

  const handleResend = async () => {
    const email = form.getValues("email");
    if (!email) {
      form.setError("email", {
        type: "manual",
        message: "Vui lòng nhập email để nhận OTP mới.",
      });
      return;
    }

    try {
      await resendOtp({ email });
      setSecondsLeft(OTP_TTL_SECONDS);
      form.setValue("otpInput", "");
      form.clearErrors("root");
    } catch (error: unknown) {
      const response = (error as { response?: { data?: VerifyOtpErrorResponse } })
        ?.response?.data;

      form.setError("root", {
        type: "server",
        message: response?.message || "Gửi lại OTP thất bại, vui lòng thử lại.",
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
              <span>VERIFY YOUR EMAIL</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Nhập mã OTP trong email
                <span className="block text-amber-400">Pickleball Smart</span>
                <span className="block text-sky-300">
                  Thời gian hiệu lực chỉ 1 phút
                </span>
              </h1>
              <p className="max-w-xl text-sm text-slate-400 sm:text-base">
                Kiểm tra hộp thư và nhập mã OTP gồm 6 chữ số để hoàn tất đăng ký.
                Nếu không thấy, vui lòng kiểm tra cả thư mục spam.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-slate-200 sm:text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Xác thực nhanh trong 1 phút
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Bảo mật chuẩn OTP 6 chữ số
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Email được dùng khi đăng ký
              </span>
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
                    Xác thực OTP
                  </h2>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Mã OTP còn hiệu lực trong {formattedCountdown}.
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>EMAIL DA DANG KY</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <Mail className="h-5 w-5" />
                            </span>
                            <Input
                              readOnly
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
                    name="otpInput"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                          <span className="h-px w-4 bg-slate-600" />
                          <span>MA OTP (6 SO)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1.5">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                              <KeyRound className="h-5 w-5" />
                            </span>
                            <Input
                              placeholder="123456"
                              inputMode="numeric"
                              maxLength={6}
                              className="h-10 rounded-4xl border-gray-600 pl-9 pr-3.5 text-gray-300"
                              {...field}
                            />
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
                    disabled={isPending || secondsLeft <= 0}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 bg-amber-400 text-black shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:bg-amber-300"
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending ? "Dang xac thuc..." : "Xac thuc OTP"}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={secondsLeft > 0 || isResending}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-slate-700 bg-transparent text-slate-200 hover:border-amber-400/60 hover:text-amber-200"
                  >
                    {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {secondsLeft > 0
                      ? `Gui lai OTP sau ${formattedCountdown}`
                      : "Gui lai OTP"}
                  </Button>

                  <div className="space-y-1.5 border-t border-slate-800/80 pt-4 text-[11px] text-slate-500">
                    <p>
                      Quay lai{" "}
                      <Link
                        href="/customerRegister"
                        className="cursor-pointer font-medium text-emerald-300 hover:text-emerald-200"
                      >
                        Dang ky
                      </Link>
                      {" "}hoac{" "}
                      <Link
                        href="/customerLogin"
                        className="cursor-pointer font-medium text-amber-300 hover:text-amber-200"
                      >
                        Dang nhap
                      </Link>
                    </p>
                    <p>OTP het han? Vui long bam gui lai de nhan ma moi.</p>
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

export default VerifyOtpClient;
