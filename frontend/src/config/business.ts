export const businessConfig = {
  name: 'Espacios MDP',
  tagline: 'Espacios profesionales por hora en Mar del Plata',
  address: 'Rivadavia 3174, Mar del Plata, Buenos Aires',
  whatsapp: import.meta.env.VITE_BUSINESS_WHATSAPP || '5492235196273',
  email: import.meta.env.VITE_BUSINESS_EMAIL || 'moraessantiago@gmail.com',
  googleMapsUrl: 'https://maps.app.goo.gl/LaQBuUarobitvbP47',
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${businessConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
