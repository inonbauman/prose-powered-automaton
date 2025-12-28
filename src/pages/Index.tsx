import { useState, useRef, useMemo } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseDeliveries, DeliveryData } from "@/utils/parseDeliveries";
import DeliveryPage from "@/components/DeliveryPage";
import PrintablePages from "@/components/PrintablePages";
import { Printer, Trash2, FileText, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ecosuppLogo from "@/assets/ecosupp-logo.png";

interface DuplicateGroup {
  name: string;
  phone: string;
  indices: number[];
}

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const printRef = useRef<HTMLDivElement>(null);

  // Find duplicates (same name AND phone)
  const duplicates = useMemo(() => {
    const groups: Map<string, number[]> = new Map();
    
    deliveries.forEach((delivery, index) => {
      const key = `${delivery.name.trim().toLowerCase()}|${delivery.phone.replace(/\D/g, '')}`;
      const existing = groups.get(key) || [];
      existing.push(index + 1);
      groups.set(key, existing);
    });

    const duplicateGroups: DuplicateGroup[] = [];
    groups.forEach((indices, key) => {
      if (indices.length > 1) {
        const [name, phone] = key.split('|');
        duplicateGroups.push({ 
          name: deliveries[indices[0] - 1].name, 
          phone: deliveries[indices[0] - 1].phone, 
          indices 
        });
      }
    });

    return duplicateGroups;
  }, [deliveries]);

  const handleParse = () => {
    const parsed = parseDeliveries(inputText);
    if (parsed.length === 0) {
      toast.error("לא נמצאו משלוחים בטקסט", {
        description: "וודא שהטקסט מוקף במרכאות",
      });
      return;
    }
    setDeliveries(parsed);
    toast.success(`נמצאו ${parsed.length} משלוחים`);
  };

  const handleClear = () => {
    setInputText("");
    setDeliveries([]);
    toast.info("הנתונים נוקו");
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "משלוחים",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 no-print">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">מחולל תוויות משלוח</h1>
              <p className="text-sm text-muted-foreground">הדבק טקסט משלוחים וצור תוויות להדפסה</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 no-print">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                הדבק טקסט משלוחים
              </h2>
              <span className="text-sm text-muted-foreground">
                כל משלוח צריך להיות מוקף במרכאות
              </span>
            </div>
            
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`"שם מלא\nכתובת\nעיר\nטלפון\nמידע נוסף"`}
              className="min-h-[300px] font-mono text-sm bg-card resize-none"
              dir="rtl"
            />
            
            <div className="flex gap-3">
              <Button onClick={handleParse} className="flex-1">
                <FileText className="w-4 h-4 ml-2" />
                צור תוויות
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <Trash2 className="w-4 h-4 ml-2" />
                נקה
              </Button>
            </div>
          </section>

          {/* Preview Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                תצוגה מקדימה
                {deliveries.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({deliveries.length} תוויות)
                  </span>
                )}
              </h2>
              {deliveries.length > 0 && (
                <Button onClick={() => handlePrint()} variant="secondary">
                  <Printer className="w-4 h-4 ml-2" />
                  הדפס
                </Button>
              )}
            </div>
            
            {deliveries.length === 0 ? (
              <div className="bg-muted/50 rounded-lg p-12 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">הדבק טקסט משלוחים ולחץ על "צור תוויות"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Duplicates Warning */}
                {duplicates.length > 0 && (
                  <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4">
                    <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>אזהרה: נמצאו משלוחים כפולים!</span>
                    </div>
                    <ul className="space-y-1 text-sm">
                      {duplicates.map((dup, i) => (
                        <li key={i} className="text-destructive">
                          <strong>{dup.name}</strong> ({dup.phone}) - מופיע במשלוחים: {dup.indices.join(', ')}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-2">
                      כדאי לבדוק שאלו לא הזמנות כפולות. ההדפסה תמשיך כרגיל.
                    </p>
                  </div>
                )}
                
                <div className="grid gap-6 max-h-[600px] overflow-y-auto p-2">
                  {deliveries.map((delivery, index) => (
                    <DeliveryPage key={index} {...delivery} logo={ecosuppLogo} />
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Printable area - visually hidden but rendered */}
      <div className="fixed left-[-9999px] top-0 print:static print:left-0">
        <PrintablePages ref={printRef} deliveries={deliveries} logo={ecosuppLogo} />
      </div>
    </div>
  );
};

export default Index;
