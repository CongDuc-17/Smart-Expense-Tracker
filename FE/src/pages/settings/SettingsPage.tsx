
import { ProfileSection } from "@/features/users/components/ProfileSection";
import { PersonalInfoForm } from "@/features/users/components/PersonalInfoForm";
import { SecurityForm } from "@/features/users/components/SecurityForm";
import { useCurrentUser } from "@/features/users/hooks/useUser";
import { Loader2Icon } from "lucide-react";

export function SettingsPage() {
  const { isLoading, error } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2Icon className="w-8 h-8 animate-spin text-[#9B9A97]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-2 text-[#37352F]">
        <p>Đã xảy ra lỗi khi tải dữ liệu người dùng.</p>
        <p className="text-sm text-[#9B9A97]">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#37352F]">Cài đặt tài khoản</h1>
        <p className="text-sm text-[#9B9A97] mt-1">Quản lý thông tin cá nhân và bảo mật của bạn.</p>
      </div>

      <div className="space-y-6">
        <ProfileSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 items-start">
          <div className="space-y-6">
            <PersonalInfoForm />
            <SecurityForm />
          </div>
          
          <div className="hidden lg:block space-y-6">
            <div className="bg-white border border-[#E8E7E5] rounded-xl shadow-sm p-5">
              <h4 className="font-medium text-[#37352F] mb-2">Bảo vệ tài khoản</h4>
              <p className="text-xs text-[#5A5A57] leading-relaxed">
                Chúng tôi khuyên bạn nên sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm cả chữ hoa, số và ký tự đặc biệt để đảm bảo an toàn tuyệt đối cho tài khoản.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
