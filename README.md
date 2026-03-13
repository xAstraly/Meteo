# Application Météo — React Native / Expo

Application mobile météo développée avec React Native et Expo. Elle affiche la météo en temps réel ainsi que les prévisions sur 5 jours à partir de la position GPS de l'utilisateur.

## Fonctionnalités

- Météo actuelle (température, ressenti, humidité, description)
- Prévisions par tranches de 3h sur 5 jours
- Graphique d'évolution de la température avec échelle fixe sur la semaine
- Vitesse et direction du vent
- Navigation entre les jours
- Support du mode clair / sombre

## Stack technique

- [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/) pour la navigation (file-based routing)
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) pour la géolocalisation
- [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit) pour les graphiques
- [OpenWeatherMap API](https://openweathermap.org/api) pour les données météo

## Installation

1. Cloner le projet et installer les dépendances

```bash
npm install
```

2. Créer un fichier `.env` à la racine avec ta clé API OpenWeatherMap

```
EXPO_PUBLIC_API_KEY=ta_clé_ici
```

3. Lancer l'application

```bash
npx expo start
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_KEY` | Clé API OpenWeatherMap (gratuite sur openweathermap.org) |
