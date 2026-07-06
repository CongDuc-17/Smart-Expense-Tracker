
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-[560px] mx-auto text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border border-border text-foreground">
            <FileQuestionIcon className="w-8 h-8" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Không tìm thấy trang
        </h2>

        <p className="text-muted-foreground mb-10 text-base max-w-md mx-auto leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Bạn có thể quay lại Dashboard hoặc trở về trang trước để tiếp tục quản lý tài chính.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
          <Button 
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground" 
            asChild
          >
            <Link to="/dashboard">
              <HomeIcon className="w-4 h-4 mr-2" />
              Về Dashboard
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto bg-card border-border text-foreground hover:bg-muted"
            onClick={handleGoBack}
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2 text-muted-foreground" />
            Quay lại
          </Button>
        </div>

        <div className="pt-8 border-t border-border">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Có thể bạn đang tìm:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {helpfulLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="px-3 py-1.5 text-sm text-muted-foreground bg-muted hover:bg-muted/80 transition-colors rounded-md border border-border inline-flex items-center"
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
