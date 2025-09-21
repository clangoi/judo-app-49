#!/bin/bash

echo "🚀 INICIANDO LIMPIEZA Y REINSTALACIÓN COMPLETA..."

# 1. Detener procesos
echo "🛑 Deteniendo procesos de Metro/Expo si existen..."
pkill -f "expo" 2>/dev/null
pkill -f "metro" 2>/dev/null

# 2. Limpiar
echo "🧹 Limpiando node_modules, package-lock.json y cachés..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf .expo
rm -rf android/.gradle
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 3. Detectar versión de Expo
EXPO_VERSION=$(grep -o '"expo": *"[^"]*"' package.json | cut -d'"' -f4)
if [ -z "$EXPO_VERSION" ]; then
    echo "❌ No se encontró 'expo' en package.json."
    exit 1
fi

echo "📦 Versión de Expo detectada: $EXPO_VERSION"

# 4. Extraer SDK
SDK_MAJOR=$(echo $EXPO_VERSION | grep -o '^[~^]\?[0-9]*' | tr -d '~^')
if [ -z "$SDK_MAJOR" ]; then
    echo "❌ No se pudo extraer el SDK."
    exit 1
fi

echo "🔢 SDK detectado: $SDK_MAJOR"

# 5. Mapear versiones
case $SDK_MAJOR in
    53)
        RN_VERSION="0.76.5"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    52)
        RN_VERSION="0.75.3"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    51)
        RN_VERSION="0.74.5"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    50)
        RN_VERSION="0.73.6"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    49)
        RN_VERSION="0.72.6"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    48)
        RN_VERSION="0.71.8"
        TYPES_REACT_VERSION="^18.3.0"
        ;;
    *)
        echo "❌ SDK $SDK_MAJOR no soportado. Usa SDK 48-53."
        exit 1
        ;;
esac

# 6. Actualizar react-native
# 6. ✅ CORREGIDO: Actualizar react-native
if grep -q '"react-native":' package.json; then
    sed -i.bak "s/\"react-native\": *\"[^\"]*\"/\"react-native\": \"$RN_VERSION\"/" package.json
    echo "✅ react-native actualizado a $RN_VERSION"
else
    if grep -q '"dependencies":' package.json; then
        awk -v pkg="react-native" -v ver="$RN_VERSION" '
        /"dependencies": {/ {
            print
            print "    \"" pkg "\": \"" ver "\","
            next
        } { print }
        ' package.json > package.json.tmp && mv package.json.tmp package.json
        echo "✅ react-native agregado como $RN_VERSION en dependencies"
    else
        echo "❌ No se encontró la sección 'dependencies' en package.json. Asegúrate de que exista."
        exit 1
    fi
fi

# 7. Actualizar @types/react
# 7. ✅ CORREGIDO: Actualizar @types/react
if grep -q '"@types/react":' package.json; then
    sed -i.bak "s/\"@types/react\": *\"[^\"]*\"/\"@types/react\": \"$TYPES_REACT_VERSION\"/" package.json
    echo "✅ @types/react actualizado a $TYPES_REACT_VERSION"
else
    if grep -q '"devDependencies":' package.json; then
        awk -v dep="@types/react" -v ver="$TYPES_REACT_VERSION" '
        /"devDependencies": {/ {
            print
            print "    \"" dep "\": \"" ver "\","
            next
        } { print }
        ' package.json > package.json.tmp && mv package.json.tmp package.json
        echo "✅ @types/react agregado como $TYPES_REACT_VERSION en devDependencies"
    else
        awk -v dep="@types/react" -v ver="$TYPES_REACT_VERSION" '
        /"dependencies": {/ {
            print
            print "  \"devDependencies\": {"
            print "    \"" dep "\": \"" ver "\""
            print "  },"
            next
        } { print }
        ' package.json > package.json.tmp && mv package.json.tmp package.json
        echo "✅ devDependencies creado y @types/react agregado como $TYPES_REACT_VERSION"
    fi
fi

# 8. Instalar dependencias
echo "📥 Instalando dependencias con --legacy-peer-deps..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias."
    exit 1
fi

# # 9. Alinear con Expo
# echo "⚙️ Ejecutando 'expo install'..."
# npx expo install

# if [ $? -ne 0 ]; then
#     echo "❌ Error al ejecutar expo install."
#     exit 1
# fi

# 10. ✅ Instalar expo-haptics si no está presente
if ! grep -q '"expo-haptics"' package.json; then
    echo "🔍 expo-haptics no encontrado. Instalando..."
    npx expo install expo-haptics
    if [ $? -ne 0 ]; then
        echo "❌ Error al instalar expo-haptics."
        exit 1
    fi
else
    echo "✅ expo-haptics ya está instalado."
fi

# 11. Limpiar caché
# echo "🧹 Limpiando caché de Metro..."
# npx expo start --clear

echo "✅ ¡TODO LISTO!"
echo "👉 Ejecutando eas build --platform all"

eas build --platform android