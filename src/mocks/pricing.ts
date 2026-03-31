export interface PriceItem {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  birthdayPrice: number;
  icon: string;
  color: string;
  popular?: boolean;
  image: string;
  bonus?: string;
}

export const pricingData: PriceItem[] = [
  {
    id: 1,
    title: 'VR 30 минут',
    subtitle: 'Oculus Quest 2',
    price: 400,
    birthdayPrice: 320,
    icon: 'ri-vr-glasses-line',
    color: '#00f5ff',
    bonus: '5 часов = 1 час в подарок (будни)',
    image: '/images/mocks/vr-30min.jpg',
  },
  {
    id: 2,
    title: 'VR 1 час',
    subtitle: 'Oculus Quest 2 · 1 шлем',
    price: 800,
    birthdayPrice: 640,
    icon: 'ri-vr-glasses-line',
    color: '#00f5ff',
    popular: true,
    bonus: '5 часов = 1 час в подарок (будни)',
    image: '/images/mocks/vr-1hour.jpg',
  },
  {
    id: 3,
    title: '4 VR 1 час',
    subtitle: 'Oculus Quest 2 · 4 шлема',
    price: 3200,
    birthdayPrice: 2560,
    icon: 'ri-vr-glasses-line',
    color: '#00f5ff',
    bonus: '5 часов = 1 час в подарок (будни)',
    image: '/images/mocks/vr-4hours.jpg',
  },
  {
    id: 4,
    title: 'MOZA 15 минут',
    subtitle: 'Racing Simulator',
    price: 300,
    birthdayPrice: 240,
    icon: 'ri-steering-2-line',
    color: '#ff006e',
    image: '/images/mocks/moza-15min.jpg',
  },
  {
    id: 5,
    title: 'MOZA 30 минут',
    subtitle: 'Racing Simulator',
    price: 550,
    birthdayPrice: 440,
    icon: 'ri-steering-2-line',
    color: '#ff006e',
    image: '/images/mocks/moza-30min.jpg',
  },
  {
    id: 6,
    title: 'PlayStation 5',
    subtitle: '1 час',
    price: 350,
    birthdayPrice: 280,
    icon: 'ri-gamepad-line',
    color: '#9b4dff',
    image: '/images/mocks/ps5.jpg',
  },
  {
    id: 7,
    title: 'Весь клуб',
    subtitle: '1 час · до 12 человек',
    price: 4750,
    birthdayPrice: 3800,
    icon: 'ri-building-2-line',
    color: '#00f5ff',
    image: '/images/mocks/club-full.jpg',
  },
];

export interface Certificate {
  id: number;
  title: string;
  subtitle: string;
  price: number;
  icon: string;
  color: string;
}

export const certificates: Certificate[] = [
  { id: 1, title: 'VR 30 минут', subtitle: 'Oculus Quest 2', price: 400, icon: 'ri-vr-glasses-line', color: '#00f5ff' },
  { id: 2, title: 'VR 1 час', subtitle: 'Oculus Quest 2', price: 800, icon: 'ri-vr-glasses-line', color: '#ff006e' },
  { id: 3, title: 'PlayStation 5', subtitle: '1 час', price: 350, icon: 'ri-gamepad-line', color: '#9b4dff' },
  { id: 4, title: 'MOZA Racing', subtitle: '30 минут', price: 550, icon: 'ri-steering-2-line', color: '#00f5ff' },
];