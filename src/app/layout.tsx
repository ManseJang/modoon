import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "약수초 일상수업공개 참관신청 시스템 모두ON",
  description:
    "약수초등학교의 일상수업공개 일정을 확인하고 참관 신청을 할 수 있는 서비스입니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "#3a2e22",
              color: "#fff",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#2f8f6f", secondary: "#fff" } },
            error: { iconTheme: { primary: "#d6455a", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
