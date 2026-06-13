import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata = {
  title: "Đăng nhập CMS",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <AdminLoginForm />
    </div>
  );
}
