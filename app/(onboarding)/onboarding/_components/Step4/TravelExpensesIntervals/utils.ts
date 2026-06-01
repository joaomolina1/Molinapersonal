export type TravelExpenses = {
  from_billing: boolean;
  country: string;
  street1: string;
  street2: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  intervals: TravelExpenseInterval[];
};

export type TravelExpenseInterval = {
  id: string;
  from: number;
  to: number;
  price: number;
};
