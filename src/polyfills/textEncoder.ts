import { TextDecoder, TextEncoder } from 'fast-text-encoding';
import { polyfillGlobal } from 'react-native/Libraries/Utilities/PolyfillFunctions';

if (__DEV__) {
    console.warn('Polyfilling TextDecoder & TextEncoder for Hermes');
}
polyfillGlobal("TextDecoder", () => TextDecoder);
polyfillGlobal("TextEncoder", () => TextEncoder);
