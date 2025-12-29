import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EndOfDay = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">בדיקת משלוחים סוף יום</h1>
              <p className="text-sm text-muted-foreground">סיכום וביקורת משלוחי היום</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="bg-muted/50 rounded-lg p-12 text-center">
          <p className="text-muted-foreground">עמוד זה בפיתוח</p>
        </div>
      </main>
    </div>
  );
};

export default EndOfDay;
