# Piloto Yulia — Guion de venta + Anotaciones

Herramienta para la reunión con tu amigo (el restaurante) sobre el piloto de Yulia
(feedback QR). Deja el guion de venta ya armado para leer antes de la reunión, y un
formulario para registrar qué pasó después — así tienes el feedback guardado aunque
al final el cliente no lo quiera.

Basado en el análisis de `analisis-yulia.md`.

---

## ¿Para qué sirve?

- **`guion.html`** — el discurso de venta ya armado: contexto de Yulia, cómo abrir con
  el dolor (reseñas malas), cómo calcular el costo de una mala reseña, cómo proponer
  el piloto de 30 días, objeciones y respuestas, y el checklist de debida diligencia
  de seguridad para preguntarle a `antonio@yulia.com.co`.
- **`index.html`** — formulario de anotaciones post-reunión: interés real del cliente,
  objeciones que puso, si aceptó el piloto, qué respondió el proveedor en la debida
  diligencia, y notas libres. Se guarda automáticamente en Google Sheets (en tu Drive).

Ambas páginas están protegidas con PIN (uso interno, solo tuyo).

---

## Archivos del proyecto

```
yulia-pitch/
├── guion.html                           ← Guion de venta (leer antes de la reunión)
├── index.html                           ← Formulario de anotaciones (abrir en el celular)
├── assets/
│   ├── style.css                        ← Estilos del formulario
│   └── app.js                           ← Lógica del formulario + envío a Sheets + PIN
├── backend/
│   └── INSTALAR-APPS-SCRIPT.md          ← Código del backend + pasos (fuente real: business-diagnostic-survey/backend/google-apps-script.js)
└── README.md
```

---

## Configuración inicial (una sola vez)

Esto **no crea un Google Sheet nuevo ni un Apps Script nuevo**. Usa el mismo Drive que
ya tienes con `business-diagnostic-survey`: se agrega una pestaña nueva ("Piloto Yulia")
dentro de esa misma hoja, y se reutiliza el mismo despliegue de Apps Script (misma URL).

### Paso 1 — Cambiar el PIN de acceso

El PIN por defecto es **1234**. Para cambiarlo:

```
node -e "console.log(require('crypto').createHash('sha256').update('TU_PIN_NUEVO').digest('hex'))"
```

Copia el resultado y reemplaza `PIN_HASH` en dos archivos:
- `guion.html` (dentro del `<script>` al final)
- `assets/app.js` (sección "PIN de acceso")

### Paso 2 — Actualizar el Apps Script que ya existe

1. Abre el Google Sheet que ya usas para "Encuestas Negocios" (el de `business-diagnostic-survey`)
2. **Extensiones → Apps Script**
3. Borra todo el código actual y pega el contenido completo de
   `business-diagnostic-survey/backend/google-apps-script.js` (esa es la fuente real;
   `yulia-pitch/backend/INSTALAR-APPS-SCRIPT.md` trae la misma copia lista para pegar
   si te resulta más cómodo) — ahora enruta a dos pestañas distintas según qué formulario lo llame
4. Guarda con **Ctrl+S**
5. **Implementar → Gestionar implementaciones → ✏️ (editar la implementación activa)**
   → Versión: **Nueva versión** → Implementar
   - Esto mantiene **la misma URL `/exec`** de siempre — no hay que crear una implementación nueva
6. La pestaña **"Piloto Yulia"** se crea sola la primera vez que llegue un envío desde este formulario

### Paso 3 — Conectar el formulario con la hoja

Abre `assets/app.js`, busca:

```js
const SCRIPT_URL = 'PEGAR_AQUI_LA_URL_DE_APPS_SCRIPT';
```

Pega ahí **la misma URL** que ya usa `business-diagnostic-survey/assets/app.js`
(la puedes copiar directo de ese archivo) y guarda.

### Paso 4 — Probar

1. Abre `index.html` en el celular o navegador, ingresa el PIN
2. Llena el formulario y clic en **"Guardar anotaciones"**
3. Revisa tu Google Sheets — debe aparecer la pestaña **"Piloto Yulia"** con una fila nueva
4. Confirma que la pestaña original del diagnóstico de negocios sigue intacta

---

## Uso en la reunión

1. Antes de ir, abre `guion.html` y repasa el guion (o imprímelo con el botón).
2. Lleva el número calculado del costo de la mala reseña.
3. Después de la reunión (aunque el cliente diga que no), abre `index.html` y registra
   qué pasó: interés real, objeciones, resultado del piloto, y lo que haya respondido
   el proveedor sobre seguridad y partners.
4. Sin señal, las anotaciones se guardan en el celular y se sincronizan solas al volver
   el internet.

---

## Columnas en Google Sheets

Fecha/hora de registro, negocio, contacto, fecha de la reunión, reseñas negativas
revisadas, costo estimado, interés, objeciones, resultado del piloto, precio de la
mensualidad, 10 columnas de debida diligencia del proveedor (Sí/No/Pendiente), notas
de la debida diligencia, notas generales, próximo paso y fecha de seguimiento.

---

## Requisitos

- Un celular o computador con navegador web
- Una cuenta de Google (para Sheets + Apps Script)
- No requiere servidor, hosting, ni conocimientos de programación para usarlo
