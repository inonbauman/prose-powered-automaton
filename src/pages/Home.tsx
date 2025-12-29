import { Package, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8" dir="rtl">
      <h1 className="text-3xl font-bold text-foreground mb-12">מערכת ניהול משלוחים</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
        <Card 
          className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 bg-card border-2 hover:border-primary"
          onClick={() => navigate("/print-deliveries")}
        >
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">הדפסת משלוחים</h2>
            <p className="text-muted-foreground text-center mt-2">יצירת תוויות משלוח להדפסה</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 bg-card border-2 hover:border-primary"
          onClick={() => navigate("/end-of-day")}
        >
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
              <ClipboardCheck className="w-10 h-10 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">בדיקת משלוחים סוף יום</h2>
            <p className="text-muted-foreground text-center mt-2">סיכום וביקורת משלוחי היום</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
