export interface DeliveryData {
  name: string;
  address: string;
  city: string;
  phone: string;
  additionalInfo?: string;
}

export function parseDeliveries(text: string): DeliveryData[] {
  const deliveries: DeliveryData[] = [];
  
  // Match text between quotes
  const regex = /"([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const block = match[1].trim();
    const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length >= 4) {
      const name = lines[0];
      const address = lines[1];
      const city = lines[2];
      const phone = lines[3];
      
      // Additional info is everything after the phone line
      const additionalInfo = lines.slice(4).join(' ').trim() || undefined;
      
      deliveries.push({
        name,
        address,
        city,
        phone,
        additionalInfo
      });
    }
  }
  
  return deliveries;
}
