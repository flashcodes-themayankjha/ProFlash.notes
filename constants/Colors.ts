/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  calendar: {
    blue: '#29406c',
    coral: '#fe95a0',
    done: '#3ec28f',
    inProgress: '#fe95a0',
    blur: '#f9fbfe',
    background: '#f7f7fa',
    text: '#374771',
    subtext: '#a1aec4',
    highlight: '#f69c51',
    separator: '#d3d8ec',
    card: '#f7f7fa',
    white: '#fff',
  }
};
