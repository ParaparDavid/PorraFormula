# La Porra de la Fórmula

App móvil (Android e iPhone) de porras de F1 entre amigos. React Native + Expo + Firebase.
Plan completo: ver el documento "Plan de la app móvil de porra F1".

## Estructura
- `src/engine/` motor de puntuación por reglas editables (con tests: `npm test`)
- `src/firebase/` configuración de Firebase
- `src/theme/` colores y medidas
- `firestore.rules` reglas de seguridad de Firestore
- `web/` página pública (política de privacidad, borrado de cuenta) para Firebase Hosting

## Comandos
- `npm test` tests del motor
- `npm run typecheck` comprobar tipos
- `npm run gen:rules` actualiza en `firestore.rules` los cierres de predicciones tras cambiar el calendario (`src/data/f1.ts`)
- `npm run test:rules` probar `firestore.rules` con el emulador (necesita Java 21 o superior; sin ejecutar aún)
- `npx expo start` arrancar en desarrollo

## Pendiente conocido
- Las reglas de Firestore (grupos, miembros, códigos) tienen tests en `rules-test/`, pero aún no se han ejecutado con el emulador.
- Cierre de predicciones: jueves 23:59 hora de España, calculado en `src/data/deadlines.ts` y aplicado en las reglas del servidor. Los ids de carrera (`r01`…) valen solo para la temporada 2026: al pasar a 2027 hay que prefijarlos con el año.
- Las predicciones de otros jugadores se publicarán tras el cierre (Cloud Function, aún sin hacer).
- `com.porraformula` es el identificador de la app; es permanente una vez publicada.
