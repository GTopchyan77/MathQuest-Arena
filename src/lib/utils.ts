import { clsx, type ClassValue } from "clsx";

export function cx(...classes: ClassValue[]) {
  return clsx(classes);
}
