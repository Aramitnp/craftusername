import React from "react";
import styles from "./ui.module.css";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "Available" | "Taken" | "Unknown";
}

export function Badge({ status, className = "", ...props }: BadgeProps) {
  let statusClass = styles.badgeUnknown;
  if (status === "Available") statusClass = styles.badgeAvailable;
  if (status === "Taken") statusClass = styles.badgeTaken;

  return (
    <span className={`${styles.badge} ${statusClass} ${className}`} {...props}>
      {status}
    </span>
  );
}
