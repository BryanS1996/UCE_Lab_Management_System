import json
import re

def lambda_handler(event, context):
    try:
        # Extraer el cuerpo de la petición HTTP API (API Gateway envia esto como body)
        body = {}
        if "body" in event:
            if isinstance(event["body"], str):
                body = json.loads(event["body"])
            else:
                body = event["body"]
        else:
            body = event
            
        description = body.get("description", "").lower()
        
        if not description:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "La descripción es requerida"})
            }

        # NLP Básico (condicionales)
        severity = "BAJA"
        category = "OTRO"
        
        # Palabras clave para urgencias / severidad alta
        alta_keywords = ["fuego", "humo", "roto", "quemado", "explosión", "chispas", "emergencia", "inundación", "peligro"]
        # Palabras clave para severidad media
        media_keywords = ["no enciende", "parpadea", "falla", "reinicia", "lento", "ruido", "no funciona"]
        
        # Palabras clave por categorías
        hardware_keywords = ["pantalla", "teclado", "ratón", "mouse", "cpu", "computadora", "monitor", "cable", "disco duro", "ram", "memoria"]
        software_keywords = ["virus", "programa", "sistema operativo", "windows", "linux", "aplicación", "pantalla azul", "error", "código"]
        red_keywords = ["internet", "wifi", "red", "conexión", "ping", "router", "switch", "latencia", "desconectado"]
        
        # Determinar Severidad
        if any(keyword in description for keyword in alta_keywords):
            severity = "ALTA"
        elif any(keyword in description for keyword in media_keywords):
            severity = "MEDIA"
            
        # Determinar Categoría
        if any(keyword in description for keyword in hardware_keywords):
            category = "HARDWARE"
        elif any(keyword in description for keyword in red_keywords):
            category = "RED"
        elif any(keyword in description for keyword in software_keywords):
            category = "SOFTWARE"

        response_payload = {
            "severity": severity,
            "category": category,
            "analyzed_text": description
        }

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps(response_payload)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Error interno", "error": str(e)})
        }
