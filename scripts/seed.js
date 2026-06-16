// seed.js

const ALB_URL = "http://uce-lab-alb-qa-856993220.us-east-1.elb.amazonaws.com/api/laboratories/laboratories";

// Pega aquí el Access JWT que te da tu panel de pruebas (sin la palabra Bearer)
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzZTRhMGM4Yy0zMjM2LTQwYWUtYTZkMi03ODFlYTkyZTI2MGIiLCJlbWFpbCI6ImJyeWFuZmFicmljaW9AdWNlLmVkdS5lYyIsInJvbGUiOiJTVFVERU5UIiwiaWF0IjoxNzgxNTQzNDc5LCJleHAiOjE3ODE1NDQzNzksImlzcyI6ImF1dGgtc2VydmljZSJ9.9OUxW4VpkMMDbtQKo2Bni-W7wx1kvhS9a8EMO4dVHc0"; 
// seed.js

const laboratorios = [
  {
    name: "Laboratorio Computación 12",
    description: "Laboratorio estándar para prácticas y clases de Computación con equipos de gama media.",
    location: "Torre de Ciencias Piso 3 - Sala 111",
    max_capacity: 34,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio Computación 16",
    description: "Sala equipada con software de simulación matemática y estadística.",
    location: "Edif. Tecnológico Piso 3 - Sala 108",
    max_capacity: 25,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio Redes y Telecomunicaciones",
    description: "Equipos Cisco y simuladores para prácticas de enrutamiento y conmutación.",
    location: "Torre de Ciencias Piso 4 - Sala 115",
    max_capacity: 27,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio Computación 38",
    description: "Espacio optimizado para desarrollo de software y bases de datos.",
    location: "Edif. Tecnológico Piso 3 - Sala 101",
    max_capacity: 24,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio Computación 44 (Premium)",
    description: "Laboratorio avanzado de Computación con equipos especializados y tarjetas gráficas para IA.",
    location: "Edif. Central Piso 4 - Sala 105",
    max_capacity: 29,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio Computación 8 (Premium)",
    description: "Workstations de alto rendimiento para renderizado 3D y diseño asistido.",
    location: "Torre de Ciencias Piso 1 - Sala 105",
    max_capacity: 20,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio de Sistemas Operativos",
    description: "Equipos con dual-boot (Linux/Windows) para prácticas de bajo nivel.",
    location: "Torre de Ciencias Piso 2 - Sala 201",
    max_capacity: 30,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio de Hardware y Robótica",
    description: "Kits de Arduino, Raspberry Pi y componentes electrónicos para IoT.",
    location: "Edif. Tecnológico Piso 1 - Sala 102",
    max_capacity: 15,
    status: "ACTIVE"
  },
  {
    name: "Laboratorio de Ciberseguridad",
    description: "Red aislada para prácticas de pentesting y análisis de vulnerabilidades.",
    location: "Edif. Central Piso 5 - Sala 501",
    max_capacity: 20,
    status: "ACTIVE"
  },
  {
    name: "Sala de Innovación y Coworking",
    description: "Espacio colaborativo con pantallas interactivas para trabajo de tesis y proyectos.",
    location: "Biblioteca General Planta Baja",
    max_capacity: 40,
    status: "ACTIVE"
  }
];

async function inyectarLaboratorios() {
  console.log("🚀 Iniciando inyección de laboratorios al Balanceador de Carga...");
  
  for (let i = 0; i < laboratorios.length; i++) {
    const lab = laboratorios[i];
    try {
      const response = await fetch(ALB_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(lab)
      });

      if (response.ok) {
        console.log(`✅ [${i + 1}/10] Creado: ${lab.name}`);
      } else {
        const errorData = await response.json();
        console.error(`❌ [${i + 1}/10] Error en ${lab.name}:`, errorData);
      }
    } catch (error) {
      console.error(`🚨 Fallo de red al intentar crear ${lab.name}:`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("🎉 ¡Proceso finalizado!");
}

inyectarLaboratorios();