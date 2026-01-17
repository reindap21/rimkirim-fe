export interface Rate {
  _id: string,
  assets: {
    flags: {
      destination: string;
      origin: string;
    }
  },
  eta: {
    days_from: string;
    days_to: string;
  },
  is_special_rate: boolean;
  pricing: {
    amount: number;
    currency: string;
    unit: string;
    minimum: {
      value: number;
      unit: string;
    }
  },
  provider: {
    _id: string,
    code: string,
    name: string,
    service: {
      code: string,
      name: string
    },
    branding: {
      logo: {
        url: string,
        alt: string
      }
    }
  },
  route: {
    origin: {
      country_code: string,
      country_name: string
    },
    destination: {
      country_code: string,
      country_name: string
    },
    is_direct: true
  }
  terms: string[]
}
