import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type FormData = {
  email: string;
  password: string;
};

type Props = {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  isSubmitting: boolean;
  onSubmit: (data: FormData) => void;
  handleSubmit: any;
};

const RightHeroSection = ({
  register,
  errors,
  isSubmitting,
  onSubmit,
  handleSubmit,
}: Props) => {
  return (
    <Card className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
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
            <h2 className="text-xl font-semibold">Đăng nhập quản trị</h2>
            <p className="text-sm text-muted-foreground">
              Xác thực để truy cập hệ thống Pickleball
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label>Email đăng nhập</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /[^\s@]+@[^\s@]+\.[^\s@]+/,
                  message: "Email không hợp lệ",
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              placeholder="Nhập mật khẩu"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Tối thiểu 6 ký tự",
                },
              })}
            />
            {errors.password && (
              <p className="text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" />
              Ghi nhớ đăng nhập
            </label>

            <button type="button" className="text-amber-400 hover:underline">
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-400 text-black hover:bg-amber-300"
          >
            {isSubmitting ? "Đang xác thực..." : "Đăng nhập"}
          </Button>

          {/* Footer */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <p>
              Chưa có tài khoản?{" "}
              <span className="text-amber-400 cursor-pointer">
                Liên hệ quản trị
              </span>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RightHeroSection;