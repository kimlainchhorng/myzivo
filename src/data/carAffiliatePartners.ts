// Car rental affiliate partner configuration for booking redirects
export interface CarAffiliatePartner {
  id: string;
  name: string;
  logo: string;
  baseUrl: string;
  urlTemplate: (params: CarAffiliateParams) => string;
  priority: number;
  commissionRate: string;
  features: string[];
  color: string;
}

export interface CarAffiliateParams {
  pickupLocation: string;
  pickupDate?: string; // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  pickupTime?: string; // HH:MM
  returnTime?: string; // HH:MM
  driverAge?: number;
}

export const carAffiliatePartners: CarAffiliatePartner[] = [
  {
    id: 'rentalcars',
    name: 'Rentalcars.com',
    logo: '🚗',
    baseUrl: 'https://www.rentalcars.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate, pickupTime, returnTime }) => {
      const params = new URLSearchParams();
      params.set('searchQuery', pickupLocation);
      if (pickupDate) params.set('puDay', pickupDate.split('-')[2]);
      if (pickupDate) params.set('puMonth', pickupDate.split('-')[1]);
      if (pickupDate) params.set('puYear', pickupDate.split('-')[0]);
      if (returnDate) params.set('doDay', returnDate.split('-')[2]);
      if (returnDate) params.set('doMonth', returnDate.split('-')[1]);
      if (returnDate) params.set('doYear', returnDate.split('-')[0]);
      if (pickupTime) params.set('puHour', pickupTime.split(':')[0]);
      if (returnTime) params.set('doHour', returnTime.split(':')[0]);
      return `https://www.rentalcars.com/SearchResults.do?${params.toString()}`;
    },
    priority: 100,
    commissionRate: 'Up to 7%',
    features: ['Free cancellation', 'No hidden fees', 'Best price guarantee'],
    color: 'bg-orange-500'
  },
  {
    id: 'kayak_cars',
    name: 'Kayak Cars',
    logo: '🛫',
    baseUrl: 'https://www.kayak.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate }) => {
      const pickup = pickupDate || 'flexible';
      const returnD = returnDate || 'flexible';
      return `https://www.kayak.com/cars/${encodeURIComponent(pickupLocation)}/${pickup}/${returnD}`;
    },
    priority: 95,
    commissionRate: 'Competitive',
    features: ['Compare all providers', 'Price forecast', 'No booking fees'],
    color: 'bg-orange-600'
  },
  {
    id: 'expedia_cars',
    name: 'Expedia Cars',
    logo: '🌐',
    baseUrl: 'https://www.expedia.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate, pickupTime, returnTime }) => {
      const params = new URLSearchParams();
      params.set('locn', pickupLocation);
      if (pickupDate) params.set('date1', pickupDate);
      if (returnDate) params.set('date2', returnDate);
      if (pickupTime) params.set('time1', pickupTime);
      if (returnTime) params.set('time2', returnTime);
      return `https://www.expedia.com/Cars?${params.toString()}`;
    },
    priority: 90,
    commissionRate: 'Competitive',
    features: ['Bundle with flight', 'Member discounts', 'Free cancellation'],
    color: 'bg-yellow-500'
  },
  {
    id: 'priceline_cars',
    name: 'Priceline Cars',
    logo: '💰',
    baseUrl: 'https://www.priceline.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate }) => {
      return `https://www.priceline.com/drive/at/${encodeURIComponent(pickupLocation)}/from/${pickupDate || 'flexible'}/to/${returnDate || 'flexible'}`;
    },
    priority: 85,
    commissionRate: 'Competitive',
    features: ['Express deals', 'VIP access', 'Price match'],
    color: 'bg-blue-500'
  },
  {
    id: 'discovercars',
    name: 'DiscoverCars',
    logo: '🔍',
    baseUrl: 'https://www.discovercars.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate, driverAge }) => {
      const params = new URLSearchParams();
      params.set('location', pickupLocation);
      if (pickupDate) params.set('pickup_date', pickupDate);
      if (returnDate) params.set('return_date', returnDate);
      if (driverAge) params.set('driver_age', String(driverAge));
      return `https://www.discovercars.com/search?${params.toString()}`;
    },
    priority: 80,
    commissionRate: 'Up to 70%',
    features: ['Full insurance included', 'No hidden fees', 'Best price'],
    color: 'bg-green-500'
  },
  {
    id: 'autoeurope',
    name: 'Auto Europe',
    logo: '🚙',
    baseUrl: 'https://www.autoeurope.com',
    urlTemplate: ({ pickupLocation, pickupDate, returnDate }) => {
      const params = new URLSearchParams();
      params.set('pickup', pickupLocation);
      if (pickupDate) params.set('pickupDate', pickupDate);
      if (returnDate) params.set('returnDate', returnDate);
      return `https://www.autoeurope.com/go/booking/?${params.toString()}`;
    },
    priority: 75,
    commissionRate: 'Competitive',
    features: ['Price match', 'No change fees', '24/7 support'],
    color: 'bg-blue-700'
  },
];

export function getCarAffiliateUrl(
  partnerId: string,
  params: CarAffiliateParams
): string {
  const partner = carAffiliatePartners.find(p => p.id === partnerId);
  if (!partner) {
    return carAffiliatePartners[0].urlTemplate(params);
  }
  return partner.urlTemplate(params);
}

export function getTopCarPartners(limit: number = 6): CarAffiliatePartner[] {
  return carAffiliatePartners
    .sort((a, b) => b.priority - a.priority)
    .slice(0, limit);
}
