import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type FormData = {
  email: string;
  password: string;
};

type Props = {
  onSubmit: (data: FormData) => void;
};

const RightHeroSection = ({ onSubmit }: Props) => {
  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
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
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full bg-amber-400 text-black hover:bg-amber-300"
            >
              {form.formState.isSubmitting
                ? "Đang xác thực..."
                : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RightHeroSection;