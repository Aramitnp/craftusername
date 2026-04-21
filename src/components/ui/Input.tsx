"use client";

import React from "react";
import styles from "./ui.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export function Input({ wrapperClassName = "", className = "", ...props }: InputProps) {
  return (
    <div className={`${styles.inputWrapper} ${wrapperClassName}`}>
      <input className={`${styles.input} ${className}`} {...props} />
    </div>
  );
}
