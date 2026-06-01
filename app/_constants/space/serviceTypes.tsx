import IconPacksFeaturesChildrenEntertainers from "@/_design_system/_icons/Packs/Features/Children/Entertainers.svg";
import IconPacksFeaturesServicesAudiovisual from "@/_design_system/_icons/Packs/Features/Services/Audiovisual.svg";
import IconPacksFeaturesServicesDecoration from "@/_design_system/_icons/Packs/Features/Services/Decoration.svg";
import IconSpacesCateringClientCatering from "@/_design_system/_icons/Spaces/Catering/ClientCatering.svg";
import IconSpacesFacilitiesDigitalTelevision from "@/_design_system/_icons/Spaces/Facilities/DigitalTelevision.svg";
import IconSpacesSoundCompleteSoundSystem from "@/_design_system/_icons/Spaces/Sound/CompleteSoundSystem";
import IconSpacesSoundDJEquipment from "@/_design_system/_icons/Spaces/Sound/DJEquipment.svg";

export const SERVICE_TYPES = [
  {
    id: "service-catering-drinks",
    label: "Catering e bebidas",
    icon: <IconSpacesCateringClientCatering />,
    categories: [
      {
        id: "service-catering-drinks-catering",
        label: "Catering",
        specifics: [
          {
            id: "service-catering-drinks-catering-finger-food",
            label: "Finger Food",
          },
          {
            id: "service-catering-drinks-catering-buffet",
            label: "Buffet",
          },
          {
            id: "service-catering-drinks-catering-served",
            label: "Servido",
          },
          {
            id: "service-catering-drinks-catering-station",
            label: "Station",
          },
        ],
        subCategories: [
          {
            id: "service-catering-drinks-catering-breakfast",
            label: "Peq. Almoço",
          },
          {
            id: "service-catering-drinks-catering-snack",
            label: "Lanche",
          },
          {
            id: "service-catering-drinks-catering-lunch",
            label: "Almoço",
          },
          {
            id: "service-catering-drinks-catering-dinner",
            label: "Jantar",
          },
          {
            id: "service-catering-drinks-catering-dinatoire-cocktail",
            label: "Cocktail Dinatoire",
          },
          {
            id: "service-catering-drinks-catering-cocktail",
            label: "Cocktail",
          },
          {
            id: "service-catering-drinks-catering-coffee-break",
            label: "Coffee Break",
          },
          {
            id: "service-catering-drinks-catering-brunch",
            label: "Brunch",
          },
          {
            id: "service-catering-drinks-catering-bar",
            label: "Bar",
          },
          {
            id: "service-catering-drinks-catering-supper",
            label: "Ceia",
          },
          {
            id: "service-catering-drinks-catering-welcome-coffee",
            label: "Welcome Coffee",
          },
          {
            id: "service-catering-drinks-catering-coffee-station",
            label: "Coffee Station",
          },
          {
            id: "service-catering-drinks-catering-sensory-experiences",
            label: "Experiências Sensoriais",
          },
          {
            id: "service-catering-drinks-catering-chef-at-home",
            label: "Chef ao Domicílio",
          },
        ],
      },
      {
        id: "service-catering-drinks-bar",
        label: "Bar",
        specifics: [
          {
            id: "service-catering-drinks-bar-open-bar",
            label: "Bar Aberto",
          },
          {
            id: "service-catering-drinks-bar-tokens",
            label: "Senhas",
          },
          {
            id: "service-catering-drinks-bar-per-person-quantity",
            label: "Quantidade por Pessoa",
          },
          {
            id: "service-catering-drinks-bar-consignation",
            label: "À consignação",
          },
        ],
        subCategories: [
          {
            id: "service-catering-drinks-bar-mixology-bar",
            label: "Bar de Mixologia",
          },
          {
            id: "service-catering-drinks-bar-classic-bar",
            label: "Bar Clássico",
          },
          {
            id: "service-catering-drinks-bar-self-service-bar",
            label: "Bar SelfService",
          },
          {
            id: "service-catering-drinks-bar-portable-mobile-bar",
            label: "Bar Portátil/Móvel",
          },
          {
            id: "service-catering-drinks-bar-themed-bar",
            label: "Bar Temático (Tiki Bar, Tropical, Gin, Vodka)",
          },
          {
            id: "service-catering-drinks-bar-wine-bar",
            label: "Bar de Vinhos",
          },
          {
            id: "service-catering-drinks-bar-coffee-tea-bar",
            label: "Bar de Cafés e Chás",
          },
          {
            id: "service-catering-drinks-bar-non-alcoholic-bar",
            label: "Bar sem Álcool",
          },
          {
            id: "service-catering-drinks-bar-beer-machine-at-home",
            label: "Máquina de Cerveja ao Domícilio",
          },
          {
            id: "service-catering-drinks-bar-bartender-service",
            label: "Serviço de Bartender",
          },
        ],
      },
      {
        id: "service-catering-drinks-food-trucks",
        label: "Food Trucks | Estruturas Amovíveis",
        specifics: [],
        subCategories: [
          {
            id: "service-catering-drinks-food-trucks-international-street-food",
            label: "Street Food Internacional",
          },
          {
            id: "service-catering-drinks-food-trucks-burgers-sandwiches",
            label: "Hambúrgueres e Sanduíches",
          },
          {
            id: "service-catering-drinks-food-trucks-desserts-sweets",
            label: "Doces e Sobremesas",
          },
          {
            id: "service-catering-drinks-food-trucks-portuguese-food",
            label: "Comida Portuguesa",
          },
          {
            id: "service-catering-drinks-food-trucks-healthy-natural-food",
            label: "Comida Saudável e Natural",
          },
          {
            id: "service-catering-drinks-food-trucks-drinks",
            label: "Bebidas",
          },
          {
            id: "service-catering-drinks-food-trucks-tasting-counter",
            label: "Balcão Degustação",
          },
          {
            id: "service-catering-drinks-food-trucks-ice-cream",
            label: "Gelataria",
          },
          {
            id: "service-catering-drinks-food-trucks-gastronomic-stations",
            label: "Estações Gastronómicas",
          },
          {
            id: "service-catering-drinks-food-trucks-show-cooking-live-chef",
            label: "ShowCooking & Chef ao Vivo",
          },
        ],
      },
      {
        id: "service-catering-drinks-cafeteria",
        label: "Cafetaria & Pastelaria",
        specifics: [],
        subCategories: [
          {
            id: "service-catering-drinks-cafeteria-specialty-coffee",
            label: "Cafés especiais (latte, cappuccino, cold brew)",
          },
          {
            id: "service-catering-drinks-cafeteria-teas-infusions",
            label: "Chás e infusões",
          },
          {
            id: "service-catering-drinks-cafeteria-cakes-tarts",
            label: "Bolos e tartes",
          },
          {
            id: "service-catering-drinks-cafeteria-portuguese-pastry",
            label: "Pastelaria portuguesa (Pasteis de nata, travesseiros)",
          },
          {
            id: "service-catering-drinks-cafeteria-miniatures-sweet-savory",
            label: "Miniaturas doces e salgadas",
          },
        ],
      },
      {
        id: "service-catering-drinks-take-away",
        label: "Refeições Prontas | Take Away",
        specifics: [
          {
            id: "service-catering-drinks-take-away-delivery",
            label: "Delivery",
          },
          {
            id: "service-catering-drinks-take-away-pickup",
            label: "Take Away",
          },
        ],
        subCategories: [
          {
            id: "service-catering-drinks-take-away-frozen-packaged-meals",
            label: "Refeições Embaladas Congeladas",
          },
          {
            id: "service-catering-drinks-take-away-fresh-packaged-meals",
            label: "Refeições Embaladas Frescas",
          },
          {
            id: "service-catering-drinks-take-away-ready-meals",
            label: "Refeições Prontas",
          },
        ],
      },
    ],
  },
  {
    id: "service-music-services",
    label: "Serviços de música",
    icon: <IconSpacesSoundDJEquipment />,
    categories: [
      {
        id: "service-music-services-soloists-instrumentalists",
        label: "Solistas & Instrumentistas",
        specifics: [],
        subCategories: [
          {
            id: "service-music-services-soloists-instrumentalists-solo-singer",
            label: "Cantor(a) a solo",
          },
          {
            id: "service-music-services-soloists-instrumentalists-fado-singer",
            label: "Fadista",
          },
          {
            id: "service-music-services-soloists-instrumentalists-saxophonist",
            label: "Saxofonista",
          },
          {
            id: "service-music-services-soloists-instrumentalists-violinist",
            label: "Violinista",
          },
          {
            id: "service-music-services-soloists-instrumentalists-pianist-keyboardist",
            label: "Pianista / Teclista",
          },
          {
            id: "service-music-services-soloists-instrumentalists-guitarist",
            label: "Guitarrista (clássico, elétrico, acústico)",
          },
          {
            id: "service-music-services-soloists-instrumentalists-percussionist",
            label: "Percussionista (Baterista, etc..)",
          },
        ],
      },
      {
        id: "service-music-services-dj-electronic",
        label: "DJ & Eletrónica",
        specifics: [],
        subCategories: [
          {
            id: "service-music-services-dj-electronic-commercial-party-dj",
            label: "DJ comercial / festas",
          },
          {
            id: "service-music-services-dj-electronic-chillout-lounge-dj",
            label: "DJ chill-out / lounge",
          },
          {
            id: "service-music-services-dj-electronic-electronic-music-dj",
            label: "DJ de música eletrónica (house, techno, trance)",
          },
          {
            id: "service-music-services-dj-electronic-vinyl-old-school-dj",
            label: "DJ de vinil / old school",
          },
          {
            id: "service-music-services-dj-electronic-live-instrument-dj",
            label: "DJ com saxofonista ou violinista ao vivo",
          },
          {
            id: "service-music-services-dj-electronic-vj-visual-projections",
            label: "VJ (video jockey) para projeções visuais sincronizadas",
          },
        ],
      },
      {
        id: "service-music-services-bands-musical-groups",
        label: "Bandas & Grupos Musicais",
        specifics: [],
        subCategories: [
          {
            id: "service-music-services-bands-musical-groups-pop-rock-band",
            label: "Banda pop/rock",
          },
          {
            id: "service-music-services-bands-musical-groups-jazz-blues-band",
            label: "Banda jazz/blues",
          },
          {
            id: "service-music-services-bands-musical-groups-covers-band",
            label: "Banda de covers",
          },
          {
            id: "service-music-services-bands-musical-groups-traditional-portuguese-band",
            label: "Banda tradicional portuguesa",
          },
          {
            id: "service-music-services-bands-musical-groups-latin-samba-band",
            label: "Banda de música latina/samba",
          },
          {
            id: "service-music-services-bands-musical-groups-classical-music-band",
            label: "Banda de música clássica",
          },
          {
            id: "service-music-services-bands-musical-groups-marches-fanfare-band",
            label: "Banda de marchas ou fanfarra",
          },
          {
            id: "service-music-services-bands-musical-groups-gospel",
            label: "Gospel",
          },
          {
            id: "service-music-services-bands-musical-groups-choir",
            label: "Coro",
          },
        ],
      },
      {
        id: "service-music-services-interactive-themed-performances",
        label: "Performances Interativas & Temáticas",
        specifics: [],
        subCategories: [
          {
            id: "service-music-services-interactive-themed-performances-african-kizomba-afrobeat",
            label: "Música africana / kizomba / afrobeat",
          },
          {
            id: "service-music-services-interactive-themed-performances-brazilian-samba-bossa-nova",
            label: "Música brasileira / samba / bossa nova",
          },
          {
            id: "service-music-services-interactive-themed-performances-latin-reggaeton-salsa",
            label: "Música latina / reggaeton / salsa",
          },
          {
            id: "service-music-services-interactive-themed-performances-oriental-indian-arabic",
            label: "Música oriental / indiana / árabe",
          },
          {
            id: "service-music-services-interactive-themed-performances-celtic-medieval-folk",
            label: "Música celta / medieval / folk",
          },
          {
            id: "service-music-services-interactive-themed-performances-karaoke",
            label: "Karaoke",
          },
        ],
      },
    ],
  },
  {
    id: "service-photography-videography",
    label: "Fotografia e vídeo",
    icon: <IconPacksFeaturesServicesAudiovisual />,
    categories: [
      {
        id: "service-photography-videography-photographer",
        label: "Fotógrafo",
        specifics: [],
        subCategories: [
          {
            id: "service-photography-videography-photographer-image-editing",
            label: "Edição de imagem",
          },
          {
            id: "service-photography-videography-photographer-lighting",
            label: "Iluminação",
          },
        ],
      },
      {
        id: "service-photography-videography-videographer",
        label: "Videógrafo",
        specifics: [],
        subCategories: [
          {
            id: "service-photography-videography-videographer-drone",
            label: "Drone",
          },
          {
            id: "service-photography-videography-videographer-video-editing",
            label: "Edição de vídeo",
          },
          {
            id: "service-photography-videography-videographer-delivery-time",
            label: "Prazo de Entrega",
          },
          {
            id: "service-photography-videography-videographer-lighting",
            label: "Iluminação",
          },
        ],
      },
      {
        id: "service-photography-videography-technology-immersive-experiences",
        label: "Tecnologia & Experiências Imersivas",
        specifics: [],
        subCategories: [
          {
            id: "service-photography-videography-technology-immersive-experiences-drone",
            label: "Drone",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-360-video",
            label: "Vídeo 360",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-time-lapse-hyperlapse",
            label: "Time-Lapse / Hyperlapse",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-photo-booths",
            label: "Cabines de Fotografia",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-360-video-booth",
            label: "Cabine 360º Vídeo",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-digital-games-simulators",
            label: "Jogos digitais e Simuladores",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-augmented-virtual-reality",
            label: "Realidade Aumentada / Virtual",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-holograms-3d-projections",
            label: "Hologramas e Projeções 3D",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-interactive-screens",
            label: "Ecrãs Interativos",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-animator-robots",
            label: "Robôs animadores",
          },
          {
            id: "service-photography-videography-technology-immersive-experiences-light-show",
            label: "Espetaculo de Luzes",
          },
        ],
      },
    ],
  },
  {
    id: "service-furniture-decoration",
    label: "Mobiliário & decoração",
    icon: <IconPacksFeaturesServicesDecoration />,
    categories: [
      {
        id: "service-furniture-decoration-decoration",
        label: "Decoração",
        specifics: [],
        subCategories: [
          {
            id: "service-furniture-decoration-decoration-flowers",
            label: "Flores",
          },
          {
            id: "service-furniture-decoration-decoration-decorative-pieces",
            label: "Peças Decorativas",
          },
          {
            id: "service-furniture-decoration-decoration-outdoor-pieces",
            label: "Peças para Exterior",
          },
          {
            id: "service-furniture-decoration-decoration-scenarios",
            label: "Cenários",
          },
          {
            id: "service-furniture-decoration-decoration-centerpieces",
            label: "Centros de Mesa",
          },
          {
            id: "service-furniture-decoration-decoration-rugs-runners",
            label: "Tapetes e Passadeiras",
          },
          {
            id: "service-furniture-decoration-decoration-mirrors-frames",
            label: "Espelhos e Molduras",
          },
          {
            id: "service-furniture-decoration-decoration-decorative-plants-trees",
            label: "Plantas e Árvores decorativas",
          },
          {
            id: "service-furniture-decoration-decoration-vertical-gardens",
            label: "Jardins Verticais",
          },
          {
            id: "service-furniture-decoration-decoration-balloons",
            label: "Balões",
          },
        ],
      },
      {
        id: "service-furniture-decoration-furniture",
        label: "Mobiliário",
        specifics: [],
        subCategories: [
          {
            id: "service-furniture-decoration-furniture-tables",
            label: "Mesas (dobráveis, empilháveis, banquetas, bancos corridos)",
          },
          {
            id: "service-furniture-decoration-furniture-chairs",
            label: "Cadeiras",
          },
          {
            id: "service-furniture-decoration-furniture-tablecloths",
            label: "Toalhas",
          },
          {
            id: "service-furniture-decoration-furniture-dishes-accessories",
            label: "Loiça & Acessórios",
          },
          {
            id: "service-furniture-decoration-furniture-sofas-poufs",
            label: "Sofás e Poufs (lounge, vintage, moderno)",
          },
          {
            id: "service-furniture-decoration-furniture-side-cocktail-tables",
            label: "Mesas de Apoio e de Cocktail",
          },
          {
            id: "service-furniture-decoration-furniture-counters",
            label: "Balcões",
          },
          {
            id: "service-furniture-decoration-furniture-support-furniture",
            label: "Móveis de Apoio",
          },
          {
            id: "service-furniture-decoration-furniture-benches",
            label: "Bancos",
          },
          {
            id: "service-furniture-decoration-furniture-chariots",
            label: "Charriots",
          },
          {
            id: "service-furniture-decoration-furniture-displays",
            label: "Expositores",
          },
          {
            id: "service-furniture-decoration-furniture-umbrellas",
            label: "Guarda-Sois",
          },
          {
            id: "service-furniture-decoration-furniture-pulpits",
            label: "Púlpitos",
          },
        ],
      },
      {
        id: "service-furniture-decoration-structures",
        label: "Estruturas",
        specifics: [],
        subCategories: [
          {
            id: "service-furniture-decoration-structures-tents",
            label: "Tendas",
          },
          {
            id: "service-furniture-decoration-structures-canopies",
            label: "Toldos",
          },
          {
            id: "service-furniture-decoration-structures-stages",
            label: "Palcos",
          },
          {
            id: "service-furniture-decoration-structures-portable-toilets",
            label: "WC Portáteis",
          },
          {
            id: "service-furniture-decoration-structures-dressing-rooms",
            label: "Camarins",
          },
          {
            id: "service-furniture-decoration-structures-dance-floors",
            label: "Pistas de Dança",
          },
          {
            id: "service-furniture-decoration-structures-portable-bars",
            label: "Bares Amovíveis",
          },
          {
            id: "service-furniture-decoration-structures-inflatables",
            label: "Insufláveis",
          },
          {
            id: "service-furniture-decoration-structures-trampolines",
            label: "Trampolins",
          },
          {
            id: "service-furniture-decoration-structures-pergolas",
            label: "Pérgulas",
          },
          {
            id: "service-furniture-decoration-structures-tensioned-structures",
            label: "Tensionáveis",
          },
          {
            id: "service-furniture-decoration-structures-rotating-stage",
            label: "Palco Rotativo",
          },
          {
            id: "service-furniture-decoration-structures-lifting-platform",
            label: "Plataforma Elevatória",
          },
          {
            id: "service-furniture-decoration-structures-scenarios",
            label: "Cenários",
          },
          {
            id: "service-furniture-decoration-structures-curtains",
            label: "Cortinas",
          },
          {
            id: "service-furniture-decoration-structures-tunnels",
            label: "Tuneis",
          },
          {
            id: "service-furniture-decoration-structures-barriers",
            label: "Barreiras",
          },
          {
            id: "service-furniture-decoration-structures-stalls",
            label: "Baias",
          },
          {
            id: "service-furniture-decoration-structures-air-conditioning",
            label: "Climatização",
          },
        ],
      },
      {
        id: "service-furniture-decoration-lighting",
        label: "Iluminação",
        specifics: [],
        subCategories: [
          {
            id: "service-furniture-decoration-lighting-decorative-lights",
            label: "Luzes Decorativas",
          },
          {
            id: "service-furniture-decoration-lighting-projectors-spotlights",
            label: "Projetores e Focos",
          },
          {
            id: "service-furniture-decoration-lighting-themed-lighting",
            label: "Iluminação temática",
          },
          {
            id: "service-furniture-decoration-lighting-light-up-letters",
            label: "Letras Luminosas",
          },
          {
            id: "service-furniture-decoration-lighting-candles-candelabras",
            label: "Velas & Candelabros",
          },
        ],
      },
    ],
  },
  {
    id: "service-animation-entertainment",
    label: "Animação & entretenimento",
    icon: <IconPacksFeaturesChildrenEntertainers />,
    categories: [
      {
        id: "service-animation-entertainment-kids",
        label: "Infantil",
        specifics: [],
        subCategories: [
          {
            id: "service-animation-entertainment-kids-clowns",
            label: "Palhaços",
          },
          {
            id: "service-animation-entertainment-kids-magicians-illusionists",
            label: "Mágicos / Ilusionista",
          },
          {
            id: "service-animation-entertainment-kids-storytellers",
            label: "Contador de histórias",
          },
          {
            id: "service-animation-entertainment-kids-educational-games",
            label: "Jogos Educativos",
          },
          {
            id: "service-animation-entertainment-kids-face-painting",
            label: "Pinturas Faciais",
          },
          {
            id: "service-animation-entertainment-kids-entertainers",
            label: "Animadores",
          },
          {
            id: "service-animation-entertainment-kids-babysitter",
            label: "Babysitter",
          },
        ],
      },
      {
        id: "service-animation-entertainment-artists",
        label: "Artistas",
        specifics: [],
        subCategories: [
          {
            id: "service-animation-entertainment-artists-comedian",
            label: "Humorista",
          },
          {
            id: "service-animation-entertainment-artists-dancer",
            label: "Dançarino",
          },
          {
            id: "service-animation-entertainment-artists-presenter",
            label: "Apresentador",
          },
          {
            id: "service-animation-entertainment-artists-painter",
            label: "Pintor",
          },
          {
            id: "service-animation-entertainment-artists-illustrator",
            label: "Ilustrador",
          },
          {
            id: "service-animation-entertainment-artists-speaker",
            label: "Orador",
          },
          {
            id: "service-animation-entertainment-artists-street-artists",
            label: "Artistas de Rua",
          },
          {
            id: "service-animation-entertainment-artists-actors",
            label: "Atores",
          },
          {
            id: "service-animation-entertainment-artists-influencers",
            label: "Influencers",
          },
          {
            id: "service-animation-entertainment-artists-tattoo-artist",
            label: "Tatuadora",
          },
          {
            id: "service-animation-entertainment-artists-entertainers",
            label: "Animadores",
          },
        ],
      },
      {
        id: "service-animation-entertainment-team-building-indoor",
        label: "Team Bulding Indoor",
        specifics: [],
        subCategories: [
          {
            id: "service-animation-entertainment-team-building-indoor-mobility-presentation",
            label: "Apresentação de Modalidade",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-dance-classes",
            label: "Aulas de Dança",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-human-bingo",
            label: "Bingo Humano",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-bubble-football",
            label: "Bouble Football",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-treasure-hunt",
            label: "Caça ao Tesouro",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-beer-tasting",
            label: "Cervejas",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-agility-circuits",
            label: "Circuitos de Agilidade",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-cocktails",
            label: "Cocktails",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-culinary-competitions",
            label: "Competições culinárias",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-structure-building",
            label: "Construção de estruturas",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-cooking",
            label: "Culinária",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-tastings",
            label: "Degustações",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-escape-rooms",
            label: "Escape Rooms",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-photography",
            label: "Fotografia",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-logic-problem-games",
            label: "Jogos de Lógica e resolução de problemas",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-precision-games",
            label: "Jogos de Precisão",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-indoor-karting",
            label: "Karting Indoor",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-makeup",
            label: "Maquilhagem",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-mini-olympics",
            label: "Mini Olimpíadas",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-painting",
            label: "Pintura",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-interactive-quiz",
            label: "Quiz Interativo",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-silent-disco",
            label: "Silent Disco",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-business-simulators",
            label: "Simuladores Empresariais",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-taskmaster",
            label: "Taskmaster",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-team-cocktail",
            label: "Team Cocktail",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-team-cook",
            label: "Team cook",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-video",
            label: "Vídeo",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-wine-tasting",
            label: "Vinhos",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-emotional-intelligence-workshops",
            label: "Workshops de Inteligência emocional",
          },
          {
            id: "service-animation-entertainment-team-building-indoor-group-yoga",
            label: "Yoga em Grupo",
          },
        ],
      },
      {
        id: "service-animation-entertainment-team-building-outdoor",
        label: "Team Bulding Outdoor",
        specifics: [],
        subCategories: [
          {
            id: "service-animation-entertainment-team-building-outdoor-tree-climbing-rock-climbing",
            label: "Arvorismo e escalada",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-dance-class",
            label: "Aula de Dança",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-beach-games",
            label: "Beach Games",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-treasure-hunt",
            label: "Caça ao tesouro",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-canoeing",
            label: "Canoagem",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-obstacle-races",
            label: "Corridas de Obstáculos",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-orienteering-races",
            label: "Corridas de orientação",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-highlander-games",
            label: "Highlander Games",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-team-jogging",
            label: "Jogging em equipa",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-olympic-games",
            label: "Jogos olímpicos",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-karting",
            label: "Karting",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-laser-tag",
            label: "Laser Tag",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-master-game",
            label: "Master Game",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-paintball",
            label: "Paintball",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-horse-riding",
            label: "Passeios a Cavalo",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-guided-hikes",
            label: "Passeios a pé com guia",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-mountain-biking",
            label: "Passeios de BTT",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-off-road-tours",
            label: "Passeios Todo o Terreno",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-photo-challenge",
            label: "Photo Challenge",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-rappel-slide",
            label: "Rappel e slide",
          },
          {
            id: "service-animation-entertainment-team-building-outdoor-recruit",
            label: "Recruta",
          },
        ],
      },
    ],
  },
  {
    id: "service-audiovisuals",
    label: "Audiovisuais",
    icon: <IconSpacesSoundCompleteSoundSystem />,
    categories: [
      {
        id: "service-audiovisuals-audio",
        label: "Audio",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-audio-amplifiers",
            label: "Amplificadores",
          },
          {
            id: "service-audiovisuals-audio-di-boxes",
            label: "D.I",
          },
          {
            id: "service-audiovisuals-audio-audio-distributors",
            label: "Distribuidores de audio",
          },
          {
            id: "service-audiovisuals-audio-dj-equipment",
            label: "DJ",
          },
          {
            id: "service-audiovisuals-audio-recorders",
            label: "Gravadores",
          },
          {
            id: "service-audiovisuals-audio-in-ears",
            label: "In Ears",
          },
          {
            id: "service-audiovisuals-audio-intercom",
            label: "Intercom",
          },
          {
            id: "service-audiovisuals-audio-players",
            label: "Leitores",
          },
          {
            id: "service-audiovisuals-audio-mixing-desks",
            label: "Mesas",
          },
          {
            id: "service-audiovisuals-audio-microphones",
            label: "Microfones",
          },
          {
            id: "service-audiovisuals-audio-conference-microphones",
            label: "Microfones Conferência",
          },
          {
            id: "service-audiovisuals-audio-transmitter-microphones",
            label: "Microfones Emissores",
          },
          {
            id: "service-audiovisuals-audio-monitors",
            label: "Monitores",
          },
          {
            id: "service-audiovisuals-audio-processor",
            label: "Processador",
          },
          {
            id: "service-audiovisuals-audio-sets",
            label: "Sets",
          },
          {
            id: "service-audiovisuals-audio-silence-room",
            label: "Silence Room",
          },
          {
            id: "service-audiovisuals-audio-speakers",
            label: "Speakers",
          },
          {
            id: "service-audiovisuals-audio-stage-box",
            label: "Stage Box",
          },
          {
            id: "service-audiovisuals-audio-stands",
            label: "Suportes",
          },
          {
            id: "service-audiovisuals-audio-simultaneous-translation",
            label: "Tradução Simultânea",
          },
          {
            id: "service-audiovisuals-audio-ups",
            label: "UPS",
          },
        ],
      },
      {
        id: "service-audiovisuals-cameras",
        label: "Câmaras",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-cameras-ar-vr",
            label: "AR VR",
          },
          {
            id: "service-audiovisuals-cameras-ccu",
            label: "CCU",
          },
          {
            id: "service-audiovisuals-cameras-clock",
            label: "Clock",
          },
          {
            id: "service-audiovisuals-cameras-controllers",
            label: "Controladores",
          },
          {
            id: "service-audiovisuals-cameras-converters",
            label: "Conversores",
          },
          {
            id: "service-audiovisuals-cameras-recorders",
            label: "Gravadores",
          },
          {
            id: "service-audiovisuals-cameras-cranes",
            label: "Gruas",
          },
          {
            id: "service-audiovisuals-cameras-lenses",
            label: "Lentes",
          },
          {
            id: "service-audiovisuals-cameras-matrix",
            label: "Matrix",
          },
          {
            id: "service-audiovisuals-cameras-monitors",
            label: "Monitores",
          },
          {
            id: "service-audiovisuals-cameras-robotized",
            label: "Robotizadas",
          },
          {
            id: "service-audiovisuals-cameras-camera-sets",
            label: "CamarasSets",
          },
          {
            id: "service-audiovisuals-cameras-transmitter-systems",
            label: "Sistemas Emissores",
          },
          {
            id: "service-audiovisuals-cameras-switchers",
            label: "Switchers",
          },
          {
            id: "service-audiovisuals-cameras-tracking",
            label: "Tracking",
          },
          {
            id: "service-audiovisuals-cameras-stands",
            label: "Suportes",
          },
          {
            id: "service-audiovisuals-cameras-teleprompter",
            label: "Teleponto",
          },
        ],
      },
      {
        id: "service-audiovisuals-lighting",
        label: "Iluminação",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-lighting-led-accessories",
            label: "Acessórios LED",
          },
          {
            id: "service-audiovisuals-lighting-air-dome",
            label: "Air dome",
          },
          {
            id: "service-audiovisuals-lighting-mirror-balls",
            label: "Bolas de Espelhos",
          },
          {
            id: "service-audiovisuals-lighting-buffet",
            label: "Buffet",
          },
          {
            id: "service-audiovisuals-lighting-centerpieces",
            label: "Centros de Mesa",
          },
          {
            id: "service-audiovisuals-lighting-dimmers",
            label: "Dimmers",
          },
          {
            id: "service-audiovisuals-lighting-effects",
            label: "Efeitos",
          },
          {
            id: "service-audiovisuals-lighting-led-strips",
            label: "Fitas de Led",
          },
          {
            id: "service-audiovisuals-lighting-follow-spot",
            label: "Follow Spot",
          },
          {
            id: "service-audiovisuals-lighting-battery-led",
            label: "Led de Bateria",
          },
          {
            id: "service-audiovisuals-lighting-fog-machines",
            label: "Máquinas de fumos",
          },
          {
            id: "service-audiovisuals-lighting-tables",
            label: "Mesas",
          },
          {
            id: "service-audiovisuals-lighting-led-projectors",
            label: "Projetores de Leds",
          },
          {
            id: "service-audiovisuals-lighting-fresnel-projectors",
            label: "Projetores Fresnel",
          },
          {
            id: "service-audiovisuals-lighting-cut-projectors",
            label: "Projetores Recorte",
          },
          {
            id: "service-audiovisuals-lighting-electrical-panels",
            label: "Quadros Eléctricos",
          },
          {
            id: "service-audiovisuals-lighting-robotics",
            label: "Robótica",
          },
          {
            id: "service-audiovisuals-lighting-sets",
            label: "Sets",
          },
          {
            id: "service-audiovisuals-lighting-strobes",
            label: "Strobs",
          },
          {
            id: "service-audiovisuals-lighting-stands",
            label: "Suportes",
          },
          {
            id: "service-audiovisuals-lighting-wireless",
            label: "Wireless",
          },
        ],
      },
      {
        id: "service-audiovisuals-computing",
        label: "Informática",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-computing-cue-light",
            label: "Cue Light",
          },
          {
            id: "service-audiovisuals-computing-switches",
            label: "Switches",
          },
        ],
      },
      {
        id: "service-audiovisuals-video",
        label: "Vídeo",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-video-3d",
            label: "3D",
          },
          {
            id: "service-audiovisuals-video-accessories",
            label: "Acessórios",
          },
          {
            id: "service-audiovisuals-video-computers",
            label: "Computadores",
          },
          {
            id: "service-audiovisuals-video-controllers",
            label: "Controladores",
          },
          {
            id: "service-audiovisuals-video-digital-signage",
            label: "Digital Signage",
          },
          {
            id: "service-audiovisuals-video-distributors",
            label: "Distribuidores",
          },
          {
            id: "service-audiovisuals-video-screens",
            label: "Ecrãs",
          },
          {
            id: "service-audiovisuals-video-flipcharts",
            label: "FlipCharts",
          },
          {
            id: "service-audiovisuals-video-lcd",
            label: "LCD",
          },
          {
            id: "service-audiovisuals-video-ledwall",
            label: "Ledwall",
          },
          {
            id: "service-audiovisuals-video-matrix",
            label: "Matrix",
          },
          {
            id: "service-audiovisuals-video-monitors",
            label: "Monitores",
          },
          {
            id: "service-audiovisuals-video-multiviewer",
            label: "Multiviewer",
          },
          {
            id: "service-audiovisuals-video-processors",
            label: "Processadores",
          },
          {
            id: "service-audiovisuals-video-projectors",
            label: "Projetores",
          },
          {
            id: "service-audiovisuals-video-servers",
            label: "Servidores",
          },
          {
            id: "service-audiovisuals-video-sets",
            label: "Sets",
          },
          {
            id: "service-audiovisuals-video-presentation-systems",
            label: "Sistemas de apresentação",
          },
        ],
      },
      {
        id: "service-audiovisuals-technologies",
        label: "Tecnologias",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-technologies-hologram",
            label: "Holograma",
          },
          {
            id: "service-audiovisuals-technologies-face-mapping",
            label: "Face Mapping",
          },
          {
            id: "service-audiovisuals-technologies-live-avatar",
            label: "Live Avatar",
          },
          {
            id: "service-audiovisuals-technologies-mapping",
            label: "Mapping",
          },
          {
            id: "service-audiovisuals-technologies-led-bracelets",
            label: "Pulseiras LED",
          },
          {
            id: "service-audiovisuals-technologies-augmented-reality",
            label: "Realidade Aumentada",
          },
          {
            id: "service-audiovisuals-technologies-silence-rooms",
            label: "Silence Rooms",
          },
          {
            id: "service-audiovisuals-technologies-streaming-audio",
            label: "Streaming Audio",
          },
          {
            id: "service-audiovisuals-technologies-xr-technology",
            label: "Tecnologia xR",
          },
          {
            id: "service-audiovisuals-technologies-touch-kinectics",
            label: "Touch Kinectics",
          },
          {
            id: "service-audiovisuals-technologies-tracking",
            label: "Tracking",
          },
          {
            id: "service-audiovisuals-technologies-3d-video",
            label: "Video 3D",
          },
          {
            id: "service-audiovisuals-technologies-video-tracking",
            label: "Video Tracking",
          },
        ],
      },
      {
        id: "service-audiovisuals-special-effects",
        label: "Efeitos Especiais",
        specifics: [],
        subCategories: [
          {
            id: "service-audiovisuals-special-effects-co2",
            label: "CO2",
          },
          {
            id: "service-audiovisuals-special-effects-confetti",
            label: "Confettis",
          },
          {
            id: "service-audiovisuals-special-effects-laser",
            label: "Laser",
          },
          {
            id: "service-audiovisuals-special-effects-bubble-machines",
            label: "Maquina de Bolas de Sabão",
          },
          {
            id: "service-audiovisuals-special-effects-flame-machines",
            label: "Máquinas de Chamas",
          },
          {
            id: "service-audiovisuals-special-effects-fog-machines",
            label: "Máquinas de Fumo",
          },
          {
            id: "service-audiovisuals-special-effects-spark",
            label: "Spark",
          },
          {
            id: "service-audiovisuals-special-effects-fan",
            label: "Ventoinha",
          },
        ],
      },
    ],
  },
  {
    id: "service-additional-services",
    label: "Serviços adicionais",
    icon: <IconSpacesFacilitiesDigitalTelevision />,
    categories: [
      {
        id: "service-additional-services-transport",
        label: "Transportes",
        specifics: [],
        subCategories: [
          {
            id: "service-additional-services-transport-buses",
            label: "Autocarros",
          },
          {
            id: "service-additional-services-transport-private-transfers",
            label: "Transfers Privados",
          },
          {
            id: "service-additional-services-transport-mini-bus",
            label: "Mini-Bus",
          },
          {
            id: "service-additional-services-transport-vehicles-with-driver",
            label: "Viaturas com Motorista",
          },
          {
            id: "service-additional-services-transport-charter",
            label: "Charter",
          },
          {
            id: "service-additional-services-transport-uber",
            label: "TVDE (Uber, Bolt)",
          },
          {
            id: "service-additional-services-transport-vintage-cars",
            label: "Carros Antigos",
          },
          {
            id: "service-additional-services-transport-horse-drawn-cars",
            label: "Carros de Cavalos",
          },
          {
            id: "service-additional-services-transport-limousines",
            label: "Limousines",
          },
          {
            id: "service-additional-services-transport-luxury-cars",
            label: "Carros de Luxo",
          },
        ],
      },
      {
        id: "service-additional-services-beauty",
        label: "Beleza",
        specifics: [],
        subCategories: [
          {
            id: "service-additional-services-beauty-makeup",
            label: "Maquilhagem",
          },
          {
            id: "service-additional-services-beauty-hairdresser",
            label: "Cabeleireiro",
          },
          {
            id: "service-additional-services-beauty-manicure",
            label: "Manicure",
          },
          {
            id: "service-additional-services-beauty-massage-therapist",
            label: "Massagista",
          },
        ],
      },
      {
        id: "service-additional-services-security",
        label: "Segurança",
        specifics: [],
        subCategories: [
          {
            id: "service-additional-services-security-on-site-guards",
            label: "Seguranças no local",
          },
          {
            id: "service-additional-services-security-video-surveillance",
            label: "Videovigilância",
          },
          {
            id: "service-additional-services-security-drone-surveillance",
            label: "Vigilância com drone",
          },
          {
            id: "service-additional-services-security-metal-detector",
            label: "Detetor de metais",
          },
        ],
      },
      {
        id: "service-additional-services-hostesses-promoters",
        label: "Hospedeiras/Promotores",
        specifics: [],
        subCategories: [
          {
            id: "service-additional-services-hostesses-promoters-congress-event-hostesses",
            label: "Hospedeiras de congressos/eventos",
          },
          {
            id: "service-additional-services-hostesses-promoters-ai-hostesses",
            label: "Hospedeiras em AI",
          },
          {
            id: "service-additional-services-hostesses-promoters-image-hostesses",
            label: "Hospedeiras de imagem",
          },
          {
            id: "service-additional-services-hostesses-promoters-mascot-hostesses",
            label: "Hospedeiras mascote",
          },
          {
            id: "service-additional-services-hostesses-promoters-custom-uniform",
            label: "Farda personalizada",
          },
        ],
      },
      {
        id: "service-additional-services-others",
        label: "Outros",
        specifics: [],
        subCategories: [
          {
            id: "service-additional-services-others-gifts",
            label: "Brindes",
          },
          {
            id: "service-additional-services-others-courtesy-gifts",
            label: "Oferta de Cortesia",
          },
          {
            id: "service-additional-services-others-themed-costumes",
            label: "Fatos Temáticos",
          },
        ],
      },
    ],
  },
] as const;

export const PACK_SERVICE_TYPE_FEATURES_FLAT = SERVICE_TYPES.flatMap(
  (serviceType) =>
    serviceType.categories.flatMap((category) => [
      { id: category.id, label: category.label },
      ...category.subCategories,
      ...category.specifics,
    ]),
);

export type ServiceType = (typeof SERVICE_TYPES)[number]["id"];
export type PackServiceTypeFeature =
  (typeof PACK_SERVICE_TYPE_FEATURES_FLAT)[number]["id"];
