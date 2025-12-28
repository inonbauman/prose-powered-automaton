interface DeliveryPageProps {
  name: string;
  address: string;
  city: string;
  phone: string;
  additionalInfo?: string;
  logo?: string | null;
}

const DeliveryPage = ({ name, address, city, phone, additionalInfo, logo }: DeliveryPageProps) => {
  return (
    <div className="delivery-page flex flex-col rounded-lg overflow-hidden shadow-lg animate-scale-in border-2 border-foreground bg-card">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b-2 border-foreground">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-foreground">חישלחויות</h1>
          {logo && (
            <img 
              src={logo} 
              alt="לוגו" 
              className="h-10 w-auto object-contain grayscale contrast-200 brightness-50"
            />
          )}
        </div>
        <div className="mt-2 p-2 border-2 border-foreground bg-muted/30">
          <p className="text-lg font-bold text-foreground">משלוח עבור: {name}</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Address */}
          <div>
            <p className="text-sm font-bold mb-1 text-foreground">כתובת:</p>
            <p className="text-lg font-semibold leading-relaxed text-foreground">{address}</p>
            <p className="text-lg text-foreground">{city}</p>
          </div>
          
          {/* Phone */}
          <div>
            <p className="text-sm font-bold mb-1 text-foreground">טלפון:</p>
            <p className="text-xl font-black tracking-wide text-foreground" dir="ltr">{phone}</p>
          </div>
        </div>
        
        {/* Additional Info */}
        {additionalInfo && (
          <div className="mt-3 pt-3 border-t-2 border-foreground">
            <p className="text-sm text-foreground leading-relaxed">{additionalInfo}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
