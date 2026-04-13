const LeftHeroSection = () => {
  return (
    <div className="space-y-8 pb-motion-fade-up">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span>NỀN TẢNG QUẢN TRỊ PICKLEBALL</span>
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
          Hệ thống quản trị Pickleball
          <span className="block text-amber-400">Smart Dashboard</span>
          <span className="block text-sky-300">
            Lịch sân, vận hành & báo cáo doanh thu
          </span>
        </h1>
        <p className="max-w-xl text-sm sm:text-base text-slate-400">
          Tập trung toàn bộ dữ liệu đặt sân, lịch ca và doanh thu trên một bảng
          điều khiển trực quan, hỗ trợ ban quản lý ra quyết định nhanh hơn.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-200">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-700/80">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Quản lý lịch & ca sân
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-700/80">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Báo cáo doanh thu & công nợ
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 border border-slate-700/80">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
          Quyền truy cập phân tầng cho quản lý
        </span>
      </div>

      <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
            PB
          </span>
          <div>
            <p className="font-medium text-slate-200">
              Bảng điều khiển Pickleball
            </p>
            <p>Trung tâm điều hành cho câu lạc bộ</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftHeroSection;
