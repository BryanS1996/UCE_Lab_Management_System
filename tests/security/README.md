# Pruebas de Seguridad DAST — OWASP ZAP

## Descripción y Objetivo
Este directorio contiene la configuración y documentación para las pruebas de seguridad dinámica (DAST) utilizando OWASP ZAP. El objetivo principal es garantizar el atributo de calidad de fiabilidad y seguridad de la aplicación, identificando vulnerabilidades comunes antes de que lleguen a producción.

## Casos de Prueba

| # | ID | Nombre | Target | Tipo | Criterio de Fallo |
|---|---|---|---|---|---|
| 1 | ZAP-DAST-01 | Frontend Baseline Scan | `QA_FRONTEND_URL` | Pasivo | Solo Warn en reglas baseline |
| 2 | ZAP-DAST-02 | API Gateway Baseline Scan | `QA_API_GATEWAY_URL` | Pasivo | Solo Warn en reglas baseline |
| 3 | ZAP-DAST-03 | Auth API Active Scan | `QA_API_GATEWAY_URL/api/auth` | Activo | Falla si detecta vulnerabilidades críticas (Low Strength) |
| 4 | ZAP-DAST-04 | Security Headers Audit | `QA_FRONTEND_URL` | Pasivo | Fallos en cabeceras críticas |
| 5 | ZAP-DAST-05 | API Full Scan | `QA_API_GATEWAY_URL` | Activo | Falla si detecta vulnerabilidades críticas (No DELETE/PUT) |

## Clasificación de Severidades OWASP

Las vulnerabilidades detectadas se clasifican de la siguiente manera:
- **INFORMATIONAL**: Buenas prácticas, no representan un riesgo directo.
- **LOW**: Bajo impacto, puede proporcionar información útil para un atacante.
- **MEDIUM**: Impacto moderado, requiere ciertas condiciones para ser explotado.
- **HIGH**: Alto impacto, fácilmente explotable con consecuencias graves.
- **CRITICAL**: Riesgo inminente, explotación trivial con acceso o control total.

## Configuración de Reglas (`zap-rules.tsv`)

El archivo `zap-rules.tsv` controla cómo ZAP reporta ciertas reglas:
- **IGNORE**: Ignora la alerta completamente. Útil para reducir falsos positivos en aplicaciones SPA modernas (React).
- **WARN**: Reporta el problema pero no hace fallar la canalización de CI/CD.
- **FAIL**: Falla la canalización de CI/CD si se detecta esta vulnerabilidad (ej. Inyecciones SQL, XSS, etc.).

## Consideraciones de Seguridad en ZAP

Para evitar problemas en los entornos de QA durante los escaneos activos:
- El parámetro `attackStrength` está configurado en `LOW` para reducir la agresividad de las pruebas.
- Los métodos HTTP destructivos (como `DELETE` o `PUT`) se omiten en los escaneos completos usando exclusiones (ej. `httpSender.excludeUrls.url=.*DELETE.*|.*PUT.*`).

## Gestión de Datos de Prueba

**Advertencia:** OWASP ZAP puede inyectar payloads de prueba que ensucian la base de datos de los entornos de QA. Asegúrese de contar con mecanismos de limpieza o aislamiento de bases de datos para estos entornos.

## Interpretación de Reportes HTML

Después de la ejecución en GitHub Actions, los reportes se adjuntan como artefactos. Puede descargar los archivos ZIP correspondientes, extraerlos y abrir los archivos HTML en cualquier navegador para revisar los hallazgos en detalle.

## Guía Breve de Remediación

- **Inyección SQL / NoSQL**: Use consultas parametrizadas o un ORM (como Prisma/TypeORM) y nunca concatene strings para construir consultas.
- **XSS**: Asegúrese de que el framework front-end (React) escape correctamente la salida de datos. Evite el uso de `dangerouslySetInnerHTML`.
- **Cabeceras de Seguridad**: Configure Helmet.js en el backend para establecer las cabeceras HTTP necesarias.

## Solución de Problemas

- Si los tests están tardando demasiado, revise el parámetro `maxRuleDurationInMins`.
- Si experimenta muchos falsos positivos, actualice `zap-rules.tsv` con la acción `IGNORE` o `WARN`.
