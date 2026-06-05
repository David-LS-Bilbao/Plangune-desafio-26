export const mockPlans = [
  {
    id: 1,
    title: 'Guggenheim Txiki',
    location: 'Bilbao, Centro',
    category: 'Museos',
    price: 'Desde 12€',
    rating: 4.8,
    reviews: 124,
    distance: 'A 2km de ti',
    ageRange: '4-12 años',
    tags: ['Apto Carrito', 'Cambiador', 'Interior', 'Accesible'],
    isIdeal: true,
    subscriptionTier: 'Premium',
    description: 'El Museo Guggenheim Bilbao ofrece una experiencia única para los más pequeños con talleres creativos y recorridos diseñados específicamente para familias. Una oportunidad perfecta para introducir el arte contemporáneo de forma lúdica.',
    image: 'https://images.unsplash.com/photo-1543325164-9ed3ebc18221?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Parque de Doña Casilda',
    location: 'Bilbao, Indautxu',
    category: 'Parques',
    price: 'Gratis',
    rating: 4.6,
    reviews: 342,
    distance: 'A 800m de ti',
    ageRange: 'Todas las edades',
    tags: ['Aire Libre', 'Apto Carrito', 'Columpios', 'Mascotas', 'Accesible'],
    isIdeal: false,
    subscriptionTier: 'None',
    description: 'El pulmón verde del centro de Bilbao. Cuenta con amplias zonas de juegos infantiles, el estanque de los patos y mucho espacio para correr y disfrutar en familia.',
    image: 'https://images.unsplash.com/photo-1601000678887-b935cd4d7d0a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Taller de Cerámica Familiar',
    location: 'Bilbao, Casco Viejo',
    category: 'Talleres',
    price: '25€/familia',
    rating: 4.9,
    reviews: 86,
    distance: 'A 3km de ti',
    ageRange: '5+ años',
    tags: ['Creativo', 'Interior', 'A cubierto'],
    isIdeal: true,
    subscriptionTier: 'Pro',
    description: 'Ven a ensuciarte las manos en nuestro taller de cerámica de 2 horas. Padres e hijos crearán su propia taza o cuenco que luego hornearemos para vosotros.',
    image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Ruta Bosque de Oma',
    location: 'Kortezubi, Urdaibai',
    category: 'Naturaleza',
    price: 'Gratis',
    rating: 4.7,
    reviews: 210,
    distance: 'A 35km de ti',
    ageRange: '3+ años',
    tags: ['Naturaleza', 'Aire Libre', 'Senderismo'],
    isIdeal: false,
    subscriptionTier: 'Base',
    description: 'Una excursión mágica por el bosque pintado de Oma. Descubrid las formas geométricas y animales que se esconden entre los árboles en esta obra de arte al aire libre.',
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 5,
    title: 'Restaurante TxokoKids',
    location: 'Getxo',
    category: 'Restaurantes',
    price: '15-25€/persona',
    rating: 4.5,
    reviews: 156,
    distance: 'A 12km de ti',
    ageRange: '0-10 años',
    tags: ['Comida', 'Txikipark', 'Cambiador', 'Trona', 'Accesible', 'Mascotas'],
    isIdeal: true,
    subscriptionTier: 'Premium',
    description: 'El único restaurante de la zona donde los niños tienen su propio txikipark vigilado mientras los adultos disfrutan de nuestra carta de autor de comida tradicional vasca.',
    image: 'https://images.unsplash.com/photo-1519340241574-2cefa556ec4b?q=80&w=600&auto=format&fit=crop'
  }
];

export const MOCK_USERS = {
  family: {
    id: 'usr_1',
    role: 'family',
    name: 'Familia Agirre',
    email: 'familia.agirre@example.com',
    avatar: 'FA'
  },
  business: {
    id: 'usr_2',
    role: 'business',
    name: 'Gestión TxikiPark',
    email: 'info@txikipark.com',
    avatar: 'TP'
  },
  admin: {
    id: 'usr_3',
    role: 'admin',
    name: 'Admin Ecosistema',
    email: 'admin@txikiplan.com',
    avatar: 'AD'
  }
};
