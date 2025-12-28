import { forwardRef } from "react";
import DeliveryPage from "./DeliveryPage";
import { DeliveryData } from "@/utils/parseDeliveries";

interface PrintablePagesProps {
  deliveries: DeliveryData[];
}

const PrintablePages = forwardRef<HTMLDivElement, PrintablePagesProps>(
  ({ deliveries }, ref) => {
    return (
      <div ref={ref} className="print:p-0">
        {deliveries.map((delivery, index) => (
          <div key={index} className="print:break-after-page">
            <DeliveryPage {...delivery} />
          </div>
        ))}
      </div>
    );
  }
);

PrintablePages.displayName = "PrintablePages";

export default PrintablePages;
