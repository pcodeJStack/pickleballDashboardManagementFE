import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/commo/ReactQueryProvider";
import { ToastContainer } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pickleball Smart Dashboard",
  description:
    "Bảng điều khiển quản trị Pickleball: Quản lý lịch sân, ca chơi và báo cáo doanh thu tập trung cho câu lạc bộ.",
  icons: {
    icon: "/icons/pickleballLogo.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ReactQueryProvider>{children}</ReactQueryProvider> <ToastContainer /></body>
    </html>
  );
}
