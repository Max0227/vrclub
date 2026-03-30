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
    image: 'https://readdy.ai/api/search-image?query=young%20person%20wearing%20black%20VR%20headset%20Oculus%20Quest%202%20in%20dark%20gaming%20room%20with%20cyan%20neon%20lights%20glowing%20on%20face%20excited%20expression%20hands%20raised%20immersive%20virtual%20world&width=600&height=340&seq=vr30min_a1&orientation=landscape',
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
    image: 'https://readdy.ai/api/search-image?query=two%20people%20wearing%20VR%20headsets%20smiling%20happy%20dark%20neon%20gaming%20lounge%20cyan%20blue%20ambient%20glow%20modern%20interior%20friends%20enjoying%20virtual%20reality%20game%20together&width=600&height=340&seq=vr1hr_b2&orientation=landscape',
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
    image: 'https://readdy.ai/api/search-image?query=group%20four%20people%20wearing%20VR%20headsets%20together%20in%20dark%20neon%20gaming%20club%20room%20playing%20together%20friends%20excited%20cyan%20blue%20light%20modern%20gaming%20lounge&width=600&height=340&seq=vr4hr_g7&orientation=landscape',
  },
  {
    id: 4,
    title: 'MOZA 15 минут',
    subtitle: 'Racing Simulator',
    price: 300,
    birthdayPrice: 240,
    icon: 'ri-steering-2-line',
    color: '#ff006e',
    image: 'https://readdy.ai/api/search-image?query=close%20up%20racing%20steering%20wheel%20and%20hands%20gripping%20tight%20dramatic%20racing%20simulator%20setup%20dark%20cockpit%20motion%20blur%20speed%20neon%20red%20pink%20glow%20professional%20sim%20rig&width=600&height=340&seq=moza15_c3&orientation=landscape',
  },
  {
    id: 5,
    title: 'MOZA 30 минут',
    subtitle: 'Racing Simulator',
    price: 550,
    birthdayPrice: 440,
    icon: 'ri-steering-2-line',
    color: '#ff006e',
    image: 'https://readdy.ai/api/search-image?query=full%20racing%20simulator%20cockpit%20seat%20steering%20wheel%20pedals%20triple%20monitor%20setup%20race%20track%20on%20screen%20dark%20gaming%20room%20dramatic%20pink%20magenta%20lighting%20professional%20setup&width=600&height=340&seq=moza30_d4&orientation=landscape',
  },
  {
    id: 6,
    title: 'PlayStation 5',
    subtitle: '1 час',
    price: 350,
    birthdayPrice: 280,
    icon: 'ri-gamepad-line',
    color: '#9b4dff',
    image: 'https://readdy.ai/api/search-image?query=group%20friends%20playing%20video%20game%20console%20big%20TV%20screen%20dark%20lounge%20sofa%20couch%20purple%20violet%20neon%20ambient%20light%20laughing%20excited%20gaming%20together%20entertainment&width=600&height=340&seq=ps5_e5&orientation=landscape',
  },
  {
    id: 7,
    title: 'Весь клуб',
    subtitle: '1 час · до 12 человек',
    price: 4750,
    birthdayPrice: 3800,
    icon: 'ri-building-2-line',
    color: '#00f5ff',
    image: 'https://readdy.ai/api/search-image?query=spacious%20modern%20gaming%20club%20interior%20wide%20angle%20view%20multiple%20stations%20VR%20headsets%20racing%20simulators%20screens%20dark%20room%20colorful%20neon%20lights%20premium%20entertainment%20venue%20full%20room&width=600&height=340&seq=fullclub_f6&orientation=landscape',
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
