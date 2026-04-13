"use client";
import LeftHeroSection from "@/components/lefthero_section/page";
import RightHeroSection from "@/components/righthero_section/page";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
type LoginFormValues = {
  email: string;
  password: string;
};
const PARTICLE_COUNT = 80;

const LoginPage = () => {
  const {register,handleSubmit,formState: { errors, isSubmitting }} = useForm<LoginFormValues>();
  const onSubmit = async (data: LoginFormValues) => {
    console.log("login data", data);
  };

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, id) => {
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
      }),
    [],
  );

  return (
    <div className="relative min-h-screen bg-slate-550 text-slate-50 overflow-hidden pb-grid-bg">
      {/* background glow */}
      <div className="pointer-events-none absolute inset-0 bg-black" />

      {/* dust particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
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
        <div className="mx-auto w-full max-w-[1000px] grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
          {/* Left hero section */}
          <LeftHeroSection/>
         
          {/* Right login card */}
          <RightHeroSection register={register} errors={errors} isSubmitting={isSubmitting} onSubmit={onSubmit} handleSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
