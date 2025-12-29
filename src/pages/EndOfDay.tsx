import { ArrowRight, Package, Truck, Upload, CheckCircle, AlertCircle, Download, Copy, FileUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyType>(null);
  const [rawData, setRawData] = useState("");
  const [parsedData, setParsedData] = useState<DeliveryRow[]>([]);
  const [isProcessed, setIsProcessed] = useState(false);

  const parseSpecialDelivery = (data: string): DeliveryRow[] => {
    const lines = data.trim().split("\n");
    const results: DeliveryRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const columns = line.split("\t");
      
      if (columns.length < 13) continue;

      // Special Delivery columns: A(0), F(5), H(7), J(9), K(10), M(12)
      const row: DeliveryRow = {
        orderNumber: columns[0]?.trim() || "",
        orderDate: columns[5]?.trim() || "",
        destinationAddress: columns[7]?.trim() || "",
        recipient: columns[9]?.trim() || "",
        recipientPhone: columns[10]?.trim() || "",
        barcode: columns[12]?.trim() || "",
        quantity: columns[13]?.trim() || "1",
      };

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
      
      if (columns.length < 20) continue;

      // AliExpress - after deletions, remaining columns are from original indices:
      // 2 = מס' משלוח, 4 = תאריך קליטה, 10 = לקוח יעד, 11 = כתובת יעד, 12 = יישוב יעד, 19 = סטטוס
      const row: DeliveryRow = {
        orderNumber: columns[2]?.trim() || "",
        orderDate: columns[4]?.trim() || "",
        recipient: columns[10]?.trim() || "",
        destinationAddress: `${columns[11]?.trim() || ""}, ${columns[12]?.trim() || ""}`,
        recipientPhone: "", // לא קיים בנתוני אלי אקספרס
        barcode: "", // לא קיים בנתוני אלי אקספרס
        quantity: "1",
      };

      // Skip header rows or empty rows
      if (row.orderNumber && !row.orderNumber.includes("משלוח") && row.recipient) {
        results.push(row);
      }
    }

    return results;
  };

  const parseFromExcelData = (data: string[][]) => {
    const results: DeliveryRow[] = [];

    for (let i = 0; i < data.length; i++) {
      const columns = data[i];
      
      if (selectedCompany === "special") {
        if (columns.length < 13) continue;
        
        const row: DeliveryRow = {
          orderNumber: columns[0]?.toString().trim() || "",
          orderDate: columns[5]?.toString().trim() || "",
          destinationAddress: columns[7]?.toString().trim() || "",
          recipient: columns[9]?.toString().trim() || "",
          recipientPhone: columns[10]?.toString().trim() || "",
          barcode: columns[12]?.toString().trim() || "",
          quantity: columns[13]?.toString().trim() || "1",
        };

        if (row.orderNumber && row.orderNumber !== "מספר הזמנה" && row.recipient) {
          results.push(row);
        }
      } else if (selectedCompany === "aliexpress") {
        if (columns.length < 20) continue;

        // AliExpress - original indices: 2, 4, 10, 11, 12, 19
        const row: DeliveryRow = {
          orderNumber: columns[2]?.toString().trim() || "",
          orderDate: columns[4]?.toString().trim() || "",
          recipient: columns[10]?.toString().trim() || "",
          destinationAddress: `${columns[11]?.toString().trim() || ""}, ${columns[12]?.toString().trim() || ""}`,
          recipientPhone: "",
          barcode: "",
          quantity: "1",
        };

        if (row.orderNumber && !row.orderNumber.includes("משלוח") && row.recipient) {
          results.push(row);
        }
      }
    }

    return results;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');

    if (isCSV) {
      // For CSV files, try to detect encoding and read as text first
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const bytes = new Uint8Array(arrayBuffer);
          
          // Check for UTF-16 LE BOM (FF FE)
          let text: string;
          if (bytes[0] === 0xFF && bytes[1] === 0xFE) {
            // UTF-16 LE
            const decoder = new TextDecoder('utf-16le');
            text = decoder.decode(arrayBuffer);
          } else if (bytes[0] === 0xFE && bytes[1] === 0xFF) {
            // UTF-16 BE
            const decoder = new TextDecoder('utf-16be');
            text = decoder.decode(arrayBuffer);
          } else {
            // Try UTF-8
            const decoder = new TextDecoder('utf-8');
            text = decoder.decode(arrayBuffer);
          }

          // Parse CSV text - split by newlines and tabs
          const lines = text.trim().split(/\r?\n/);
          const jsonData: string[][] = lines.map(line => line.split('\t'));
          
          const parsed = parseFromExcelData(jsonData);
          setParsedData(parsed);
          setIsProcessed(true);
          
          toast({
            title: "הקובץ נטען בהצלחה",
            description: `נמצאו ${parsed.length} משלוחים`,
          });
        } catch (error) {
          console.error("CSV parse error:", error);
          toast({
            title: "שגיאה בטעינת הקובץ",
            description: "אנא ודא שהקובץ בפורמט CSV תקין",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle Excel files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
          
          const parsed = parseFromExcelData(jsonData);
          setParsedData(parsed);
          setIsProcessed(true);
          
          toast({
            title: "הקובץ נטען בהצלחה",
            description: `נמצאו ${parsed.length} משלוחים`,
          });
        } catch (error) {
          console.error("Excel parse error:", error);
          toast({
            title: "שגיאה בטעינת הקובץ",
            description: "אנא ודא שהקובץ בפורמט Excel תקין",
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleDownloadExcel = () => {
    const today = new Date().toLocaleDateString("he-IL");
    const dayName = new Date().toLocaleDateString("he-IL", { weekday: "long" });
    
    const numRows = parsedData.length;
    const summaryRow = {
      "ברקוד": dayName,
      "טלפון": today,
      "כתובת יעד": "",
      "שם יעד": "",
      "תאריך יצירה": { f: `COUNTA(A3:A${numRows + 2})` },
      "מס' משלוח": `סה"כ משלוחים`,
    };

    const dataRows = parsedData.map((row) => ({
      "ברקוד": row.barcode,
      "טלפון": row.recipientPhone,
      "כתובת יעד": row.destinationAddress,
      "שם יעד": row.recipient,
      "תאריך יצירה": row.orderDate,
      "מס' משלוח": row.orderNumber,
    }));

    const exportData = [summaryRow, ...dataRows];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "משלוחים");
    
    const companyName = selectedCompany === "special" ? "ספיישל" : "אלי_אקספרס";
    const date = new Date().toLocaleDateString("he-IL").replace(/\./g, "-");
    XLSX.writeFile(workbook, `בדיקת_משלוחים_${companyName}_${date}.xlsx`);

    toast({
      title: "הקובץ הורד בהצלחה",
    });
  };

  const handleCopyToClipboard = () => {
    const today = new Date().toLocaleDateString("he-IL");
    const dayName = new Date().toLocaleDateString("he-IL", { weekday: "long" });
    
    // Summary row - day, date first; then count formula, label last
    const numRows = parsedData.length;
    const simpleFormula = `=COUNTA(INDIRECT("A"&ROW()+2&":A"&ROW()+${numRows + 1}))`;
    const summaryRow = [dayName, today, "", "", simpleFormula, `סה"כ משלוחים`];
    
    const headers = ["ברקוד", "טלפון", "כתובת יעד", "שם יעד", "תאריך יצירה", "מס' משלוח"];
    const rows = parsedData.map((row) => [
      row.barcode,
      row.recipientPhone,
      row.destinationAddress,
      row.recipient,
      row.orderDate,
      row.orderNumber,
    ]);

    const text = [summaryRow.join("\t"), headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "הועתק ללוח",
        description: "הנתונים הועתקו בהצלחה",
      });
    });
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
                  הזנת נתונים
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <FileUp className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium mb-1">העלה קובץ Excel</p>
                    <p className="text-xs text-muted-foreground">או גרור קובץ לכאן</p>
                  </label>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">או הדבק נתונים</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {selectedCompany === "special" && (
                      <>העתק והדבק את הנתונים מהאקסל. העמודות הנדרשות: A, F, H, J, K, M</>
                    )}
                    {selectedCompany === "aliexpress" && (
                      <>העתק והדבק את הנתונים מהאקסל של אלי אקספרס</>
                    )}
                  </p>
                  <Textarea
                    placeholder="הדבק כאן את הנתונים מהאקסל..."
                    value={rawData}
                    onChange={(e) => setRawData(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                    dir="ltr"
                  />
                </div>

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
            <div className="flex items-center justify-between flex-wrap gap-4">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  <Copy className="w-4 h-4 ml-2" />
                  העתק
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
                  <Download className="w-4 h-4 ml-2" />
                  הורד Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  התחל מחדש
                </Button>
              </div>
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
