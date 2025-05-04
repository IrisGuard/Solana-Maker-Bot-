import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Καλώς ήρθατε στο CryptoSymphony',
    description: 'Η απόλυτη εφαρμογή για τη διαχείριση των κρυπτονομισμάτων σας και την αυτοματοποίηση των συναλλαγών σας.',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000',
  },
  {
    id: '2',
    title: 'Διαχειριστείτε το Πορτοφόλι σας',
    description: 'Συνδέστε το πορτοφόλι Solana σας και παρακολουθήστε τα υπόλοιπά σας σε πραγματικό χρόνο.',
    image: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?q=80&w=1000',
  },
  {
    id: '3',
    title: 'Αυτοματοποιήστε τις Συναλλαγές σας',
    description: 'Χρησιμοποιήστε το bot μας για να αυτοματοποιήσετε τις συναλλαγές σας και να αυξήσετε τα κέρδη σας.',
    image: 'https://images.unsplash.com/photo-1639152201720-5e536d254d81?q=80&w=1000',
  },
  {
    id: '4',
    title: 'Έτοιμοι να Ξεκινήσετε;',
    description: 'Πατήστε το κουμπί για να ξεκινήσετε την περιπέτειά σας στον κόσμο των κρυπτονομισμάτων!',
    image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=1000',
  },
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // Complete onboarding
      onComplete();
    }
  };

  const handleSkip = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        {currentSlideIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Παράλειψη</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.slideContainer}>
        <Image
          source={{ uri: slides[currentSlideIndex].image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay} />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slides[currentSlideIndex].title}</Text>
          <Text style={styles.description}>{slides[currentSlideIndex].description}</Text>
        </View>
      </View>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentSlideIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentSlideIndex === slides.length - 1 ? 'Ξεκινήστε' : 'Επόμενο'}
        </Text>
        <ChevronRight size={20} color={Colors.dark.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  skipContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    color: Colors.dark.text,
    fontSize: 16,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  textContainer: {
    padding: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.inactive,
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: Colors.dark.accent,
    width: 20,
  },
  nextButton: {
    backgroundColor: Colors.dark.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 40,
    marginBottom: 40,
  },
  nextButtonText: {
    color: Colors.dark.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});