import type React from "react";

// Shared inline styles for the auth pages. Colours come from the `.ll-auth`
// scope in globals.css, which AuthShell applies.

export const cardStyle: React.CSSProperties = {
  background: "var(--ll-auth-card)",
  border: "1px solid var(--ll-auth-line-soft)",
  borderRadius: 24,
  padding: "40px 36px",
  boxShadow: "0 30px 70px -24px var(--ll-auth-shadow)",
  overflow: "hidden",
  position: "relative",
};

// The 7px brand-gradient strip along the top of every design screen.
export const cardStripStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 7,
  background: "var(--ll-auth-grad)",
};

export const headingStyle: React.CSSProperties = {
  fontFamily: "var(--ll-font-display)",
  fontWeight: 800,
  fontSize: 26,
  letterSpacing: "-.025em",
  color: "var(--ll-auth-text)",
  margin: "0 0 8px",
};

export const subTextStyle: React.CSSProperties = {
  fontFamily: "var(--ll-font-body)",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--ll-auth-text-2)",
  margin: "0 0 24px",
};

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--ll-font-body)",
  fontWeight: 700,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: ".12em",
  color: "var(--ll-auth-text-2)",
  marginBottom: 8,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  paddingLeft: 40,
  paddingRight: 16,
  background: "var(--ll-auth-field)",
  border: "1px solid var(--ll-auth-line)",
  borderRadius: 12,
  color: "var(--ll-auth-text)",
  fontFamily: "var(--ll-font-body)",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s",
};

export const iconStyle: React.CSSProperties = {
  position: "absolute",
  left: 14,
  top: "50%",
  transform: "translateY(-50%)",
  width: 15,
  height: 15,
  color: "var(--ll-auth-muted)",
  pointerEvents: "none",
};

export const focusIn = (e: React.FocusEvent<HTMLElement>) =>
  (e.target.style.borderColor = "var(--ll-auth-focus)");
export const focusOut = (e: React.FocusEvent<HTMLElement>) =>
  (e.target.style.borderColor = "var(--ll-auth-line)");

export function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: 48,
    background: "var(--ll-accent)",
    color: "var(--ll-accent-ink)",
    border: "none",
    borderRadius: 12,
    fontFamily: "var(--ll-font-body)",
    fontWeight: 700,
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: disabled ? "none" : "0 8px 24px -8px var(--ll-auth-glow)",
    transition: "opacity .2s, transform .2s",
  };
}

export const ghostButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--ll-auth-muted)",
  fontSize: 13,
  fontFamily: "var(--ll-font-body)",
  cursor: "pointer",
  padding: 0,
  transition: "color .2s",
};

export const linkStyle: React.CSSProperties = {
  color: "var(--ll-accent)",
  fontWeight: 700,
  textDecoration: "none",
};

export const errorStyle: React.CSSProperties = {
  fontFamily: "var(--ll-font-body)",
  fontSize: 13,
  color: "var(--ll-auth-error)",
  textAlign: "center",
  margin: 0,
};
