-- db-init/init-laboratories.sql

-- 1. CREAR LA TABLA PRIMERO (Para que el INSERT no falle)
CREATE TABLE IF NOT EXISTS laboratories (
    lab_id SERIAL PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description VARCHAR(500),
    location VARCHAR(200),
    max_capacity INT DEFAULT 30 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    version INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. INSERTAR LOS DATOS INICIALES
INSERT INTO laboratories (name, description, location, max_capacity, status, is_active, created_by, updated_by, created_at, updated_at, version) 
VALUES 
-- Área: Computación y Desarrollo de Software
('Laboratorio Computación 01', 'Laboratorio estándar para ofimática e introducción a la programación.', 'Facultad de Ingeniería - Piso 1 - Sala 101', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio Computación 02', 'Laboratorio estándar para ofimática e introducción a la programación.', 'Facultad de Ingeniería - Piso 1 - Sala 102', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio Computación 03', 'Laboratorio equipado para desarrollo web y diseño gráfico.', 'Facultad de Ingeniería - Piso 1 - Sala 103', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Desarrollo Móvil', 'Equipos Mac y PC de gama alta para emulación y desarrollo de apps iOS/Android.', 'Facultad de Ingeniería - Piso 2 - Sala 201', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Videojuegos', 'Estaciones de trabajo con GPUs dedicadas para Unity y Unreal Engine.', 'Facultad de Ingeniería - Piso 2 - Sala 202', 15, 'MAINTENANCE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Sistemas Operativos', 'Sala aislada para prácticas de instalación y configuración de SO (Linux/Windows).', 'Facultad de Ingeniería - Piso 2 - Sala 203', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Redes, Seguridad y Datos
('Laboratorio de Redes Cisco 1', 'Equipamiento físico de routers y switches Cisco para prácticas de CCNA.', 'Torre Tecnológica - Piso 3 - Sala 301', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Redes Cisco 2', 'Equipamiento avanzado para enrutamiento y conmutación.', 'Torre Tecnológica - Piso 3 - Sala 302', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Ciberseguridad', 'Entorno aislado para prácticas de hacking ético y análisis de vulnerabilidades.', 'Torre Tecnológica - Piso 4 - Sala 401', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Bases de Datos', 'Servidores locales para prácticas de SQL, NoSQL y administración de DBs.', 'Torre Tecnológica - Piso 4 - Sala 402', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Big Data', 'Clústeres de procesamiento para Hadoop y Spark.', 'Torre Tecnológica - Piso 4 - Sala 403', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Inteligencia Artificial', 'Workstations con Tensor Cores para entrenamiento de modelos Deep Learning.', 'Torre Tecnológica - Piso 5 - Sala 501', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Física
('Laboratorio de Física Clásica A', 'Equipos para experimentos de mecánica y cinemática.', 'Edificio de Ciencias - PB - Sala 01', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Física Clásica B', 'Equipos para experimentos de mecánica y cinemática.', 'Edificio de Ciencias - PB - Sala 02', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Electromagnetismo', 'Fuentes de poder, osciloscopios y kits de magnetismo.', 'Edificio de Ciencias - Piso 1 - Sala 11', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Óptica', 'Mesas ópticas, láseres y lentes para prácticas de luz y refracción.', 'Edificio de Ciencias - Piso 1 - Sala 12', 15, 'INACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Termodinámica', 'Calorímetros y equipos de medición térmica.', 'Edificio de Ciencias - Piso 2 - Sala 21', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Física Moderna', 'Equipos de precisión para experimentos de física cuántica básica.', 'Edificio de Ciencias - Piso 2 - Sala 22', 10, 'MAINTENANCE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Química
('Laboratorio de Química General 1', 'Mesones con extractores, mecheros Bunsen y material de vidrio.', 'Pabellón de Química - Piso 1 - Lab 1', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Química General 2', 'Mesones con extractores, mecheros Bunsen y material de vidrio.', 'Pabellón de Química - Piso 1 - Lab 2', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Química Orgánica', 'Campanas de extracción de gases para síntesis orgánica.', 'Pabellón de Química - Piso 2 - Lab 3', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Química Analítica', 'Equipos de titulación, espectrofotómetros y balanzas analíticas.', 'Pabellón de Química - Piso 2 - Lab 4', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Fisicoquímica', 'Instrumentación avanzada para medir propiedades físicas de compuestos.', 'Pabellón de Química - Piso 3 - Lab 5', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Análisis Instrumental', 'Cromatógrafos de gases y líquidos (HPLC).', 'Pabellón de Química - Piso 3 - Lab 6', 10, 'MAINTENANCE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Biología y Medicina
('Laboratorio de Biología General', 'Microscopios ópticos y muestras biológicas preparadas.', 'Facultad de Biología - Piso 1 - Sala 1', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Microbiología', 'Autoclaves, incubadoras y cabinas de flujo laminar.', 'Facultad de Biología - Piso 2 - Sala 2', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Genética', 'Equipos PCR, centrífugas y electroforesis.', 'Facultad de Biología - Piso 3 - Sala 3', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Anatomía', 'Mesas de disección y modelos anatómicos 3D.', 'Facultad de Medicina - Subsuelo - Sala A', 40, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Histología', 'Colección de tejidos y microscopios de alta resolución.', 'Facultad de Medicina - Piso 1 - Sala B', 25, 'INACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Centro de Simulación Médica', 'Maniquíes interactivos para prácticas de primeros auxilios y UCI.', 'Facultad de Medicina - Piso 2 - Sala C', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Electrónica y Telecomunicaciones
('Laboratorio de Circuitos Eléctricos', 'Protoboards, multímetros y fuentes de voltaje.', 'Facultad de Electrónica - Piso 1 - Lab A', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Electrónica Analógica', 'Osciloscopios y generadores de señales.', 'Facultad de Electrónica - Piso 1 - Lab B', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Electrónica Digital', 'Kits FPGA y microcontroladores básicos.', 'Facultad de Electrónica - Piso 2 - Lab C', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Microprocesadores', 'Kits de desarrollo Arduino, Raspberry Pi y STM32.', 'Facultad de Electrónica - Piso 2 - Lab D', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Telecomunicaciones 1', 'Antenas, analizadores de espectro y radios.', 'Facultad de Electrónica - Piso 3 - Lab E', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Fibra Óptica', 'Empalmadoras de fibra y OTDRs.', 'Facultad de Electrónica - Piso 3 - Lab F', 12, 'MAINTENANCE', true, 'system', 'system', NOW(), NOW(), 1),

-- Área: Robótica, Mecatrónica y Civil
('Laboratorio de Robótica Industrial', 'Brazos robóticos articulados para prácticas de manufactura.', 'Centro de Innovación - Nave 1', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Robótica Móvil', 'Pista de pruebas y robots móviles autónomos (AGV).', 'Centro de Innovación - Nave 2', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Control y Automatización', 'PLCs Siemens y paneles de control industrial.', 'Centro de Innovación - Nave 3', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Diseño CAD/CAM', 'Estaciones de trabajo de alto rendimiento e impresoras 3D.', 'Centro de Diseño - Sala 1', 25, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Mecánica de Suelos', 'Prensas hidráulicas y tamices para pruebas de tierra.', 'Facultad de Ingeniería Civil - PB', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Hidráulica', 'Canales de flujo y bombas de agua para mecánica de fluidos.', 'Facultad de Ingeniería Civil - Ext', 15, 'INACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Topografía', 'Almacenamiento de teodolitos, estaciones totales y drones.', 'Facultad de Ingeniería Civil - Piso 1', 20, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),

-- Salas de Uso Múltiple y Estructuras Especiales
('Sala de Computación Libre A', 'Computadoras de libre acceso para tareas y consultas.', 'Biblioteca Central - Piso 1', 50, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Sala de Computación Libre B', 'Computadoras de libre acceso para tareas y consultas.', 'Biblioteca Central - Piso 2', 50, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Idiomas 1', 'Cabinas con audífonos aislantes y software de aprendizaje.', 'Centro de Idiomas - Piso 1', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Idiomas 2', 'Cabinas con audífonos aislantes y software de aprendizaje.', 'Centro de Idiomas - Piso 2', 30, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Taller de Arquitectura', 'Mesas amplias para maquetación y dibujo técnico.', 'Facultad de Arquitectura - Sala Magna', 40, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1),
('Estudio de Grabación Audiovisual', 'Cámaras, pantallas verdes e insonorización profesional.', 'Facultad de Artes - Estudio 1', 10, 'MAINTENANCE', true, 'system', 'system', NOW(), NOW(), 1),
('Laboratorio de Edición de Video', 'Equipos Apple Mac Studio para renderizado 4K.', 'Facultad de Artes - Sala 2', 15, 'ACTIVE', true, 'system', 'system', NOW(), NOW(), 1)
ON CONFLICT (name) DO NOTHING;