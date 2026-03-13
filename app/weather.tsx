// expo-location donne accès au GPS du téléphone
import * as Location from 'expo-location';
// useEffect : exécuter du code au chargement | useState : stocker des valeurs
import { useEffect, useState } from 'react';
// Composants natifs React Native
// TouchableOpacity = bouton cliquable personnalisable
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Couleurs du thème (light/dark) définies dans constants/theme.ts
import { Colors } from '@/constants/theme';
// Hook qui retourne 'light' ou 'dark' selon le mode du téléphone
import { useColorScheme } from '@/hooks/use-color-scheme';

import { LineChart } from 'react-native-chart-kit';

const largeur = Dimensions.get('window').width - 48;

// Clé API OpenWeatherMap
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;


// L'API gratuite donne 5 jours de prévisions (aujourd'hui + 4 suivants)
const MAX_DAY_OFFSET = 4;

type WeatherData = {
    city: string;
    temperature: number;
    description: string;
    humidity: number;
    feelsLike: number;
};

// ForecastSlot inclut maintenant la date pour pouvoir filtrer par jour
type ForecastSlot = {
    date: string;   // "YYYY-MM-DD"
    time: string;   // "14:00"
    temperature: number;
    description: string;
    windSpeed: number; // Ajout de la vitesse du vent
    windDirection: number; // Ajout de la direction du vent en degrés
};

// Retourne la date au format "YYYY-MM-DD" pour un décalage en jours donné
const getDateAtOffset = (offset: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
};

// Retourne un label lisible selon le décalage (Aujourd'hui, Demain, Lundi 12 mars...)
const getDayLabel = (offset: number): string => {
    if (offset === 0) return "Aujourd'hui";
    if (offset === 1) return 'Demain';
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

export default function Weather() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [weather, setWeather] = useState<WeatherData | null>(null);
    // Stocke TOUTES les prévisions (5 jours), pas seulement aujourd'hui
    const [allForecast, setAllForecast] = useState<ForecastSlot[]>([]);
    // Décalage en jours par rapport à aujourd'hui (0 = aujourd'hui, 1 = demain...)
    const [dayOffset, setDayOffset] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadWeather();
    }, []);

    // Valeur dérivée : filtre allForecast selon le jour sélectionné
    const forecast = allForecast.filter(slot => slot.date === getDateAtOffset(dayOffset));

    // Min/max calculés sur TOUS les jours — donne une échelle fixe et cohérente sur la semaine
    const allTemps = allForecast.map(s => s.temperature);
    const minTemp = allTemps.length > 0 ? Math.min(...allTemps) - 1 : 0;
    const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) + 1 : 30;

    const loadWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission de localisation refusée');
                setLoading(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            
            let weatherData = null;
            let forecastData = null;

            try {
                const response = await fetch (`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=fr`);
                weatherData = await response.json();
            } catch (e) {
                setError('Erreur lors de la récupération de la météo actuelle');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch (`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=fr`);
                forecastData = await response.json();
            } catch (e) {
                setError('Erreur lors de la récupération des prévisions');
                setLoading(false);
                return;
            }
            
            if (!weatherData || !forecastData) return;
            setWeather({
                city: weatherData.name,
                temperature: Math.round(weatherData.main.temp),
                description: weatherData.weather[0].description,
                humidity: weatherData.main.humidity,
                feelsLike: Math.round(weatherData.main.feels_like),
            });




            
            // On stocke TOUT sans filtrer par date
            const allSlots: ForecastSlot[] = forecastData.list.map((slot: any) => ({
                date: slot.dt_txt.split(' ')[0],                   // "YYYY-MM-DD"
                time: slot.dt_txt.split(' ')[1].substring(0, 5),  // "HH:MM"
                temperature: Math.round(slot.main.temp),
                description: slot.weather[0].description,
                windSpeed: slot.wind.speed * 3.6, // Vitesse du vent en km/h
                windDirection: slot.wind.deg, // Direction du vent en degrés
            }));



            
            setAllForecast(allSlots);

        } catch (e) {
            setError('Impossible de récupérer la météo');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                    Récupération de la météo...
                </Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            </View>
        );
    }

    const todayDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <ScrollView
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={styles.container}
        >
            {/* --- MÉTÉO ACTUELLE --- */}
            <Text style={[styles.city, { color: colors.text }]}>{weather?.city}</Text>
            <Text style={[styles.date, { color: colors.icon }]}>{todayDate}</Text>
            <Text style={[styles.temperature, { color: colors.tint }]}>
                {weather?.temperature}°C
            </Text>
            <Text style={[styles.description, { color: colors.text }]}>
                {weather?.description}
            </Text>
            <View style={styles.details}>
                <Text style={[styles.detail, { color: colors.icon }]}>
                    Ressenti : {weather?.feelsLike}°C
                </Text>
                <Text style={[styles.detail, { color: colors.icon }]}>
                    Humidité : {weather?.humidity}%
                </Text>
            </View>

            {/* --- PRÉVISIONS AVEC NAVIGATION PAR JOUR --- */}
            {allForecast.length > 0 && (
                <View style={styles.forecastSection}>

                    {/* Barre de navigation : flèche gauche | nom du jour | flèche droite */}
                    <View style={styles.dayNav}>
                        {/* Flèche gauche — désactivée si on est au jour 0 */}
                        <TouchableOpacity
                            onPress={() => setDayOffset(prev => prev - 1)}
                            disabled={dayOffset === 0}
                            style={[styles.arrow, dayOffset === 0 && styles.arrowDisabled]}
                        >
                            <Text style={[styles.arrowText, { color: colors.tint }]}>‹</Text>
                        </TouchableOpacity>

                        {/* Nom du jour sélectionné */}
                        <Text style={[styles.forecastTitle, { color: colors.text }]}>
                            {getDayLabel(dayOffset)}
                        </Text>

                        {/* Flèche droite — désactivée si on est au dernier jour disponible */}
                        <TouchableOpacity
                            onPress={() => setDayOffset(prev => prev + 1)}
                            disabled={dayOffset === MAX_DAY_OFFSET}
                            style={[styles.arrow, dayOffset === MAX_DAY_OFFSET && styles.arrowDisabled]}
                        >
                            <Text style={[styles.arrowText, { color: colors.tint }]}>›</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cartes des créneaux du jour sélectionné */}
                    {forecast.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {forecast.map((slot) => (
                                <View
                                    key={slot.time}
                                    style={[styles.slot, { borderColor: colors.icon }]}
                                >
                                    <Text style={[styles.slotTime, { color: colors.icon }]}>
                                        {slot.time}
                                    </Text>
                                    <Text style={[styles.slotTemp, { color: colors.tint }]}>
                                        {slot.temperature}°C
                                    </Text>
                                    <Text style={[styles.slotDesc, { color: colors.text }]}>
                                        {slot.description}
                                    </Text>
                                    <Text style={[styles.slotWind, { color: colors.icon }]}>
                                        {Math.round(slot.windSpeed)} km/h
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <Text style={[styles.detail, { color: colors.icon }]}>
                            Aucune donnée pour ce jour
                        </Text>
                    )}
                </View>
            )}

            {/* --- GRAPHIQUE TEMPÉRATURE --- */}
            {forecast.length > 0 && (
                <LineChart
                    data={{
                        labels: forecast.map((slot) => slot.time.replace(/^0/, '')),
                        datasets: [
                            { data: forecast.map((slot) => slot.temperature) },
                            // Dataset invisible qui force l'échelle Y sur toute la semaine
                            { data: [minTemp, maxTemp], color: () => 'rgba(0,0,0,0)', strokeWidth: 0, withDots: false },
                        ],
                    }}
                    width={largeur}
                    height={200}
                    chartConfig={{
                        backgroundColor: colors.background,
                        backgroundGradientFrom: colors.background,
                        backgroundGradientTo: colors.background,
                        decimalPlaces: 0,
                        color: (opacity = 1) => colorScheme === 'dark'
                            ? `rgba(255, 255, 255, ${opacity})`
                            : `rgba(10, 126, 164, ${opacity})`,
                        labelColor: (opacity = 1) => colorScheme === 'dark'
                            ? `rgba(255, 255, 255, ${opacity})`
                            : `rgba(17, 24, 28, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: '6', strokeWidth: '2', stroke: colors.tint },
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            )}
            <View style={[styles.arrowDirection]}>
                <Text style={[styles.arrowDescription]}>
                    Direction du vent
                </Text>
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 24,
        gap: 12,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    city: {
        fontSize: 36,
        fontWeight: 'bold',
        marginTop: 20,
    },
    temperature: {
        fontSize: 80,
        fontWeight: '200',
    },
    description: {
        fontSize: 20,
        textTransform: 'capitalize',
    },
    details: {
        marginTop: 8,
        gap: 8,
        alignItems: 'center',
    },
    detail: {
        fontSize: 16,
    },
    loadingText: {
        fontSize: 16,
        marginTop: 12,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
    },
    forecastSection: {
        width: '100%',
        marginTop: 32,
        gap: 12,
    },
    // Barre de navigation jours : flèches + titre centré
    dayNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    forecastTitle: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'capitalize',
        flex: 1,
        textAlign: 'center',
    },
    arrow: {
        padding: 8,
    },
    // Flèche grisée quand on ne peut plus naviguer
    arrowDisabled: {
        opacity: 0.2,
    },
    arrowText: {
        fontSize: 32,
        lineHeight: 32,
    },
    slot: {
        alignItems: 'center',
        padding: 12,
        marginRight: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
        minWidth: 90,
    },
    slotTime: {
        fontSize: 14,
        fontWeight: '600',
    },
    slotTemp: {
        fontSize: 22,
        fontWeight: '300',
    },
    slotDesc: {
        fontSize: 11,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    slotWind: {
        fontSize: 11,
        color: '#555',
    },
    date: {
        fontSize: 14,
        fontStyle: 'italic',
        letterSpacing: 0.5,
        textTransform: 'capitalize',
    },
    arrowDirection: {
        marginTop: 16,
        width: '100%',
    },
    arrowDescription: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    
});
