export const Theme = {
  colors: {
    background: '#F8F7FA',
    surface: '#FFFFFF',
    input: '#F6F4F8',
    text: '#28212F',
    muted: '#675E70',
    primary: '#C72B60',
    primarySoft: '#FCE8EF',
    lavender: '#EEEAF8',
    lavenderText: '#674898',
    mint: '#E5F5EE',
    border: '#E9E5EC',
    success: '#187456',
    warning: '#D58B28',
    warningSoft: '#FFF2DE',
    warningText: '#825214',
    placeholder: '#756A7D',
    hero: '#302238',
    heroAccent: '#5A3C59',
    heroStroke: '#91708D',
    heroTrack: '#66516A',
    heroMuted: '#E9DDEB',
    heroProgress: '#FFA0BC',
    onPrimary: '#FFFFFF',
  },
  gradients: {
    hero: ['#302238', '#65345D', '#A93B70'] as const,
    rose: ['#D3396B', '#C72B60'] as const,
    budget: ['#302238', '#65345D', '#A93B70'] as const,
    soft: ['#FFF4F7', '#F0EBFB'] as const,
    tab: ['#302238', '#52304E'] as const,
  },
  radius: { sm: 12, md: 14, lg: 18, xl: 20, pill: 100 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 },
  type: { micro: 13, caption: 14, label: 15, body: 16, section: 18, page: 24 },
};

export const Fonts = {
  sans: 'Prompt_400Regular',
  sansMedium: 'Prompt_500Medium',
  sansSemiBold: 'Prompt_600SemiBold',
  sansBold: 'Prompt_700Bold',
  display: 'Prompt_600SemiBold',
  displayBold: 'Prompt_700Bold',
};

export const Colors = { light: { text: Theme.colors.text, background: Theme.colors.background, tint: Theme.colors.primary, icon: Theme.colors.muted, tabIconDefault: Theme.colors.muted, tabIconSelected: Theme.colors.primary }, dark: { text: Theme.colors.text, background: Theme.colors.background, tint: Theme.colors.primary, icon: Theme.colors.muted, tabIconDefault: Theme.colors.muted, tabIconSelected: Theme.colors.primary } };
