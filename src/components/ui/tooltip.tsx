// Componente simple de Tooltip Provider
// En producción, se podría usar una librería como @radix-ui/react-tooltip

import { ReactNode } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}
