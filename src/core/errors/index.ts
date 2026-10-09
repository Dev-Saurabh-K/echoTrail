export type EchoTrailErrorCode =
  | 'MICROPHONE_PERMISSION_DENIED'
  | 'AUDIO_TOO_SHORT'
  | 'AUDIO_UNUSABLE'
  | 'MODEL_LOAD_FAILED'
  | 'INFERENCE_FAILED'
  | 'SPECIES_MAPPING_MISSING'
  | 'STORAGE_WRITE_FAILED'
  | 'REFERENCE_ASSET_MISSING'
  | 'UNKNOWN_ERROR';

export class EchoTrailError extends Error {
  readonly code: EchoTrailErrorCode;
  readonly recoverableAction?: string;

  constructor(code: EchoTrailErrorCode, message: string, recoverableAction?: string) {
    super(message);
    this.name = 'EchoTrailError';
    this.code = code;
    this.recoverableAction = recoverableAction;
  }
}

export function getFriendlyErrorMessage(code: EchoTrailErrorCode): { title: string; message: string; action: string } {
  switch (code) {
    case 'MICROPHONE_PERMISSION_DENIED':
      return {
        title: 'Microphone Access Required',
        message: 'EchoTrail needs microphone access to record bird sounds in the field. Recordings stay completely private on your device.',
        action: 'Enable in device settings or try one of the bundled demo bird calls below.',
      };
    case 'AUDIO_TOO_SHORT':
      return {
        title: 'Recording Too Brief',
        message: 'The recording was too short for the audio classifier to identify pitch rhythms. Aim for at least 3 to 10 seconds of birdsong.',
        action: 'Hold the record button longer while listening to the bird call.',
      };
    case 'AUDIO_UNUSABLE':
      return {
        title: 'Sound Unusable or Silent',
        message: 'The recorded audio had insufficient sound energy or high background noise without distinctive birdsong frequencies.',
        action: 'Move closer to the sound, shelter the mic from wind, or try again.',
      };
    case 'MODEL_LOAD_FAILED':
      return {
        title: 'Classifier Offline Error',
        message: 'The on-device classification model could not be initialized from local storage.',
        action: 'Restart the application to reload bundled model weights.',
      };
    case 'INFERENCE_FAILED':
      return {
        title: 'Identification Failed',
        message: 'An error occurred while evaluating acoustic characteristics on device.',
        action: 'Try recording again or test with a sample audio clip.',
      };
    case 'SPECIES_MAPPING_MISSING':
      return {
        title: 'Species Catalog Notice',
        message: 'The candidate prediction class is not found in the local species pack.',
        action: 'Check for updated species content packs in Settings.',
      };
    case 'STORAGE_WRITE_FAILED':
      return {
        title: 'Storage Error',
        message: 'Could not persist observation or audio to local storage.',
        action: 'Check available storage space on your device.',
      };
    case 'REFERENCE_ASSET_MISSING':
      return {
        title: 'Audio File Not Found',
        message: 'The reference call audio file is currently unavailable offline.',
        action: 'Try another species or restore bundled content.',
      };
    default:
      return {
        title: 'Unexpected Error',
        message: 'An unexpected issue occurred during processing.',
        action: 'Please try again.',
      };
  }
}
