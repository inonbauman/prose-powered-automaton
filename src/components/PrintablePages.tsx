import { forwardRef } from "react";
import { DeliveryData } from "@/utils/parseDeliveries";

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
            className="delivery-page flex flex-col overflow-hidden border-2 border-black"
            style={{ pageBreakAfter: 'always' }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b-2 border-black">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black">חישלחויות</h1>
                {logo && (
                  <img 
                    src={logo} 
                    alt="לוגו" 
                    className="h-10 w-auto object-contain grayscale contrast-200 brightness-50"
                  />
                )}
              </div>
              <div className="mt-2 p-2 border-2 border-black bg-gray-100">
                <p className="text-lg font-bold">משלוח עבור: {delivery.name}</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold mb-1">כתובת:</p>
                  <p className="text-lg font-semibold leading-relaxed">{delivery.address}</p>
                  <p className="text-lg">{delivery.city}</p>
                </div>
                
                <div>
                  <p className="text-sm font-bold mb-1">טלפון:</p>
                  <p className="text-xl font-black tracking-wide" dir="ltr">{delivery.phone}</p>
                </div>
              </div>
              
              {delivery.additionalInfo && (
                <div className="mt-3 pt-3 border-t-2 border-black">
                  <p className="text-sm leading-relaxed">{delivery.additionalInfo}</p>
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
