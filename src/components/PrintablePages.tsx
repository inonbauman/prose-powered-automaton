import { forwardRef } from "react";
import { DeliveryData } from "@/utils/parseDeliveries";
import { Package } from "lucide-react";

interface PrintablePagesProps {
  deliveries: DeliveryData[];
  logo?: string | null;
}

const PrintablePages = forwardRef<HTMLDivElement, PrintablePagesProps>(
  ({ deliveries, logo }, ref) => {
    return (
      <div ref={ref}>
        {deliveries.map((delivery, index) => (
          <div 
            key={index} 
            className="delivery-page flex flex-col overflow-hidden"
            style={{ pageBreakAfter: 'always' }}
          >
            {/* Header */}
            <div className="delivery-header px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className="text-sm font-medium">משלוח עבור</span>
                </div>
                {logo && (
                  <img 
                    src={logo} 
                    alt="לוגו" 
                    className="h-8 w-auto object-contain bg-white/90 rounded px-2 py-1"
                  />
                )}
              </div>
              <h2 className="text-xl font-bold mt-1">{delivery.name}</h2>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between bg-white">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">כתובת</p>
                  <p className="text-sm font-semibold leading-relaxed">{delivery.address}</p>
                  <p className="text-sm text-gray-600">{delivery.city}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">טלפון</p>
                  <p className="text-base font-bold tracking-wide" dir="ltr">{delivery.phone}</p>
                </div>
              </div>
              
              {delivery.additionalInfo && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 leading-relaxed">{delivery.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

PrintablePages.displayName = "PrintablePages";

export default PrintablePages;
