// app/components/GamificationHeader.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, ProgressBar } from 'react-native-paper';
import useUserData from '../hooks/useUserData'; // Corrected import path
import { LinearGradient } from 'expo-linear-gradient';

/**
 * A header component that displays user's gamification stats like level, points, and streak.
 * @param {Object} userData - The user's gamification data from Firestore.
 */
const GamificationHeader = ({ userData }) => {
    const theme = useTheme();
    const { level, pointsInCurrentLevel, progress, streak } = useUserData(userData);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[`${theme.colors.primary}99`, `${theme.colors.primary}4D`]}
                style={styles.gamificationBar}
            >
                {/* Level and Progress Block */}
                <View style={styles.statBlock}>
                    <Text style={styles.statValue}>LVL {level}</Text>
                    <ProgressBar progress={progress} color="#fff" style={styles.progressBar} />
                    <Text style={styles.statLabel}>{pointsInCurrentLevel} / 100 PTS</Text>
                </View>
                {/* Day Streak Block */}
                <View style={styles.statBlock}>
                    <Text style={styles.statValue}>🔥 {streak}</Text>
                    <Text style={styles.statLabel}>Day Streak</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginTop: 8,
    },
    gamificationBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 16,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    statBlock: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
    },
    progressBar: {
        width: '80%',
        height: 8,
        borderRadius: 4,
        marginTop: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
});

export default React.memo(GamificationHeader);