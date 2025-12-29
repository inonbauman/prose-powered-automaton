import { ArrowRight, Package, Truck, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliveryRow {
  orderNumber: string;
  orderDate: string;
  destinationAddress: string;
  recipient: string;
  recipientPhone: string;
  barcode: string;
  quantity: string;
}

type CompanyType = "special" | "aliexpress" | null;

const EndOfDay = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<CompanyType>(null);
  const [rawData, setRawData] = useState("");
  const [parsedData, setParsedData] = useState<DeliveryRow[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);

  const parseSpecialDelivery = (data: string): DeliveryRow[] => {
    const lines = data.trim().split("\n");
    const results: DeliveryRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Split by tab
      const columns = line.split("\t");
      
      if (columns.length < 13) continue;

      // Special Delivery columns: A(0), F(5), H(7), J(9), K(10), M(12)
      // A = מספר הזמנה, F = תאריך הזמנה, H = כתובת יעד, J = נמען, K = טלפון נמען, M = ברקוד
      const row: DeliveryRow = {
        orderNumber: columns[0]?.trim() || "",
        orderDate: columns[5]?.trim() || "",
        destinationAddress: columns[7]?.trim() || "",
        recipient: columns[9]?.trim() || "",
        recipientPhone: columns[10]?.trim() || "",
        barcode: columns[12]?.trim() || "",
        quantity: columns[13]?.trim() || "1",
      };

      // Skip header rows or empty rows
      if (row.orderNumber && row.orderNumber !== "מספר הזמנה" && row.recipient) {
        results.push(row);
      }
    }

    return results;
  };

  const parseAliExpress = (data: string): DeliveryRow[] => {
    const lines = data.trim().split("\n");
    const results: DeliveryRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split("\t");
      
      if (columns.length < 10) continue;

      // AliExpress - based on the image, columns appear to be:
      // מס' משלוח, תאריך יצירה, שם יעד, עיר יעד, כתובת יעד מלאה, טלפון
      const row: DeliveryRow = {
        orderNumber: columns[0]?.trim() || "",
        orderDate: columns[1]?.trim() || "",
        recipient: columns[2]?.trim() || "",
        destinationAddress: `${columns[4]?.trim() || ""}, ${columns[3]?.trim() || ""}`,
        recipientPhone: columns[5]?.trim() || "",
        barcode: columns[6]?.trim() || "",
        quantity: columns[7]?.trim() || "1",
      };

      // Skip header rows or empty rows
      if (row.orderNumber && !row.orderNumber.includes("משלוח") && row.recipient) {
        results.push(row);
      }
    }

    return results;
  };

  const handleProcess = () => {
    if (!rawData.trim()) return;

    let parsed: DeliveryRow[] = [];
    
    if (selectedCompany === "special") {
      parsed = parseSpecialDelivery(rawData);
    } else if (selectedCompany === "aliexpress") {
      parsed = parseAliExpress(rawData);
    }

    setParsedData(parsed);
    setIsProcessed(true);
  };

  const handleReset = () => {
    setSelectedCompany(null);
    setRawData("");
    setParsedData([]);
    setIsProcessed(false);
  };

  const handleBack = () => {
    if (isProcessed) {
      setIsProcessed(false);
      setParsedData([]);
    } else if (selectedCompany) {
      setSelectedCompany(null);
      setRawData("");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">בדיקת משלוחים סוף יום</h1>
              <p className="text-sm text-muted-foreground">
                {selectedCompany === "special" && "ספיישל דילברי"}
                {selectedCompany === "aliexpress" && "אלי אקספרס"}
                {!selectedCompany && "בחר חברת משלוחים"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Company Selection */}
        {!selectedCompany && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary"
              onClick={() => setSelectedCompany("special")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-2">ספיישל דילברי</h2>
                <p className="text-sm text-muted-foreground">Special Delivery</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-orange-500"
              onClick={() => setSelectedCompany("aliexpress")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">אלי אקספרס</h2>
                <p className="text-sm text-muted-foreground">AliExpress</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data Input */}
        {selectedCompany && !isProcessed && (
          <div className="max-w-4xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  הדבק נתונים מאקסל
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedCompany === "special" && (
                    <>העתק והדבק את הנתונים מהאקסל. העמודות הנדרשות: מספר הזמנה, תאריך הזמנה, כתובת יעד, נמען, טלפון נמען, ברקוד</>
                  )}
                  {selectedCompany === "aliexpress" && (
                    <>העתק והדבק את הנתונים מהאקסל של אלי אקספרס</>
                  )}
                </p>
                <Textarea
                  placeholder="הדבק כאן את הנתונים מהאקסל..."
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  dir="ltr"
                />
                <div className="flex gap-3">
                  <Button onClick={handleProcess} disabled={!rawData.trim()}>
                    <CheckCircle className="w-4 h-4 ml-2" />
                    עבד נתונים
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    התחל מחדש
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {isProcessed && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">סה"כ {parsedData.length} משלוחים</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany === "special" ? "ספיישל דילברי" : "אלי אקספרס"}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={handleReset}>
                התחל מחדש
              </Button>
            </div>

            {parsedData.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">לא נמצאו נתונים תקינים</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-right">#</TableHead>
                          <TableHead className="text-right">מס' הזמנה</TableHead>
                          <TableHead className="text-right">תאריך</TableHead>
                          <TableHead className="text-right">נמען</TableHead>
                          <TableHead className="text-right">כתובת</TableHead>
                          <TableHead className="text-right">טלפון</TableHead>
                          <TableHead className="text-right">ברקוד</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>{row.orderNumber}</TableCell>
                            <TableCell>{row.orderDate}</TableCell>
                            <TableCell>{row.recipient}</TableCell>
                            <TableCell>{row.destinationAddress}</TableCell>
                            <TableCell dir="ltr" className="text-right">{row.recipientPhone}</TableCell>
                            <TableCell dir="ltr" className="text-right font-mono text-xs">{row.barcode}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default EndOfDay;
