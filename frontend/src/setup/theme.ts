import type { ThemeConfig } from 'antd';

// The single source of truth for the app's look. antd derives ~10 shades
// (hover, active, disabled, tinted backgrounds) from colorPrimary alone, so
// changing the brand colour is a one-line edit here.
//
// Module CSS files stay layout-only — no colours, radii or fonts there.
export const appTheme: ThemeConfig = {
  cssVar: true,
  token: {
    colorPrimary: '#4338ca',
    colorInfo: '#4338ca',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorError: '#dc2626',

    colorTextBase: '#1c1917',
    colorBgBase: '#ffffff',
    // Deliberately a few steps darker than the card's white, so a surface
    // sitting on it reads as raised rather than blending in.
    colorBgLayout: '#f0efed',
    colorBorder: '#e7e5e4',

    borderRadius: 10,
    controlHeight: 44,
    boxShadowTertiary: '0 1px 2px rgba(28, 25, 23, 0.04), 0 10px 28px rgba(28, 25, 23, 0.08)',
    fontSize: 15,
    lineHeight: 1.6,
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  components: {
    Button: {
      fontWeight: 600,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Input: {
      paddingInline: 14,
    },
    Form: {
      // antd's default 24 makes a five-field form enormous and sparse.
      itemMarginBottom: 16,
      verticalLabelPadding: '0 0 4px',
    },
    Card: {
      // antd's 24 is tight once a card is wide enough to hold a form.
      bodyPadding: 32,
    },
  },
};
