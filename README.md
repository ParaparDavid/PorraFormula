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
- `npx expo start` arrancar en desarrollo

## Pendiente conocido
- Las reglas de Firestore no están probadas con el emulador.
- Las predicciones aún se pueden editar tras el cierre: falta el bloqueo por Cloud Function.
- `com.tinglao.porraformula` es un identificador provisional. Es permanente una vez publicada la app.
