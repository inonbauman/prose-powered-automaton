import { Package } from "lucide-react";

interface DeliveryPageProps {
  name: string;
  address: string;
  city: string;
  phone: string;
  additionalInfo?: string;
}

const DeliveryPage = ({ name, address, city, phone, additionalInfo }: DeliveryPageProps) => {
  return (
    <div className="delivery-page flex flex-col rounded-lg overflow-hidden shadow-lg animate-scale-in">
      {/* Header */}
      <div className="delivery-header px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          <span className="text-sm font-medium">משלוח עבור</span>
        </div>
        <h2 className="text-xl font-bold mt-1 truncate">{name}</h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Address */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">כתובת</p>
            <p className="text-sm font-semibold leading-relaxed">{address}</p>
            <p className="text-sm text-muted-foreground">{city}</p>
          </div>
          
          {/* Phone */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-1">טלפון</p>
            <p className="text-base font-bold tracking-wide" dir="ltr">{phone}</p>
          </div>
        </div>
        
        {/* Additional Info */}
        {additionalInfo && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">{additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
