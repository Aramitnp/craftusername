"use client";

import React from "react";
import styles from "./ui.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  let variantClass = styles.btnPrimary;
  if (variant === "secondary") variantClass = styles.btnSecondary;
  if (variant === "ghost") variantClass = styles.btnGhost;

  return (
    <button className={`${styles.button} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
