// src/sounds/soundManager.js

import cardSlideSound from '../assets/sound/card-slide.ogg';
import cardShuffleSound from '../assets/sound/card-shuffle.ogg';
import cardPlacingSound from '../assets/sound/card-placing.ogg';
import cardPlacedSound from '../assets/sound/card-placed.ogg';
import cardFlipSound from '../assets/sound/card-flip.ogg';
import buttonClickSound from '../assets/sound/button-click.ogg';
import cardSetRemoving from '../assets/sound/card-set-removing.ogg';


let isMuted = false;
let soundQueue = [];
let isPlayingQueue = false;
let soundCooldown = {};
let currentAudioInstances = []; // Track active audio instances
let queueTimeoutId = null; // Track queue processing timeout

const playSound = (src, volume = 0.5) => {
  return new Promise((resolve) => {
    if (isMuted) {
      resolve();
      return;
    }
    
    const audio = new Audio(src);
    audio.volume = volume;
    
    // Add to active instances for cleanup
    currentAudioInstances.push(audio);
    
    const onEnded = () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onEnded);
      
      // Remove from active instances
      const index = currentAudioInstances.indexOf(audio);
      if (index > -1) {
        currentAudioInstances.splice(index, 1);
      }
      
      resolve();
    };
    
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onEnded);
    
    audio.play().catch(err => {
      console.warn('Sound play error:', err);
      // Remove from active instances on error
      const index = currentAudioInstances.indexOf(audio);
      if (index > -1) {
        currentAudioInstances.splice(index, 1);
      }
      resolve();
    });
  });
};

const processSoundQueue = async () => {
  if (isPlayingQueue || soundQueue.length === 0) return;
  
  isPlayingQueue = true;
  
  while (soundQueue.length > 0) {
    const { soundSrc, volume, delay, soundId } = soundQueue.shift();
    
    // Check if queue was cleared during processing
    if (soundQueue.length === 0 && !soundQueue.find(s => s.soundId === soundId)) {
      break;
    }
    
    // Check cooldown to prevent rapid repeated sounds
    const now = Date.now();
    if (soundCooldown[soundId] && (now - soundCooldown[soundId]) < 100) {
      continue;
    }
    
    soundCooldown[soundId] = now;
    
    // Add delay before playing sound
    if (delay > 0) {
      await new Promise(resolve => {
        queueTimeoutId = setTimeout(resolve, delay);
      });
    }
    
    // Check again if queue was cleared during delay
    if (soundQueue.length === 0) {
      break;
    }
    
    await playSound(soundSrc, volume);
    
    // Minimal gap between sounds
    await new Promise(resolve => {
      queueTimeoutId = setTimeout(resolve, 50);
    });
  }
  
  isPlayingQueue = false;
  queueTimeoutId = null;
};

const addSoundToQueue = (soundSrc, volume = 0.5, delay = 0, soundId = 'default') => {
  soundQueue.push({ soundSrc, volume, delay, soundId });
  processSoundQueue();
};

// Immediate play functions
const playImmediateSound = (src, volume = 0.5, soundId = 'immediate') => {
  if (isMuted) return;
  
  const now = Date.now();
  if (soundCooldown[soundId] && (now - soundCooldown[soundId]) < 100) {
    return;
  }
  
  soundCooldown[soundId] = now;
  
  const audio = new Audio(src);
  audio.volume = volume;
  
  // Add to active instances
  currentAudioInstances.push(audio);
  
  audio.addEventListener('ended', () => {
    const index = currentAudioInstances.indexOf(audio);
    if (index > -1) {
      currentAudioInstances.splice(index, 1);
    }
  });
  
  audio.play().catch(err => {
    console.warn('Sound play error:', err);
    const index = currentAudioInstances.indexOf(audio);
    if (index > -1) {
      currentAudioInstances.splice(index, 1);
    }
  });
};

// Export functions
export const playCardSlideSound = (useQueue = false, delay = 0) => {
  const soundId = `slide_${Date.now()}`;
  if (useQueue) {
    addSoundToQueue(cardSlideSound, 1, delay, soundId);
  } else {
    playImmediateSound(cardSlideSound, 1, 'slide');
  }
};

export const playShuffleSound = (useQueue = false, delay = 0) => {
  const soundId = `shuffle_${Date.now()}`;
  if (useQueue) {
    addSoundToQueue(cardShuffleSound, 1, delay, soundId);
  } else {
    playImmediateSound(cardShuffleSound, 1, 'shuffle');
  }
};

export const playCardPlacingSound = (useQueue = false, delay = 0) => {
  const soundId = `placing_${Date.now()}`;
  if (useQueue) {
    addSoundToQueue(cardPlacingSound, 1, delay, soundId);
  } else {
    playImmediateSound(cardPlacingSound, 1, 'placing');
  }
};

export const playCardPlacedSound = (useQueue = false, delay = 0) => {
  const soundId = `placed_${Date.now()}`;
  if (useQueue) {
    addSoundToQueue(cardPlacedSound, 1, delay, soundId);
  } else {
    playImmediateSound(cardPlacedSound, 1, 'placed');
  }
};

export const playCardFlipSound = (useQueue = false, delay = 0) => {
  const soundId = `flip_${Date.now()}`;
  if (useQueue) {
    addSoundToQueue(cardFlipSound, 1, delay, soundId);
  } else {
    playImmediateSound(cardFlipSound, 1, 'flip');
  }
};

export const buttonClickSoundFn = () => playImmediateSound(buttonClickSound, 1, 'button');
export const cardSetRemovingFn = () => playImmediateSound(cardSetRemoving, 1, 'button');

// Queue management with proper cleanup
export const clearSoundQueue = () => {
  soundQueue = [];
  soundCooldown = {};
  
  // Clear any pending timeouts
  if (queueTimeoutId) {
    clearTimeout(queueTimeoutId);
    queueTimeoutId = null;
  }
  
  // Stop all currently playing sounds
  currentAudioInstances.forEach(audio => {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      console.warn('Error stopping audio:', e);
    }
  });
  currentAudioInstances = [];
  
  isPlayingQueue = false;
};

export const stopAllSounds = () => {
  clearSoundQueue();
};

export const playMultipleSounds = (sounds) => {
  sounds.forEach((sound, index) => {
    const delay = index * 200;
    const soundId = `multi_${sound.type}_${index}`;
    addSoundToQueue(sound.src, 1, delay, soundId);
  });
};

// Mute controls
export const muteSound = () => { 
  isMuted = true; 
  stopAllSounds(); // Stop sounds when muted
};
export const unmuteSound = () => { isMuted = false; };
export const toggleMute = () => { 
  isMuted = !isMuted; 
  if (isMuted) {
    stopAllSounds();
  }
};
export const isSoundMuted = () => isMuted;