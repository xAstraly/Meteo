import { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Form() {

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const [nom, setNom] = useState('')
    const [prenom, setPrenom] = useState('')

    const onchangeNom = (text: string) => {
        setNom(text)
    }

    const onchangePrenom = (text: string) => {
        setPrenom(text)
    }

    const handleSubmit = () => {
        alert(`Nom: ${nom}, Prenom: ${prenom}`)
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nom"
                placeholderTextColor={colors.icon}
                value={nom}
                onChangeText={onchangeNom}
            />
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Prénom"
                placeholderTextColor={colors.icon}
                value={prenom}
                onChangeText={onchangePrenom}
            />
            <Button title="Envoyer" onPress={handleSubmit} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        gap: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
    },
})
