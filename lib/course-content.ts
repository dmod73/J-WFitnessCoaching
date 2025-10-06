export type CourseContent = {
  intro: {
    videoUrl: string;
    summary: string;
  };
  modules: Array<{
    title: string;
    description: string;
    videoUrl: string;
  }>;
  resources?: Array<{
    label: string;
    href: string;
  }>;
};

export const courseContentLibrary: Record<string, CourseContent> = {
  'starter-strong': {
    intro: {
      videoUrl: 'https://www.youtube.com/embed/2pLT-olgUJs?rel=0',
      summary:
        'Bienvenida al plan Starter Strong. Aprende la base de la tecnica con foco en sentadillas, press y movilidad consciente.'
    },
    modules: [
      {
        title: 'Semana 1 · Activacion y patron de sentadilla',
        description: 'Calentamientos dinamicos, tecnica de peso corporal y progresiones con kettlebell.',
        videoUrl: 'https://www.youtube.com/embed/rJYJjDHS7o4?rel=0'
      },
      {
        title: 'Semana 2 · Empujes y estabilidad',
        description: 'Press en suelo, bandas y trabajo accesorio para hombros saludables.',
        videoUrl: 'https://www.youtube.com/embed/bTqVqk7FSmY?rel=0'
      },
      {
        title: 'Semana 3 · Bisagra de cadera y core',
        description: 'Deadlift con mancuerna, swings y trabajo antirotacional.',
        videoUrl: 'https://www.youtube.com/embed/k1xS4HFKXxw?rel=0'
      }
    ],
    resources: [
      { label: 'Plantilla de progreso en Google Sheets', href: 'https://example.com/resources/starter-tracker' }
    ]
  },
  'elite-pro': {
    intro: {
      videoUrl: 'https://www.youtube.com/embed/Eh00_rniF8E?rel=0',
      summary:
        'Programa Elite Pro: revisamos biometria, periodizacion avanzada y nutricion aplicada a alto rendimiento.'
    },
    modules: [
      {
        title: 'Modulo 1 · Auditoria de rendimiento',
        description: 'Lectura de marcadores de HRV, cuestionarios de carga interna y configuracion de apps.',
        videoUrl: 'https://www.youtube.com/embed/gXlIAS-rI4E?rel=0'
      },
      {
        title: 'Modulo 2 · Microciclos ondulantes',
        description: 'Diseña bloques con fuerza maxima, potencia y acondicionamiento inteligente.',
        videoUrl: 'https://www.youtube.com/embed/7aQdLxXcQp4?rel=0'
      },
      {
        title: 'Modulo 3 · Nutricion estratificada',
        description: 'Timing de carbohidratos, suplementos basados en evidencia y ajustes automaticos.',
        videoUrl: 'https://www.youtube.com/embed/DbxSodIXjOo?rel=0'
      }
    ],
    resources: [
      { label: 'Checklist semanal', href: 'https://example.com/resources/elite-checklist' },
      { label: 'Guia de nutricion PDF', href: 'https://example.com/resources/elite-nutricion' }
    ]
  },
  'team-power': {
    intro: {
      videoUrl: 'https://www.youtube.com/embed/UoC_O3HzsH0?rel=0',
      summary:
        'Team Power coordina rutinas en duplas o grupos con retos y scoreboard para mantener la motivacion alta.'
    },
    modules: [
      {
        title: 'Modulo 1 · Setup del equipo',
        description: 'Roles, dinamicas de accountability y configuracion del tablero colaborativo.',
        videoUrl: 'https://www.youtube.com/embed/1u1VWyM8zrw?rel=0'
      },
      {
        title: 'Modulo 2 · Retos sincronizados',
        description: 'Diseño de retos semanales, puntuacion y retroalimentacion positiva.',
        videoUrl: 'https://www.youtube.com/embed/q3Z-b4Zx6Wc?rel=0'
      },
      {
        title: 'Modulo 3 · Sesion en vivo',
        description: 'Clases dirigidas con enfoque en HIIT y trabajo grupal escalonado.',
        videoUrl: 'https://www.youtube.com/embed/tzD9BkXGJ1M?rel=0'
      }
    ],
    resources: [
      { label: 'Plantilla de scoreboard', href: 'https://example.com/resources/team-scoreboard' }
    ]
  }
};