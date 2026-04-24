import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useLogin } from "@/app/hooks/auth_hooks/useLoginMutation";
import { loginSchema } from "@/lib/validations/auth.schema";
import { Loader2, Lock, User } from "lucide-react";
type LoginFormValues = z.infer<typeof loginSchema>;
const RightHeroSection = () => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [hiddenPassword, setHiddenPassword] = useState(true);
  const { mutateAsync: login, isPending } = useLogin();
  const handleSubmit = async (data: LoginFormValues) => {
    try {
      await login({
        ...data,
        deviceId: crypto.randomUUID(),
        deviceInfo: navigator.userAgent,
      });
    } catch (error: any) {
      const res = error?.response?.data;
      if (res?.code === 400 && res?.data) {
        const fieldErrors = res.data;
        Object.entries(fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof LoginFormValues, {
            type: "server",
            message: message as string,
          });
        });
        return;
      }
      form.setError("root", {
        type: "server",
        message: res?.message || "Đăng nhập thất bại",
      });
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-750/90 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.9)]">
      {/* top accent bar */}
      <div className="pointer-events-none absolute inset-x-0 -top-px h-[3px] bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400" />

      <CardContent className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 animate-pulse">
            <span className="absolute inset-[-6px] rounded-full border border-amber-400/20" />
            <svg viewBox="0 0 24 24" className="h-6 w-6">
              <path
                d="M12 2a7 7 0 0 0-7 7v2.25a.75.75 0 0 0 1.5 0V9a5.5 5.5 0 0 1 11 0v2.75a.75.75 0 0 0 1.5 0V9a7 7 0 0 0-7-7Zm0 8.5A3.5 3.5 0 0 0 8.5 14v5a1.5 1.5 0 0 0 3 0v-3.75a.75.75 0 0 1 1.5 0V19a1.5 1.5 0 0 0 3 0v-5A3.5 3.5 0 0 0 12 10.5Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight">
              Đăng nhập quản trị
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Authentication required để truy cập bảng điều khiển Pickleball.
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Vui lòng nhập email",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400">
                    <span className="h-px w-4 bg-slate-600" />
                    <span>EMAIL</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative mt-1.5">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                        <User className="h-5 w-5" />
                      </span>
                      <Input
                        placeholder="admin@example.com"
                        className="pl-9 pr-3.5 h-10  rounded-4xl border-gray-600 text-gray-300"
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
              rules={{
                required: "Vui lòng nhập mật khẩu",
              }}
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
                        type={hiddenPassword ? "password" : "text"}
                        className="pl-9 pr-9 h-10  rounded-4xl border-gray-600 text-gray-300"
                        {...field}
                      />
                      <button
                        type="button"
                        aria-label={
                          hiddenPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                        }
                        className="absolute inset-y-0 cursor-pointer right-3 flex items-center text-slate-500 hover:text-slate-200"
                        onClick={() => setHiddenPassword((prev) => !prev)}
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                        >
                          {hiddenPassword ? (
                            <path
                              d="M4.21 3.39 2.8 4.8l2.06 2.06A10.92 10.92 0 0 0 1.5 12s2.73 7 10.5 7c1.97 0 3.63-.47 5.02-1.2l2.17 2.17 1.41-1.41L4.21 3.39ZM12 17.5C7.6 17.5 5.04 14.39 3.9 12a9.71 9.71 0 0 1 2.16-2.66l1.55 1.55A3.75 3.75 0 0 0 12 15.75c.62 0 1.21-.15 1.73-.41l1.74 1.74c-.88.28-1.86.42-2.97.42Zm0-9.25c.19 0 .38.02.56.05l2.93 2.93A3.74 3.74 0 0 0 12 8.25V8.5Z"
                              fill="currentColor"
                            />
                          ) : (
                            <path
                              d="M12 5c-5.5 0-9 5.5-9 7s3.5 7 9 7 9-5.5 9-7-3.5-7-9-7Zm0 11.5A4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 0 1 12 16.5Zm0-7A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z"
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

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <Checkbox className="h-3.5 w-3.5" />
                <span>Ghi nhớ phiên đăng nhập</span>
              </label>
              <button
                type="button"
                className="text-amber-300 hover:text-amber-200 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="inline-flex cursor-pointer h-10 w-full items-center justify-center gap-2 bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_30px_rgba(250,204,21,0.5)]"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

              {isPending ? "Đang xác thực..." : "Xác thực & Đăng nhập"}
            </Button>
            <div className="pt-4 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-500">
              <p>
                Chưa có tài khoản quản trị?{" "}
                <span className="text-amber-300 font-medium cursor-pointer hover:text-amber-200">
                  Liên hệ bộ phận IT hoặc quản lý để được cấp quyền.
                </span>
              </p>
              <p> Bảo mật: mã hóa AES-256 và xác thực hai lớp (2FA).</p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RightHeroSection;
