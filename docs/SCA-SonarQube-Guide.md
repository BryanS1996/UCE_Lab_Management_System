# Guía de Análisis de Composición de Software (SCA) con SonarQube

## 1. Introducción y Marco Teórico

### 1.1 ¿Qué es SCA (Software Composition Analysis)?
El Análisis de Composición de Software (SCA) es un proceso automatizado que identifica las dependencias de código abierto utilizadas en una aplicación y evalúa sus riesgos de seguridad, cumplimiento de licencias y calidad del código. A diferencia de SAST (Static Application Security Testing) que analiza el código fuente que nosotros escribimos en busca de errores, SCA se enfoca en el código de terceros que importamos (librerías, frameworks).

### 1.2 Importancia en Arquitecturas de Microservicios
En un proyecto como el **UCE Lab Management System**, que utiliza 9 microservicios y un frontend, la cantidad de dependencias externas (paquetes npm) es sustancial. Una sola vulnerabilidad en un paquete compartido (como `jsonwebtoken` o `axios`) puede comprometer la seguridad de todo el sistema.

### 1.3 Conceptos Clave
- **CVE (Common Vulnerabilities and Exposures)**: Un diccionario de vulnerabilidades y exposiciones de seguridad de la información divulgadas públicamente.
- **NVD (National Vulnerability Database)**: Base de datos del gobierno de EE.UU. basada en el formato CVE, que incluye métricas de severidad (CVSS).
- **OWASP Dependency-Check**: Una utilidad que identifica las dependencias del proyecto y comprueba si hay vulnerabilidades conocidas y divulgadas públicamente.

## 2. Inventario de Dependencias del Proyecto

El proyecto se basa principalmente en el ecosistema Node.js (NestJS para backend y React/Vite para frontend). Las dependencias clave identificadas que están sujetas a análisis incluyen:

* **Framework Base**: `@nestjs/core`, `@nestjs/common`, `react`
* **Acceso a Datos**: `typeorm`, `pg`, `mongoose`
* **Autenticación/Seguridad**: `passport`, `passport-jwt`, `bcrypt`
* **Mensajería/Eventos**: `amqplib`, `kafkajs`, `mqtt`, `socket.io`
* **Utilidades**: `axios`, `winston`, `class-validator`, `stripe`

> **Nota Crítica**: Durante el análisis preliminar, se identificó que `catalog-service` está utilizando `typeorm: ^1.0.0`, mientras que el resto de los servicios usan versiones más estables (`^0.3.x`). Esto es un ejemplo de inconsistencia en el manejo de dependencias que SCA puede ayudar a identificar.

## 3. Implementación en el Proyecto

### 3.1 Integración con SonarQube
Dado que SonarQube Community Edition no posee análisis SCA nativo para Node.js, la arquitectura implementada utiliza:
1. **npm audit**: Para una detección nativa de Node.js.
2. **OWASP Dependency-Check**: Para escanear contra la base de datos NVD.
3. **SonarQube Scanner**: Para consolidar los resultados en el dashboard `https://server2.distribuidauce.org`.

### 3.2 Archivos Configurados
- `sonar-project.properties`: Configuración centralizada del escáner en el repositorio, indicando qué analizar y dónde enviar los reportes.
- `.github/workflows/sca-analysis.yml`: Flujo de integración continua para automatizar el análisis en cada Pull Request o Commit hacia las ramas principales.
- `scripts/npm-audit-all.ps1`: Script PowerShell que facilita la comprobación rápida a nivel local de las vulnerabilidades en todos los microservicios.
- `scripts/sca-analysis.ps1`: Script para emular el pipeline completo en el equipo del desarrollador.

## 4. Ejecución del Análisis Local

Para comprobar las vulnerabilidades en tu entorno de desarrollo antes de enviar código:

```powershell
# 1. Ejecutar escaneo rápido de dependencias
.\scripts\npm-audit-all.ps1

# 2. Ejecutar análisis SCA completo (requiere OWASP Dependency-Check y SonarScanner instalados localmente)
.\scripts\sca-analysis.ps1
```

## 5. Análisis de Resultados (Plantilla de Evaluación)

*Instrucciones: Una vez que se ejecute el pipeline o los scripts locales y los datos aparezcan en SonarQube, el estudiante debe llenar esta sección basada en sus hallazgos.*

### 5.1 Resumen de Vulnerabilidades
| Microservicio | Críticas | Altas | Medias | Bajas | Total |
|---------------|----------|-------|--------|-------|-------|
| auth-service | [0] | [0] | [0] | [0] | [0] |
| frontend | [0] | [0] | [0] | [0] | [0] |
| ... | ... | ... | ... | ... | ... |

### 5.2 Hallazgos Críticos
- **CVE-XXXX-XXXX**: [Descripción de la vulnerabilidad]
  - **Componente**: [Nombre del paquete]
  - **Servicios Afectados**: [Servicios que lo usan]
  - **Impacto**: [Qué podría hacer un atacante]
  - **Remediación Sugerida**: [Actualizar paquete a la versión X.X.X]

### 5.3 Conclusiones y Plan de Remediación
[Describir las conclusiones sobre la calidad general de las dependencias y los pasos a seguir para reducir el nivel de riesgo técnico de la aplicación].
