
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileQuestionIcon, ArrowLeftIcon, HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // If there is history, go back. Otherwise fallback to dashboard handled naturally by React Router or user can just click the primary button
    navigate(-1);
  };

  const helpfulLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Giao dịch", path: "/transactions" },
    { label: "Ngân sách", path: "/budgets" },
    { label: "Mục tiêu", path: "/savings" },
    { label: "AI Insights", path: "/insights" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFEFC] flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-[560px] mx-auto text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#F7F6F3] rounded-2xl flex items-center justify-center border border-[#E8E7E5] text-[#37352F]">
            <FileQuestionIcon className="w-8 h-8" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#37352F] mb-3">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-[#37352F] mb-4">
          Không tìm thấy trang
        </h2>

        <p className="text-[#5A5A57] mb-10 text-base max-w-md mx-auto leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Bạn có thể quay lại Dashboard hoặc trở về trang trước để tiếp tục quản lý tài chính.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Button 
            className="w-full sm:w-auto bg-[#37352F] hover:bg-[#2F2D28] text-white" 
            asChild
          >
            <Link to="/dashboard">
              <HomeIcon className="w-4 h-4 mr-2" />
              Về Dashboard
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto bg-white border-[#E8E7E5] text-[#37352F] hover:bg-[#F7F6F3]"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 text-[#9B9A97]" />
            Quay lại
          </Button>
        </div>

        <div className="pt-8 border-t border-[#E8E7E5]">
          <p className="text-sm font-medium text-[#9B9A97] mb-4">
            Có thể bạn đang tìm:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {helpfulLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-1.5 text-sm text-[#5A5A57] bg-[#F7F6F3] hover:bg-[#E8E7E5] transition-colors rounded-md border border-[#E8E7E5] inline-flex items-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFoundPage;
