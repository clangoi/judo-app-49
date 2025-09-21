// src/components/Icon.tsx
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

// Obtenemos el tipo de 'name' directamente del componente MaterialIcons
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon = ({ name, size = 24, color = '#000' }: IconProps) => {
  return <MaterialIcons name={name} size={size} color={color} />;
};